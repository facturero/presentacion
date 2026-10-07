// Servicio de chat de la landing: un solo endpoint, POST /api/chat, que contesta dudas del producto.
// NO usa base de datos, NO guarda conversaciones (ni en disco ni en logs), NO tiene herramientas y NO llama a ningún
// otro sistema: lo único que hace hacia afuera es pedirle texto al modelo.
//
// Protocolo de respuesta (una línea JSON por evento, application/x-ndjson):
//   {"t":"d","v":"texto"}   trozo de la respuesta
//   {"t":"ping"}            latido cada 15 s mientras el modelo "piensa" (un modelo local en frío puede tardar; sin
//                           datos, Cloudflare corta la conexión a los ~100 s)
//   {"t":"done"}            fin
//   {"t":"error","v":"..."} falló a mitad (mensaje amable, nunca detalles internos)
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { LIMITS, validateMessages, buildSystemPrompt, RateLimiter, Gate, clientIp, splitSections, selectKnowledge } from "./core.mjs";
import { streamChat } from "./providers.mjs";

const MSG = {
  busy: "Estamos atendiendo a varias personas a la vez. Inténtalo de nuevo en unos segundos.",
  rate: "Has hecho muchas preguntas seguidas. Espera un momento e inténtalo otra vez.",
  fail: "No pude responder ahora mismo. Puedes escribirnos y te ayudamos.",
};

export function createApp(config) {
  const limiter = config.limiter ?? new RateLimiter({ perMinute: config.perMinute, perDay: config.perDay });
  const gate = config.gate ?? new Gate(config.maxConcurrent ?? 2);
  const sections = splitSections(config.knowledge);
  const log = config.log ?? ((...a) => console.log(...a));

  const json = (res, status, obj, extra = {}) => {
    res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra });
    res.end(JSON.stringify(obj));
  };

  async function readBody(req) {
    const chunks = [];
    let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > LIMITS.maxBodyBytes) throw Object.assign(new Error("grande"), { status: 413 });
      chunks.push(c);
    }
    return Buffer.concat(chunks).toString("utf8");
  }

  return http.createServer(async (req, res) => {
    const url = (req.url ?? "").split("?")[0];
    if (req.method === "GET" && url === "/healthz") return json(res, 200, { ok: true });
    if (url !== "/api/chat") return json(res, 404, { error: "No encontrado." });
    if (req.method !== "POST") return json(res, 405, { error: "Método no permitido." }, { allow: "POST" });
    if (!String(req.headers["content-type"] ?? "").includes("application/json")) {
      return json(res, 415, { error: "Formato no válido." });
    }

    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch (e) {
      return json(res, e.status === 413 ? 413 : 400, { error: e.status === 413 ? "Mensaje demasiado grande." : "Petición no válida." });
    }
    const v = validateMessages(body);
    if (!v.ok) return json(res, 400, { error: v.error });

    // Solo viaja lo relevante a lo último que preguntó el visitante (las dos últimas preguntas, para entender un «¿y eso cuánto cuesta?»)
    const pregunta = v.messages.filter((m) => m.role === "user").slice(-2).map((m) => m.content).join(" ");
    const system = buildSystemPrompt(selectKnowledge(sections, pregunta, { budget: config.knowledgeBudget ?? 4800 }), config.contactEmail);

    const rate = limiter.check(clientIp(req.headers, req.socket.remoteAddress));
    if (!rate.ok) return json(res, 429, { error: MSG.rate }, { "retry-after": String(rate.retryAfter) });
    if (!gate.tryEnter()) return json(res, 503, { error: MSG.busy }, { "retry-after": "5" });

    res.writeHead(200, {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no", // nginx no debe retener los trozos
    });
    const send = (obj) => !res.writableEnded && res.write(JSON.stringify(obj) + "\n");

    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(new Error("tiempo agotado")), config.timeoutMs);
    const heartbeat = setInterval(() => send({ t: "ping" }), config.heartbeatMs ?? 15_000);
    // si el visitante cierra la pestaña, se corta la petición al modelo: no se gasta cómputo en balde
    res.on("close", () => abort.abort(new Error("cerrado")));

    let sent = 0;
    try {
      for await (const piece of streamChat({
        provider: config.provider,
        baseUrl: config.baseUrl,
        model: config.model,
        apiKey: config.apiKey,
        system,
        messages: v.messages,
        maxTokens: config.maxTokens,
        signal: abort.signal,
      })) {
        send({ t: "d", v: piece });
        sent += piece.length;
        if (sent > config.maxOutputChars) break; // tope duro de salida, por si el modelo no respeta max_tokens
      }
      send({ t: "done" });
    } catch (err) {
      // se registra la causa técnica, NUNCA el contenido de la conversación
      if (!abort.signal.aborted || abort.signal.reason?.message === "tiempo agotado") {
        log(`[chat] error: ${err?.message ?? err}`);
        send({ t: "error", v: MSG.fail });
      }
    } finally {
      clearTimeout(timer);
      clearInterval(heartbeat);
      gate.leave();
      res.end();
    }
  });
}

export function configFromEnv(env = process.env) {
  // En la imagen vive junto al servidor (/app/chat/knowledge.json); en desarrollo, tras `npm run build`, en dist/.
  const junto = fileURLToPath(new URL("./knowledge.json", import.meta.url));
  const enDist = fileURLToPath(new URL("../dist/knowledge.json", import.meta.url));
  const file = env.KNOWLEDGE_FILE ?? (existsSync(junto) ? junto : enDist);
  const k = JSON.parse(readFileSync(file, "utf8"));
  const num = (v, d) => (Number.isFinite(Number(v)) && v !== undefined && v !== "" ? Number(v) : d);
  return {
    knowledge: k.text,
    contactEmail: env.CONTACT_EMAIL ?? k.contactEmail,
    provider: env.LLM_PROVIDER ?? "openai-compat",
    baseUrl: env.LLM_BASE_URL ?? "http://ollama:11434/v1",
    model: env.LLM_MODEL ?? "gemma4:12b",
    apiKey: env.LLM_API_KEY || undefined,
    timeoutMs: num(env.LLM_TIMEOUT_MS, 150_000),
    maxTokens: num(env.LLM_MAX_TOKENS, 400),
    maxOutputChars: num(env.MAX_OUTPUT_CHARS, 2500),
    perMinute: num(env.RATE_PER_MINUTE, 8),
    perDay: num(env.RATE_PER_DAY, 80),
    maxConcurrent: num(env.MAX_CONCURRENT, 2),
  };
}

// Arranque normal (no al importarlo desde las pruebas)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = configFromEnv();
  const port = Number(process.env.PORT ?? 3000);
  // Escucha en 127.0.0.1: solo el nginx del mismo pod (que proxea /api/) puede llegar aquí.
  createApp(config).listen(port, process.env.HOST ?? "127.0.0.1", () =>
    console.log(`[chat] escuchando en :${port} · proveedor ${config.provider} · modelo ${config.model}`),
  );
}
