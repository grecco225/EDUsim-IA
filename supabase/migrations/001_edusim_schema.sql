-- ============================================================================
-- EduSim IA — Migración SQL Oficial (PostgreSQL + Supabase pgvector)
-- Instrumento Científico Cuasiexperimental para Desarrollo Web I
-- ============================================================================

-- Habilitar extensión vectorial en Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Participantes seudonimizados y asignación experimental
CREATE TABLE IF NOT EXISTS participantes (
    id BIGSERIAL PRIMARY KEY,
    estudiante_hash VARCHAR(64) UNIQUE NOT NULL, -- Ej: EST-017
    condicion_grupo VARCHAR(30) NOT NULL CHECK (condicion_grupo IN ('experimental_adaptativo', 'control_fijo')),
    consentimiento_aceptado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_consentimiento TIMESTAMP WITH TIME ZONE,
    pretest_completado BOOLEAN DEFAULT FALSE,
    postest_completado BOOLEAN DEFAULT FALSE,
    encuesta_completada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfil dinámico de dominio por estudiante y tema
CREATE TABLE IF NOT EXISTS perfil_dominio (
    id BIGSERIAL PRIMARY KEY,
    estudiante_hash VARCHAR(64) REFERENCES participantes(estudiante_hash) ON DELETE CASCADE,
    tema VARCHAR(50) NOT NULL,
    dominio_actual NUMERIC(4,3) NOT NULL DEFAULT 0.300 CHECK (dominio_actual BETWEEN 0.000 AND 1.000),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(estudiante_hash, tema)
);

-- 3. Banco centralizado de preguntas (Pretest, Postest y Práctica)
CREATE TABLE IF NOT EXISTS banco_preguntas (
    id BIGSERIAL PRIMARY KEY,
    codigo_item VARCHAR(20) UNIQUE NOT NULL, -- Ej: PRE-01, POST-01, PRAC-01
    tipo_uso VARCHAR(25) NOT NULL CHECK (tipo_uso IN ('pretest', 'postest', 'practica_adaptativa')),
    tema VARCHAR(50) NOT NULL,
    nivel_bloom VARCHAR(20) NOT NULL CHECK (nivel_bloom IN ('Recordar', 'Comprender', 'Aplicar', 'Analizar')),
    dificultad INT NOT NULL CHECK (dificultad BETWEEN 1 AND 5),
    enunciado TEXT NOT NULL,
    opciones JSONB NOT NULL, -- {"A": "...", "B": "...", "C": "...", "D": "..."}
    respuesta_correcta VARCHAR(10) NOT NULL,
    justificacion_pedagogica TEXT NOT NULL,
    pista_guiada TEXT,
    validado_por_docente BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bitácora inmutable de trazabilidad pedagógica (Evidencia empírica)
CREATE TABLE IF NOT EXISTS bitacora_trazabilidad (
    id BIGSERIAL PRIMARY KEY,
    estudiante_hash VARCHAR(64) NOT NULL,
    condicion_grupo VARCHAR(30) NOT NULL,
    codigo_item VARCHAR(20) NOT NULL,
    tipo_actividad VARCHAR(25) NOT NULL, -- 'pretest', 'practica', 'remediacion', 'postest'
    tema VARCHAR(50) NOT NULL,
    nivel_bloom VARCHAR(20) NOT NULL,
    dificultad INT CHECK (dificultad BETWEEN 1 AND 5),
    resultado BOOLEAN NOT NULL,
    tiempo_segundos NUMERIC(6,2) NOT NULL,
    dominio_previo NUMERIC(4,3) NOT NULL,
    dominio_posterior NUMERIC(4,3) NOT NULL,
    motivo_seleccion TEXT NOT NULL,
    version_algoritmo VARCHAR(20) NOT NULL DEFAULT 'adapt-v1.0',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Telemetría técnica del sistema RAG y consumo de tokens
CREATE TABLE IF NOT EXISTS telemetria_rag (
    id BIGSERIAL PRIMARY KEY,
    interaccion_id BIGINT REFERENCES bitacora_trazabilidad(id) ON DELETE CASCADE,
    modelo_llm VARCHAR(50) NOT NULL,
    tokens_prompt INT NOT NULL,
    tokens_completion INT NOT NULL,
    latencia_ms INT NOT NULL,
    fragmentos_recuperados JSONB NOT NULL, -- [{"chunk_id": 12, "similitud": 0.89}]
    costo_estimado_usd NUMERIC(8,6) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Base de conocimiento vectorial para RAG (Corpus Desarrollo Web I)
CREATE TABLE IF NOT EXISTS corpus_rag (
    id BIGSERIAL PRIMARY KEY,
    tema VARCHAR(50) NOT NULL,
    titulo_fuente VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    embedding vector(768)
);

-- 7. Encuesta final de usabilidad (8 ítems Likert 1-5)
CREATE TABLE IF NOT EXISTS encuesta_usabilidad (
    id BIGSERIAL PRIMARY KEY,
    estudiante_hash VARCHAR(64) UNIQUE REFERENCES participantes(estudiante_hash),
    respuestas JSONB NOT NULL, -- {"q1": 5, "q2": 4, ..., "q8": 5}
    comentarios_abiertos TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas analíticas y recuperación vectorial rápida
CREATE INDEX IF NOT EXISTS idx_bitacora_estudiante ON bitacora_trazabilidad(estudiante_hash);
CREATE INDEX IF NOT EXISTS idx_bitacora_grupo ON bitacora_trazabilidad(condicion_grupo);
CREATE INDEX IF NOT EXISTS idx_preguntas_tema_uso ON banco_preguntas(tema, tipo_uso);
CREATE INDEX IF NOT EXISTS idx_corpus_tema ON corpus_rag(tema);

-- Función RPC para búsqueda semántica Top-K en corpus_rag (text-embedding-004 768 dims)
CREATE OR REPLACE FUNCTION buscar_fragmentos_rag(
    query_embedding vector(768),
    filtro_tema VARCHAR(50) DEFAULT NULL,
    limite INT DEFAULT 5
)
RETURNS TABLE (
    chunk_id BIGINT,
    tema VARCHAR(50),
    titulo_fuente VARCHAR(150),
    contenido TEXT,
    similitud FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS chunk_id,
        c.tema,
        c.titulo_fuente,
        c.contenido,
        1 - (c.embedding <=> query_embedding) AS similitud
    FROM corpus_rag c
    WHERE (filtro_tema IS NULL OR c.tema = filtro_tema)
    ORDER BY c.embedding <=> query_embedding
    LIMIT limite;
END;
$$;
