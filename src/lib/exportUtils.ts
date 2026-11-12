import type {
  BancoPregunta,
  BitacoraTrazabilidad,
  EncuestaUsabilidad,
  Participante,
  PerfilDominio,
  StudentScientificSummary,
  TelemetriaRag,
} from "../types/edusim";
import {
  ALGORITHM_VERSION,
  calculateUpdatedMastery,
  INITIAL_MASTERY,
  ORDERED_TOPICS,
} from "./mathEngine";
import { retrieveTopKFragments } from "./ragEngine";

export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  triggerDownload(filename, blob);
}

export function downloadCsvFile(
  filename: string,
  rows: Record<string, unknown>[],
): void {
  if (rows.length === 0) {
    const emptyBlob = new Blob(["Sin registros para exportar\n"], {
      type: "text/csv;charset=utf-8;",
    });
    triggerDownload(filename, emptyBlob);
    return;
  }

  const headers = Object.keys(rows[0]);
  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const raw =
      typeof val === "object" ? JSON.stringify(val) : String(val);
    if (raw.includes(",") || raw.includes('"') || raw.includes("\n")) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];

  // BOM UTF-8 para compatibilidad directa con Excel, R, Python y SPSS
  const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(filename, blob);
}

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera una simulación empírica realista del piloto cuasiexperimental para los 10 participantes
 * (EST-001 a EST-005 en experimental_adaptativo y EST-006 a EST-010 en control_fijo),
 * respetando todas las fórmulas matemáticas de actualización de dominio, pretest, práctica,
 * remediación RAG, postest y encuesta de usabilidad.
 */
export function generatePilotSimulationData(params: {
  participants: Participante[];
  questions: BancoPregunta[];
}): {
  participants: Participante[];
  profiles: PerfilDominio[];
  logs: BitacoraTrazabilidad[];
  ragLogs: TelemetriaRag[];
  surveys: EncuestaUsabilidad[];
} {
  const { participants, questions } = params;
  const pretestItems = questions.filter((q) => q.tipo_uso === "pretest");
  const postestItems = questions.filter((q) => q.tipo_uso === "postest");
  const practiceItems = questions.filter((q) => q.tipo_uso === "practica_adaptativa");

  const updatedParticipants: Participante[] = [];
  const updatedProfiles: PerfilDominio[] = [];
  const logs: BitacoraTrazabilidad[] = [];
  const ragLogs: TelemetriaRag[] = [];
  const surveys: EncuestaUsabilidad[] = [];

  let logId = 1;
  let ragId = 1;
  let profileId = 1;

  // Tasas base deterministas por estudiante para reproducibilidad científica
  const preRates = [0.38, 0.50, 0.38, 0.25, 0.50, 0.38, 0.50, 0.38, 0.25, 0.50];
  const postRates = [0.88, 0.88, 0.75, 0.75, 1.00, 0.63, 0.63, 0.50, 0.50, 0.63];

  participants.forEach((p, idx) => {
    const isExperimental = p.condicion_grupo === "experimental_adaptativo";
    const preTarget = preRates[idx % preRates.length];
    const postTarget = postRates[idx % postRates.length];

    const masteryByTopic: Record<string, number> = {};
    for (const t of ORDERED_TOPICS) {
      masteryByTopic[t] = INITIAL_MASTERY;
    }

    // 1. Pretest (8 ítems)
    const preThreshold = Math.round(preTarget * pretestItems.length);
    pretestItems.forEach((q, qIdx) => {
      const correct = qIdx < preThreshold;
      const prevD = masteryByTopic[q.tema];
      const nextD = calculateUpdatedMastery(prevD, q.dificultad, correct);
      masteryByTopic[q.tema] = nextD;

      logs.push({
        id: logId++,
        estudiante_hash: p.estudiante_hash,
        condicion_grupo: p.condicion_grupo,
        codigo_item: q.codigo_item,
        tipo_actividad: "pretest",
        tema: q.tema,
        nivel_bloom: q.nivel_bloom,
        dificultad: q.dificultad,
        opcion_elegida: correct ? q.respuesta_correcta : "C",
        resultado: correct,
        tiempo_segundos: Number((18.4 + ((idx * 3 + qIdx * 2) % 19)).toFixed(2)),
        dominio_previo: prevD,
        dominio_posterior: nextD,
        motivo_seleccion: "Evaluación diagnóstica inicial (Pretest)",
        version_algoritmo: ALGORITHM_VERSION,
        creado_en: "2026-11-02T09:15:00Z",
      });
    });

    // 2. Práctica (8 interacciones por estudiante)
    const studentPracticeSlice = practiceItems.slice(0, 8);
    studentPracticeSlice.forEach((q, qIdx) => {
      const correct = isExperimental ? qIdx % 3 !== 0 : qIdx % 2 === 0;
      const prevD = masteryByTopic[q.tema];
      const nextD = calculateUpdatedMastery(prevD, q.dificultad, correct);
      masteryByTopic[q.tema] = nextD;

      const currentInteractionId = logId++;
      const activityType =
        isExperimental && !correct && qIdx % 2 === 1 ? "remediacion" : "practica";

      logs.push({
        id: currentInteractionId,
        estudiante_hash: p.estudiante_hash,
        condicion_grupo: p.condicion_grupo,
        codigo_item: q.codigo_item,
        tipo_actividad: activityType,
        tema: q.tema,
        nivel_bloom: q.nivel_bloom,
        dificultad: q.dificultad,
        opcion_elegida: correct ? q.respuesta_correcta : "B",
        resultado: correct,
        tiempo_segundos: Number((22.1 + ((idx * 5 + qIdx * 3) % 24)).toFixed(2)),
        dominio_previo: prevD,
        dominio_posterior: nextD,
        motivo_seleccion: isExperimental
          ? activityType === "remediacion"
            ? `Bucle de Remediación Guiada en ${q.tema} (D=${prevD.toFixed(3)} < 0.700)`
            : `Priorización adaptativa por menor dominio en ${q.tema} (D=${prevD.toFixed(3)})`
          : "Secuencia lineal fija (Grupo Control)",
        version_algoritmo: ALGORITHM_VERSION,
        creado_en: "2026-11-06T14:30:00Z",
      });

      // Si es Grupo Experimental y falló, registrar telemetría RAG
      if (isExperimental && !correct) {
        const top5 = retrieveTopKFragments(q, "B");
        ragLogs.push({
          id: ragId++,
          interaccion_id: currentInteractionId,
          estudiante_hash: p.estudiante_hash,
          codigo_item: q.codigo_item,
          modelo_llm: "gemini-2.5-flash",
          tokens_prompt: 310 + qIdx * 12,
          tokens_completion: 98 + qIdx * 5,
          latencia_ms: 420 + ((idx * 45 + qIdx * 30) % 280),
          fragmentos_recuperados: top5.map((f) => f.metric),
          explicacion_generada: `Retroalimentación RAG verificada con [Chunk #${top5[0]?.metric.chunk_id}]: ${q.justificacion_pedagogica}`,
          costo_estimado_usd: 0.0,
          fue_fallback: false,
          creado_en: "2026-11-06T14:30:02Z",
        });
      }
    });

    // 3. Postest (8 ítems isomorfos)
    const postThreshold = Math.round(postTarget * postestItems.length);
    postestItems.forEach((q, qIdx) => {
      const correct = qIdx < postThreshold;
      const prevD = masteryByTopic[q.tema];
      const nextD = calculateUpdatedMastery(prevD, q.dificultad, correct);
      masteryByTopic[q.tema] = nextD;

      logs.push({
        id: logId++,
        estudiante_hash: p.estudiante_hash,
        condicion_grupo: p.condicion_grupo,
        codigo_item: q.codigo_item,
        tipo_actividad: "postest",
        tema: q.tema,
        nivel_bloom: q.nivel_bloom,
        dificultad: q.dificultad,
        opcion_elegida: correct ? q.respuesta_correcta : "D",
        resultado: correct,
        tiempo_segundos: Number((15.8 + ((idx * 2 + qIdx * 3) % 14)).toFixed(2)),
        dominio_previo: prevD,
        dominio_posterior: nextD,
        motivo_seleccion: "Evaluación sumativa isomorfa (Postest)",
        version_algoritmo: ALGORITHM_VERSION,
        creado_en: "2026-11-11T10:00:00Z",
      });
    });

    // Guardar perfiles actualizados
    for (const t of ORDERED_TOPICS) {
      updatedProfiles.push({
        id: profileId++,
        estudiante_hash: p.estudiante_hash,
        tema: t,
        dominio_actual: masteryByTopic[t],
        actualizado_en: "2026-11-11T10:05:00Z",
      });
    }

    // Guardar encuesta Likert 1-5
    surveys.push({
      id: idx + 1,
      estudiante_hash: p.estudiante_hash,
      respuestas: isExperimental
        ? { q1: 5, q2: 5, q3: 5, q4: 5, q5: 4, q6: 5, q7: 5, q8: 5 }
        : { q1: 4, q2: 5, q3: 3, q4: 3, q5: 4, q6: 4, q7: 4, q8: 4 },
      comentarios_abiertos: isExperimental
        ? "Las pistas guiadas y la explicación RAG con citas de MDN me ayudaron a corregir mis errores de Fetch y DOM."
        : "Los ejercicios de código estuvieron claros, aunque me hubiera gustado recibir pistas más detalladas al fallar.",
      creado_en: "2026-11-11T10:12:00Z",
    });

    updatedParticipants.push({
      ...p,
      consentimiento_aceptado: true,
      fecha_consentimiento: "2026-11-02T09:00:00Z",
      pretest_completado: true,
      postest_completado: true,
      encuesta_completada: true,
    });
  });

  return {
    participants: updatedParticipants,
    profiles: updatedProfiles,
    logs,
    ragLogs,
    surveys,
  };
}

export function flattenSummariesForCsv(
  summaries: StudentScientificSummary[],
): Record<string, unknown>[] {
  return summaries.map((s) => ({
    estudiante_hash: s.estudiante_hash,
    condicion_grupo: s.condicion_grupo,
    consentimiento_aceptado: s.consentimiento_aceptado,
    pretest_completado: s.pretest_completado,
    postest_completado: s.postest_completado,
    pretest_score_pct: s.pretest_score_pct ?? "",
    postest_score_pct: s.postest_score_pct ?? "",
    ganancia_bruta_G: s.ganancia_bruta_G ?? "",
    ganancia_hake_g: s.ganancia_hake_g ?? "",
    practica_intentos: s.practica_intentos,
    practica_precision_pct: s.practica_precision_pct ?? "",
    remediaciones_rag: s.remediaciones_rag,
    dominio_promedio: s.dominio_promedio,
    tiempo_promedio_seg: s.tiempo_promedio_seg ?? "",
    usabilidad_promedio_1a5: s.usabilidad_promedio ?? "",
  }));
}
