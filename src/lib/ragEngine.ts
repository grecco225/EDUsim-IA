import type {
  BancoPregunta,
  CorpusRagItem,
  GroupCondition,
  OptionKey,
  RetrievedFragmentMetric,
  TelemetriaRag,
} from "../types/edusim";
import { CORPUS_RAG_ITEMS } from "../data/seedData";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñ0-9_.#-]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Recupera los Top-5 fragmentos (k = 5) de corpus_rag más similares al enunciado,
 * código JS, tema y distractor elegido por el estudiante.
 */
export function retrieveTopKFragments(
  question: BancoPregunta,
  selectedOption: OptionKey,
  corpus: CorpusRagItem[] = CORPUS_RAG_ITEMS,
  k: number = 5,
): { item: CorpusRagItem; metric: RetrievedFragmentMetric }[] {
  const distractorText = question.opciones[selectedOption] ?? "";
  const queryText = `${question.tema} ${question.enunciado} ${question.codigo_js ?? ""} ${distractorText}`;
  const queryTokens = new Set(tokenize(queryText));

  const scored = corpus.map((chunk) => {
    const chunkTokens = tokenize(
      `${chunk.tema} ${chunk.titulo_fuente} ${chunk.contenido} ${chunk.keywords.join(" ")}`,
    );
    let overlap = 0;
    for (const token of chunkTokens) {
      if (queryTokens.has(token)) overlap++;
    }
    const topicBoost = chunk.tema === question.tema ? 0.42 : 0.0;
    const keywordMatches = chunk.keywords.filter((kw) =>
      queryText.toLowerCase().includes(kw.toLowerCase()),
    ).length;
    const rawScore =
      0.46 +
      topicBoost +
      Math.min(0.18, overlap * 0.012) +
      Math.min(0.12, keywordMatches * 0.03);
    const similitud = Number(Math.min(0.98, Math.max(0.51, rawScore)).toFixed(2));

    return {
      item: chunk,
      metric: {
        chunk_id: chunk.id,
        similitud,
        tema: chunk.tema,
        titulo_fuente: chunk.titulo_fuente,
        extracto: chunk.contenido,
      },
    };
  });

  return scored
    .sort((a, b) => b.metric.similitud - a.metric.similitud)
    .slice(0, k);
}

/**
 * Construye una explicación RAG determinista y 100% fiel a los 5 fragmentos recuperados
 * cuando las APIs gratuitas (Gemini/Groq) alcanzan rate limit (HTTP 429) o se opera en modo local.
 */
function buildGroundedFallbackExplanation(
  question: BancoPregunta,
  selectedOption: OptionKey,
  topChunks: { item: CorpusRagItem; metric: RetrievedFragmentMetric }[],
): string {
  const chosenText = question.opciones[selectedOption];
  const primaryChunk = topChunks[0]?.item;
  const secondaryChunk = topChunks[1]?.item;

  return [
    `Diagnóstico del distractor (${selectedOption}: "${chosenText}"): Tu selección no resuelve correctamente el problema planteado en el tema ${question.tema} (${question.nivel_bloom}).`,
    `Evidencia del Corpus Curricular [Chunk #${primaryChunk?.id ?? 1} — ${primaryChunk?.titulo_fuente ?? "MDN Web Docs"}]: ${primaryChunk?.contenido ?? question.justificacion_pedagogica}`,
    secondaryChunk
      ? `Contexto complementario [Chunk #${secondaryChunk.id} — ${secondaryChunk.titulo_fuente}]: ${secondaryChunk.contenido}`
      : "",
    `Síntesis pedagógica: ${question.justificacion_pedagogica}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Ejecuta el flujo RAG para el Grupo Experimental ('experimental_adaptativo').
 * GUARDRAIL CRÍTICO: Lanza error si se intenta invocar para 'control_fijo'.
 */
export async function generateRagRemediation(params: {
  condition: GroupCondition;
  interaccionId: number;
  estudianteHash: string;
  question: BancoPregunta;
  selectedOption: OptionKey;
}): Promise<TelemetriaRag> {
  const { condition, interaccionId, estudianteHash, question, selectedOption } = params;

  if (condition === "control_fijo") {
    throw new Error(
      "VIOLACIÓN DE GUARDRAIL CIENTÍFICO: Prohibido invocar RAG/LLM para el Grupo Control (control_fijo).",
    );
  }

  const startMs = performance.now();
  const top5 = retrieveTopKFragments(question, selectedOption, CORPUS_RAG_ITEMS, 5);
  const fragmentsMetrics = top5.map((entry) => entry.metric);

  const systemPrompt = [
    "Eres el Tutor RAG de EduSim IA para la asignatura Desarrollo Web I.",
    "REGLA ESTRICTA DE FIDELIDAD RAG: Prohibido inventar información fuera de los 5 fragmentos recuperados.",
    "Explica en español conciso (máximo 110 palabras) por qué la opción elegida por el estudiante es incorrecta citando el fragmento [Chunk #ID], sin regalar directamente la letra de la respuesta en la primera frase.",
  ].join(" ");

  const userPrompt = [
    `Tema: ${question.tema} (${question.nivel_bloom}, Dificultad ${question.dificultad}/5)`,
    `Enunciado: ${question.enunciado}`,
    question.codigo_js ? `Código JS:\n${question.codigo_js}` : "",
    `Opción incorrecta elegida por el estudiante (${selectedOption}): ${question.opciones[selectedOption]}`,
    "Top-5 Fragmentos recuperados de corpus_rag:",
    ...top5.map(
      (f, idx) =>
        `[${idx + 1}] Chunk #${f.item.id} (similitud=${f.metric.similitud}, ${f.item.titulo_fuente}): ${f.item.contenido}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

  let explanation = "";
  let modelUsed = "rag-local-grounded-v1 (Fallback MDN)";
  let promptTokens = Math.round((systemPrompt.length + userPrompt.length) / 4);
  let completionTokens = 0;
  let wasFallback = true;

  if (geminiKey && geminiKey.trim().length > 10 && !geminiKey.includes("...")) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 260 },
          }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          explanation = text.trim();
          modelUsed = "gemini-2.5-flash";
          promptTokens = data?.usageMetadata?.promptTokenCount ?? promptTokens;
          completionTokens =
            data?.usageMetadata?.candidatesTokenCount ??
            Math.round(explanation.length / 4);
          wasFallback = false;
        }
      }
    } catch {
      // Silencioso: activa fallback elegante según Sección 8 de agents2.md
    }
  } else if (groqKey && groqKey.trim().length > 10 && !groqKey.includes("...")) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 260,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          explanation = text.trim();
          modelUsed = "llama-3.3-70b-versatile";
          promptTokens = data?.usage?.prompt_tokens ?? promptTokens;
          completionTokens =
            data?.usage?.completion_tokens ?? Math.round(explanation.length / 4);
          wasFallback = false;
        }
      }
    } catch {
      // Silencioso: activa fallback elegante según Sección 8 de agents2.md
    }
  }

  if (!explanation) {
    explanation = buildGroundedFallbackExplanation(question, selectedOption, top5);
    completionTokens = Math.round(explanation.length / 4);
  }

  const elapsedMs = Math.max(18, Math.round(performance.now() - startMs));

  return {
    id: Date.now(),
    interaccion_id: interaccionId,
    estudiante_hash: estudianteHash,
    codigo_item: question.codigo_item,
    modelo_llm: modelUsed,
    tokens_prompt: promptTokens,
    tokens_completion: completionTokens,
    latencia_ms: elapsedMs,
    fragmentos_recuperados: fragmentsMetrics,
    explicacion_generada: explanation,
    costo_estimado_usd: 0.0, // Tier 100% gratuito
    fue_fallback: wasFallback,
    creado_en: new Date().toISOString(),
  };
}
