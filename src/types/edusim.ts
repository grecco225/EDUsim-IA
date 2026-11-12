export type TopicCode =
  | "DOM-01"
  | "DOM-02"
  | "DOM-03"
  | "JS-04"
  | "DAT-05"
  | "NET-06"
  | "ASY-07"
  | "ERR-08";

export type BloomLevel = "Recordar" | "Comprender" | "Aplicar" | "Analizar";

export type GroupCondition = "experimental_adaptativo" | "control_fijo";

export type QuestionUsageType = "pretest" | "postest" | "practica_adaptativa";

export type ActivityType = "pretest" | "practica" | "remediacion" | "postest";

export type OptionKey = "A" | "B" | "C" | "D";

export type AppView =
  | "/login"
  | "/pretest"
  | "/practica"
  | "/postest"
  | "/usabilidad"
  | "/investigador";

export interface TopicMetadata {
  code: TopicCode;
  shortName: string;
  title: string;
  description: string;
  keywords: string[];
}

export interface Participante {
  id: number;
  estudiante_hash: string; // Ej: EST-001 a EST-060
  condicion_grupo: GroupCondition;
  consentimiento_aceptado: boolean;
  fecha_consentimiento: string | null;
  pretest_completado: boolean;
  postest_completado: boolean;
  encuesta_completada: boolean;
  creado_en: string;
}

export interface PerfilDominio {
  id: number;
  estudiante_hash: string;
  tema: TopicCode;
  dominio_actual: number; // [0.000, 1.000]
  actualizado_en: string;
}

export interface BancoPregunta {
  id: number;
  codigo_item: string; // Ej: PRE-01, POST-01, PRAC-01
  tipo_uso: QuestionUsageType;
  tema: TopicCode;
  nivel_bloom: BloomLevel;
  dificultad: 1 | 2 | 3 | 4 | 5;
  enunciado: string;
  codigo_js?: string;
  opciones: Record<OptionKey, string>;
  respuesta_correcta: OptionKey;
  justificacion_pedagogica: string;
  pista_guiada: string;
  validado_por_docente: boolean;
  creado_en: string;
}

export interface BitacoraTrazabilidad {
  id: number;
  estudiante_hash: string;
  condicion_grupo: GroupCondition;
  codigo_item: string;
  tipo_actividad: ActivityType;
  tema: TopicCode;
  nivel_bloom: BloomLevel;
  dificultad: number;
  opcion_elegida?: OptionKey;
  resultado: boolean;
  tiempo_segundos: number;
  dominio_previo: number;
  dominio_posterior: number;
  motivo_seleccion: string;
  version_algoritmo: string;
  creado_en: string;
}

export interface RetrievedFragmentMetric {
  chunk_id: number;
  similitud: number;
  tema: TopicCode;
  titulo_fuente: string;
  extracto?: string;
}

export interface TelemetriaRag {
  id: number;
  interaccion_id: number;
  estudiante_hash: string;
  codigo_item: string;
  modelo_llm: string;
  tokens_prompt: number;
  tokens_completion: number;
  latencia_ms: number;
  fragmentos_recuperados: RetrievedFragmentMetric[];
  explicacion_generada: string;
  costo_estimado_usd: number;
  fue_fallback: boolean;
  creado_en: string;
}

export interface CorpusRagItem {
  id: number;
  tema: TopicCode;
  titulo_fuente: string;
  contenido: string;
  keywords: string[];
}

export interface EncuestaUsabilidad {
  id: number;
  estudiante_hash: string;
  respuestas: Record<string, number>; // {"q1": 5, ..., "q8": 5}
  comentarios_abiertos: string;
  creado_en: string;
}

export interface StudentScientificSummary {
  estudiante_hash: string;
  condicion_grupo: GroupCondition;
  consentimiento_aceptado: boolean;
  pretest_completado: boolean;
  postest_completado: boolean;
  encuesta_completada: boolean;
  pretest_score_pct: number | null;
  postest_score_pct: number | null;
  ganancia_bruta_G: number | null;
  ganancia_hake_g: number | null;
  practica_intentos: number;
  practica_precision_pct: number | null;
  remediaciones_rag: number;
  dominio_promedio: number;
  tiempo_promedio_seg: number | null;
  usabilidad_promedio: number | null;
}
