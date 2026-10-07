// Conexión con el modelo. Solo lee texto que va llegando: no hay herramientas ni funciones que el modelo pueda llamar.
// Mismos proveedores que el asistente del CRM (assistant-service):
//   openai-compat  Ollama u otro servidor con formato OpenAI (por defecto, el gemma4:12b del cluster; sin costo)
//   anthropic      Claude por API (necesita LLM_API_KEY)
//   mock           respuesta fija, para probar la pantalla sin modelo
// Cada uno entrega los trozos de texto con `for await (const trozo of streamChat(...))`.

/** Lee una respuesta con formato "server-sent events" y entrega el JSON de cada línea `data:`. */
export async function* sseData(response) {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let idx;
    while ((idx = buffer.search(/\r?\n/)) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(buffer[idx] === "\r" ? idx + 2 : idx + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        yield JSON.parse(data);
      } catch {
        // línea a medias o ajena: se ignora
      }
    }
  }
}

async function failIfBad(res, provider) {
  if (res.ok) return;
  // el cuerpo del error NO se reenvía al visitante (puede traer detalles internos); solo el código
  throw new Error(`${provider} respondió ${res.status}`);
}

async function* openaiCompat({ baseUrl, model, apiKey, system, messages, maxTokens, signal }) {
  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  await failIfBad(res, "El modelo");
  for await (const ev of sseData(res)) {
    const text = ev?.choices?.[0]?.delta?.content;
    if (typeof text === "string" && text) yield text;
  }
}

async function* anthropic({ baseUrl, model, apiKey, system, messages, maxTokens, signal }) {
  const res = await fetch(`${(baseUrl || "https://api.anthropic.com").replace(/\/+$/, "")}/v1/messages`, {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", "x-api-key": apiKey ?? "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: maxTokens, stream: true, system, messages }),
  });
  await failIfBad(res, "El modelo");
  for await (const ev of sseData(res)) {
    if (ev?.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) yield ev.delta.text;
  }
}

async function* mock({ messages }) {
  const last = messages[messages.length - 1]?.content ?? "";
  const reply = `(respuesta de prueba) Recibí tu pregunta: «${last.slice(0, 80)}». Aquí el asistente real contestaría con la información del producto.`;
  for (const word of reply.split(/(?<=\s)/)) {
    await new Promise((r) => setTimeout(r, 15));
    yield word;
  }
}

export function streamChat(opts) {
  switch (opts.provider) {
    case "openai-compat":
      return openaiCompat(opts);
    case "anthropic":
      return anthropic(opts);
    case "mock":
      return mock(opts);
    default:
      throw new Error(`proveedor desconocido: ${opts.provider}`);
  }
}
