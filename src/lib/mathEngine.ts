import type {
  ActivityType,
  BancoPregunta,
  BitacoraTrazabilidad,
  BloomLevel,
  EncuestaUsabilidad,
  GroupCondition,
  Participante,
  PerfilDominio,
  StudentScientificSummary,
  TopicCode,
} from "../types/edusim";

export const INITIAL_MASTERY = 0.300;
export const LEARNING_RATE_ALPHA = 0.20;
export const MASTERY_THRESHOLD = 0.700;
export const ALGORITHM_VERSION = "adapt-v1.0";

export const ORDERED_TOPICS: TopicCode[] = [
  "DOM-01",
  "DOM-02",
  "DOM-03",
  "JS-04",
  "DAT-05",
  "NET-06",
  "ASY-07",
  "ERR-08",
];

export const BLOOM_ORDER: BloomLevel[] = [
  "Recordar",
  "Comprender",
  "Aplicar",
  "Analizar",
];

const WEIGHTS_SUCCESS: Record<number, number> = {
  1: 0.60,
  2: 0.80,
  3: 1.00,
  4: 1.20,
  5: 1.40,
};

const WEIGHTS_FAILURE: Record<number, number> = {
  1: 1.40,
  2: 1.20,
  3: 1.00,
  4: 0.80,
  5: 0.60,
};

/**
 * Retorna el peso asimétrico W(d, R_t) según dificultad d in [1..5] y resultado binario R_t.
 * Justificación científica: modelo escalonado de Guttman.
 */
export function getAsymmetricWeight(difficulty: number, isCorrect: boolean): number {
  const clampedDiff = Math.max(1, Math.min(5, Math.round(difficulty)));
  return isCorrect ? WEIGHTS_SUCCESS[clampedDiff] : WEIGHTS_FAILURE[clampedDiff];
}

/**
 * Actualización Secuencial Asimétrica del Dominio (Sección 5.1 de agents2.md):
 * D_t = clamp(D_{t-1} + alpha * (R_t - D_{t-1}) * W(d, R_t), 0.000, 1.000)
 */
export function calculateUpdatedMastery(
  previousMastery: number,
  difficulty: number,
  isCorrect: boolean,
  alpha: number = LEARNING_RATE_ALPHA,
): number {
  const r_t = isCorrect ? 1 : 0;
  const w = getAsymmetricWeight(difficulty, isCorrect);
  const raw = previousMastery + alpha * (r_t - previousMastery) * w;
  const clamped = Math.max(0.0, Math.min(1.0, raw));
  return Number(clamped.toFixed(3));
}

export interface QuestionSelectionResult {
  question: BancoPregunta;
  activityType: ActivityType;
  reason: string;
}

/**
 * Motor de Bifurcación por Condición Experimental (Sección 5.2 de agents2.md)
 * - Grupo B ('control_fijo'): Secuencia lineal estricta DOM-01 -> ERR-08 con dificultad progresiva fija.
 * - Grupo A ('experimental_adaptativo'):
 *   1) Si acaba de fallar y existe ítem de refuerzo del mismo tema con dificultad <= 2 o Bloom inferior, activa Bucle de Remediación Guiada.
 *   2) De lo contrario, selecciona el tema con menor dominio_actual (priorizando D < 0.700) y ajusta complejidad Bloom y dificultad.
 */
export function selectNextPracticeQuestion(params: {
  condition: GroupCondition;
  practiceBank: BancoPregunta[];
  masteryMap: Record<TopicCode, number>;
  history: BitacoraTrazabilidad[];
  pendingRemediationTopic?: TopicCode | null;
}): QuestionSelectionResult {
  const { condition, practiceBank, masteryMap, history, pendingRemediationTopic } = params;
  const validatedBank = practiceBank.filter(
    (q) => q.tipo_uso === "practica_adaptativa" && q.validado_por_docente,
  );
  const pool = validatedBank.length > 0 ? validatedBank : practiceBank;

  const practiceHistory = history.filter(
    (h) => h.tipo_actividad === "practica" || h.tipo_actividad === "remediacion",
  );
  const answeredCodes = new Set(practiceHistory.map((h) => h.codigo_item));

  // 1. GRUPO CONTROL FIJO (Grupo B)
  if (condition === "control_fijo") {
    const sortedFixed = [...pool].sort((a, b) => {
      const topicDiff = ORDERED_TOPICS.indexOf(a.tema) - ORDERED_TOPICS.indexOf(b.tema);
      if (topicDiff !== 0) return topicDiff;
      if (a.dificultad !== b.dificultad) return a.dificultad - b.dificultad;
      return a.codigo_item.localeCompare(b.codigo_item);
    });

    const nextUnanswered =
      sortedFixed.find((q) => !answeredCodes.has(q.codigo_item)) ??
      sortedFixed[practiceHistory.length % sortedFixed.length];

    return {
      question: nextUnanswered,
      activityType: "practica",
      reason: "Secuencia lineal fija (Grupo Control)",
    };
  }

  // 2. GRUPO EXPERIMENTAL ADAPTATIVO (Grupo A)
  // 2a. Bucle de Remediación Guiada si hay un tema pendiente de remediación tras fallo
  if (pendingRemediationTopic) {
    const remediationCandidates = pool
      .filter((q) => q.tema === pendingRemediationTopic)
      .sort((a, b) => {
        const aUnseen = answeredCodes.has(a.codigo_item) ? 1 : 0;
        const bUnseen = answeredCodes.has(b.codigo_item) ? 1 : 0;
        if (aUnseen !== bUnseen) return aUnseen - bUnseen;
        // Priorizar menor dificultad (1 o 2) y nivel Recordar/Comprender
        if (a.dificultad !== b.dificultad) return a.dificultad - b.dificultad;
        return BLOOM_ORDER.indexOf(a.nivel_bloom) - BLOOM_ORDER.indexOf(b.nivel_bloom);
      });

    if (remediationCandidates.length > 0) {
      const chosen = remediationCandidates[0];
      const currentD = masteryMap[pendingRemediationTopic] ?? INITIAL_MASTERY;
      return {
        question: chosen,
        activityType: "remediacion",
        reason: `Bucle de Remediación Guiada en ${pendingRemediationTopic} (D=${currentD.toFixed(3)} < 0.700 → descenso a ${chosen.nivel_bloom}, dif. ${chosen.dificultad}/5)`,
      };
    }
  }

  // 2b. Selección adaptativa del tema con menor dominio_actual (priorizando D < 0.700)
  const sortedTopics = [...ORDERED_TOPICS].sort((tA, tB) => {
    const dA = masteryMap[tA] ?? INITIAL_MASTERY;
    const dB = masteryMap[tB] ?? INITIAL_MASTERY;
    if (dA !== dB) return dA - dB;
    return ORDERED_TOPICS.indexOf(tA) - ORDERED_TOPICS.indexOf(tB);
  });

  for (const targetTopic of sortedTopics) {
    const d = masteryMap[targetTopic] ?? INITIAL_MASTERY;
    // Determinar dificultad objetivo según el dominio actual del tema
    const targetDifficulty =
      d < 0.35 ? 1 : d < 0.50 ? 2 : d < 0.70 ? 3 : d < 0.85 ? 4 : 5;

    const topicCandidates = pool
      .filter((q) => q.tema === targetTopic && !answeredCodes.has(q.codigo_item))
      .sort((a, b) => {
        const distA = Math.abs(a.dificultad - targetDifficulty);
        const distB = Math.abs(b.dificultad - targetDifficulty);
        if (distA !== distB) return distA - distB;
        return BLOOM_ORDER.indexOf(a.nivel_bloom) - BLOOM_ORDER.indexOf(b.nivel_bloom);
      });

    if (topicCandidates.length > 0) {
      const chosen = topicCandidates[0];
      const statusLabel =
        d >= MASTERY_THRESHOLD
          ? `Avance de complejidad Bloom (${chosen.nivel_bloom}, D=${d.toFixed(3)} ≥ 0.700)`
          : `Priorización adaptativa por menor dominio en ${targetTopic} (D=${d.toFixed(3)} < 0.700)`;
      return {
        question: chosen,
        activityType: "practica",
        reason: statusLabel,
      };
    }
  }

  // Fallback si ya respondió todo el banco: elegir el ítem del tema más débil
  const weakestTopic = sortedTopics[0];
  const fallbackQuestion =
    pool.find((q) => q.tema === weakestTopic) ?? pool[0];

  return {
    question: fallbackQuestion,
    activityType: "practica",
    reason: `Refuerzo continuo en tema prioritario ${weakestTopic} (D=${(masteryMap[weakestTopic] ?? INITIAL_MASTERY).toFixed(3)})`,
  };
}

/**
 * Calcula la Ganancia Bruta (G) y la Ganancia Normalizada de Hake (g):
 * G = %Postest - %Pretest
 * g = (%Postest - %Pretest) / (100 - %Pretest)
 */
export function calculateHakeMetrics(
  pretestPct: number | null,
  postestPct: number | null,
): { gananciaBrutaG: number | null; gananciaHakeG: number | null } {
  if (pretestPct === null || postestPct === null) {
    return { gananciaBrutaG: null, gananciaHakeG: null };
  }
  const G = Number((postestPct - pretestPct).toFixed(2));
  if (pretestPct >= 100) {
    return { gananciaBrutaG: G, gananciaHakeG: 0 };
  }
  const g = Number(((postestPct - pretestPct) / (100 - pretestPct)).toFixed(3));
  return { gananciaBrutaG: G, gananciaHakeG: g };
}

/**
 * Consolida el resumen científico de un participante para exportación a R / Python / SPSS.
 */
export function buildStudentScientificSummary(params: {
  participant: Participante;
  profiles: PerfilDominio[];
  logs: BitacoraTrazabilidad[];
  survey?: EncuestaUsabilidad;
}): StudentScientificSummary {
  const { participant, profiles, logs, survey } = params;
  const studentLogs = logs.filter((l) => l.estudiante_hash === participant.estudiante_hash);

  const preLogs = studentLogs.filter((l) => l.tipo_actividad === "pretest");
  const postLogs = studentLogs.filter((l) => l.tipo_actividad === "postest");
  const pracLogs = studentLogs.filter(
    (l) => l.tipo_actividad === "practica" || l.tipo_actividad === "remediacion",
  );
  const remLogs = studentLogs.filter((l) => l.tipo_actividad === "remediacion");

  const pretestPct =
    preLogs.length > 0
      ? Number(
          ((preLogs.filter((l) => l.resultado).length / preLogs.length) * 100).toFixed(2),
        )
      : null;

  const postestPct =
    postLogs.length > 0
      ? Number(
          ((postLogs.filter((l) => l.resultado).length / postLogs.length) * 100).toFixed(2),
        )
      : null;

  const { gananciaBrutaG, gananciaHakeG } = calculateHakeMetrics(pretestPct, postestPct);

  const practicaPrecision =
    pracLogs.length > 0
      ? Number(
          ((pracLogs.filter((l) => l.resultado).length / pracLogs.length) * 100).toFixed(2),
        )
      : null;

  const studentProfiles = profiles.filter(
    (p) => p.estudiante_hash === participant.estudiante_hash,
  );
  const avgMastery =
    studentProfiles.length > 0
      ? Number(
          (
            studentProfiles.reduce((acc, item) => acc + item.dominio_actual, 0) /
            studentProfiles.length
          ).toFixed(3),
        )
      : INITIAL_MASTERY;

  const avgTime =
    studentLogs.length > 0
      ? Number(
          (
            studentLogs.reduce((acc, item) => acc + item.tiempo_segundos, 0) /
            studentLogs.length
          ).toFixed(2),
        )
      : null;

  let usabilityAvg: number | null = null;
  if (survey) {
    const values = Object.values(survey.respuestas);
    if (values.length > 0) {
      usabilityAvg = Number(
        (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      );
    }
  }

  return {
    estudiante_hash: participant.estudiante_hash,
    condicion_grupo: participant.condicion_grupo,
    consentimiento_aceptado: participant.consentimiento_aceptado,
    pretest_completado: participant.pretest_completado,
    postest_completado: participant.postest_completado,
    encuesta_completada: participant.encuesta_completada,
    pretest_score_pct: pretestPct,
    postest_score_pct: postestPct,
    ganancia_bruta_G: gananciaBrutaG,
    ganancia_hake_g: gananciaHakeG,
    practica_intentos: pracLogs.length,
    practica_precision_pct: practicaPrecision,
    remediaciones_rag: remLogs.length,
    dominio_promedio: avgMastery,
    tiempo_promedio_seg: avgTime,
    usabilidad_promedio: usabilityAvg,
  };
}
