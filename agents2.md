# AGENTS.md — Especificación Técnica y Científica de EduSim IA (v2.0 Mejorada)

## 1. Propósito del Proyecto y Rol del Agente
Eres un ingeniero de software full-stack e investigador en tecnología educativa que construye **EduSim IA**, un Sistema Tutor Inteligente (ITS) con recomendación adaptativa y Generación Aumentada por Recuperación (RAG) para la asignatura **Desarrollo Web I** (estudiantes de tercer semestre).

**REGLA CRÍTICA DE INVESTIGACIÓN:** Este software es un **instrumento científico cuasiexperimental** (diseño de grupos no equivalentes con pretest y postest), no una plataforma de cuestionarios genérica. Cada decisión técnica debe preservar:
1. La integridad e inmutabilidad de los datos empíricos.
2. La separación estricta entre el **Grupo Experimental Adaptativo (`experimental_adaptativo`)** y el **Grupo de Control Fijo (`control_fijo`)**.
3. La trazabilidad completa de cada interacción, incluyendo tiempos de respuesta de alta precisión en cliente (`performance.now()`), evolución del dominio ($D_{t-1} \rightarrow D_t$) y telemetría del sistema RAG.

---

## 2. Stack Tecnológico y Arquitectura Híbrida Resiliente (100% Gratuito y Compatible con Vercel)
Para garantizar costo cero durante el piloto de 2 a 3 semanas, despliegue continuo y **tolerancia total a fallos de red o límites de cuota en laboratorio**, la arquitectura implementa un diseño híbrido:

* **Frontend & Aplicación Interactiva:** React 19 + TypeScript + Vite / Next.js compatible, con diseño accesible (WCAG AA), resaltado de sintaxis para bloques de código JavaScript y enrutamiento por vistas experimentales (`/login`, `/pretest`, `/practica`, `/postest`, `/usabilidad`, `/investigador`).
* **Base de Datos Relacional y Vectorial:** **Supabase** (PostgreSQL gratuito con extensión `pgvector` habilitada para almacenar tanto las tablas de bitácora como los embeddings del corpus curricular), respaldado por un **Motor de Persistencia Local Sincronizable (`localStorage` + Estado Transaccional)** que permite ejecutar el estudio completo en aula incluso sin conexión o sin credenciales externas configuradas.
* **LLM Generativo (Retroalimentación RAG):** **Google Gemini API** (`gemini-2.5-flash`) o **Groq API** (`llama-3.3-70b-versatile`), con un **Motor RAG Determinista de Respaldo (Fallback 429/Offline)** que calcula similitud semántica/léxica sobre los fragmentos de `corpus_rag` y ensambla explicaciones fieles al corpus cuando las APIs gratuitas alcanzan límite de tasa.
* **Modelo de Embeddings (Vectorización):** Google `text-embedding-004` (768 dimensiones, gratuito) para indexar las guías de Desarrollo Web I.
* **Autenticación, Privacidad y LOPDP (Ecuador):** Acceso mediante código seudonimizado (`EST-001` a `EST-060`) + PIN de acceso, evitando almacenar nombres reales, correos o identificadores personales en las tablas analíticas en cumplimiento con la Ley Orgánica de Protección de Datos Personales (LOPDP).

---

## 3. Modelo de Dominio Curricular (8 Temas Obligatorios)
El contenido, el banco de preguntas (`pretest`, `postest`, `practica_adaptativa`) y los fragmentos del `corpus_rag` deben etiquetarse estrictamente con estos 8 códigos de tema:

1. `DOM-01`: Selección y recorrido del DOM (`getElementById`, `querySelector`, `querySelectorAll`, navegación de nodos).
2. `DOM-02`: Eventos del navegador y objeto `event` (`addEventListener`, `preventDefault`, `target`, propagación `bubbling`).
3. `DOM-03`: Manipulación dinámica de elementos (`textContent`, `classList`, `setAttribute`, `createElement`, `appendChild`).
4. `JS-04`: Funciones y alcance (*scope* léxico, `let`, `const`, funciones flecha, clausuras básicas e inmutabilidad de referencias).
5. `DAT-05`: Estructuración y serialización JSON (`JSON.parse`, `JSON.stringify`, manejo de estructuras anidadas).
6. `NET-06`: Consumo de APIs con HTTP y `fetch` (peticiones GET/POST, cabeceras, `response.ok`, códigos de estado 200/201/404/500).
7. `ASY-07`: Asincronía con Promesas y `async/await` (flujo no bloqueante, `Promise`, estados *pending*, *fulfilled*, *rejected*).
8. `ERR-08`: Manejo básico de errores (`try...catch`, `finally`, `throw new Error()`, validación de fallos en respuestas HTTP).

---

## 4. Arquitectura de Base de Datos (PostgreSQL + pgvector)
Las migraciones SQL (`supabase/migrations/001_edusim_schema.sql`) respetan estrictamente los nombres de tablas y columnas que alimentan el análisis estadístico del artículo científico:

```sql
-- Habilitar extensión vectorial en Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Participantes seudonimizados y asignación experimental
CREATE TABLE participantes (
    id BIGSERIAL PRIMARY KEY,
    estudiante_hash VARCHAR(64) UNIQUE NOT NULL, -- Ej: EST-001 a EST-060
    condicion_grupo VARCHAR(30) NOT NULL CHECK (condicion_grupo IN ('experimental_adaptativo', 'control_fijo')),
    consentimiento_aceptado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_consentimiento TIMESTAMP WITH TIME ZONE,
    pretest_completado BOOLEAN DEFAULT FALSE,
    postest_completado BOOLEAN DEFAULT FALSE,
    encuesta_completada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfil dinámico de dominio por estudiante y tema
CREATE TABLE perfil_dominio (
    id BIGSERIAL PRIMARY KEY,
    estudiante_hash VARCHAR(64) REFERENCES participantes(estudiante_hash) ON DELETE CASCADE,
    tema VARCHAR(50) NOT NULL,
    dominio_actual NUMERIC(4,3) NOT NULL DEFAULT 0.300 CHECK (dominio_actual BETWEEN 0.000 AND 1.000),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(estudiante_hash, tema)
);

-- 3. Banco centralizado de preguntas (Pretest, Postest y Práctica)
CREATE TABLE banco_preguntas (
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
CREATE TABLE bitacora_trazabilidad (
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
CREATE TABLE telemetria_rag (
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
CREATE TABLE corpus_rag (
    id BIGSERIAL PRIMARY KEY,
    tema VARCHAR(50) NOT NULL,
    titulo_fuente VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    embedding vector(768)
);

-- 7. Encuesta final de usabilidad (8 ítems Likert 1-5)
CREATE TABLE encuesta_usabilidad (
    id BIGSERIAL PRIMARY KEY,
    estudiante_hash VARCHAR(64) UNIQUE REFERENCES participantes(estudiante_hash),
    respuestas JSONB NOT NULL, -- {"q1": 5, "q2": 4, ..., "q8": 5}
    comentarios_abiertos TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Motor Matemático y Reglas Pedagógicas (Implementación Obligatoria)

### 5.1. Actualización Secuencial Asimétrica del Dominio
Cada vez que un estudiante responde un ítem de práctica (o al calibrar el perfil inicial tras el pretest), se actualiza su dominio $D_t \in [0.000, 1.000]$ para ese tema usando:

$$D_t = \text{clamp}\Big(D_{t-1} + \alpha \cdot (R_t - D_{t-1}) \cdot W(d, R_t),\; 0.000,\; 1.000\Big)$$

* **Valor inicial:** $D_0 = 0.300$ en los 8 temas (`DOM-01` a `ERR-08`).
* **Tasa de aprendizaje:** $\alpha = 0.20$.
* **Resultado binario:** $R_t = 1$ (acierto) o $R_t = 0$ (fallo).
* **Ponderación asimétrica $W(d, R_t)$:**
  * Si $R_t = 1$ (Acierto): `{1: 0.60, 2: 0.80, 3: 1.00, 4: 1.20, 5: 1.40}`
  * Si $R_t = 0$ (Fallo): `{1: 1.40, 2: 1.20, 3: 1.00, 4: 0.80, 5: 0.60}`
  * *Justificación científica:* Fallar preguntas básicas ($d=1$ o $d=2$) penaliza con mayor fuerza el dominio porque evidencia vacíos en prerrequisitos elementales (modelo escalonado de Guttman), mientras que acertar preguntas de alta complejidad ($d=4$ o $d=5$) aporta evidencia sólida de transferencia cognitiva.

### 5.2. Bifurcación por Condición Experimental
El sistema lee `participantes.condicion_grupo` al iniciar la práctica:

1. **Si `condicion_grupo === 'control_fijo'` (Grupo B):**
   * Presenta las actividades en orden secuencial estricto (`DOM-01` $\rightarrow$ `DOM-02` $\rightarrow$ ... $\rightarrow$ `ERR-08`) con dificultad progresiva fija.
   * Muestra únicamente la validación estándar ("Correcto" / "Incorrecto" + `justificacion_pedagogica` estática de la base de datos), **sin** adaptación ni generación dinámica con LLM.
   * Registra toda interacción en `bitacora_trazabilidad` con `motivo_seleccion = 'Secuencia lineal fija (Grupo Control)'`.

2. **Si `condicion_grupo === 'experimental_adaptativo'` (Grupo A):**
   * Selecciona dinámicamente el tema con menor `dominio_actual` (priorizando aquellos con $D < 0.700$).
   * **Si acierta y $D_t \ge 0.700$:** Avanza complejidad en la Taxonomía de Bloom (`Recordar` $\rightarrow$ `Comprender` $\rightarrow$ `Aplicar` $\rightarrow$ `Analizar`) y sube dificultad ($d + 1$).
   * **Bucle de Remediación Guiada (si falla o $D_t < 0.700$):**
     1. Consulta `corpus_rag` recuperando los **Top-5 fragmentos** (`k = 5`) más similares al enunciado, tema y distractor elegido.
     2. Invoca al LLM gratuito (o al sintetizador RAG determinista de respaldo si no hay API key o hay error HTTP 429) con un *system prompt* estricto que le prohíbe inventar información fuera de los 5 fragmentos recuperados (garantizando **Fidelidad RAG**), explicando por qué la opción elegida es incorrecta.
     3. Desciende un nivel en Bloom (`Comprender` o `Recordar`, dificultad 1 o 2) y asigna una **pregunta de refuerzo guiada (`remediacion`)** mostrando `pista_guiada`.
     4. Guarda los tokens consumidos, latencia en ms, costo estimado y los IDs/similitudes de los 5 fragmentos en `telemetria_rag`.

### 5.3. Métricas Científicas para Evaluación Cuasiexperimental
El módulo del investigador calcula automáticamente para cada participante y por grupo experimental:
* **Puntaje Pretest y Postest ($0\text{–}100\%$):** Porcentaje de aciertos sobre los ítems diagnósticos y sumativos.
* **Ganancia Bruta ($G$):**
  $$G = \%\text{Postest} - \%\text{Pretest}$$
* **Ganancia Normalizada de Hake ($g$):**
  $$g = \frac{\%\text{Postest} - \%\text{Pretest}}{100 - \%\text{Pretest}}$$
  *(Interpretación de Hake: $g < 0.30$ ganancia baja; $0.30 \le g < 0.70$ ganancia media; $g \ge 0.70$ ganancia alta).*

---

## 6. Flujos de Interfaz (5 Vistas Integradas)
1. **`/login` y Consentimiento Informado:**
   * Ingreso con código asignado (`EST-001` a `EST-060`) y selector rápido para pruebas de laboratorio.
   * Si `consentimiento_aceptado` es `false`, presenta el protocolo ético de participación voluntaria, anonimato y seudonimización (LOPDP Ecuador) antes de habilitar cualquier evaluación.
2. **`/pretest` (Evaluación Diagnóstica):**
   * Temporizador invisible por pregunta con `performance.now()` para medir `tiempo_segundos` exacto.
   * Sin retroalimentación inmediata ni pistas para no contaminar la línea base diagnóstica.
   * Al finalizar, calibra `perfil_dominio` y marca `pretest_completado = true`, bloqueando el reingreso.
3. **`/practica` (Entorno de Entrenamiento Diferenciado Grupo A vs Grupo B):**
   * Barra superior de progreso, mapa en vivo de los 8 temas (`DOM-01` a `ERR-08`) y resaltado de código JS.
   * Si es Grupo A (`experimental_adaptativo`) y falla, despliega el panel **Tutor RAG (Explicación contextual basada en Top-5 fragmentos MDN + Pista guiada + Actividad de remediación)**.
4. **`/postest` y `/usabilidad`:**
   * Evalúa los ítems isomorfos del postest en condiciones equivalentes al pretest.
   * Aplica inmediatamente el cuestionario de usabilidad de **8 ítems en escala Likert (1 a 5)** más comentarios abiertos.
5. **`/investigador` (Panel de Control, Validación Docente y Exportación Científica):**
   * Protegido por clave de administrador (`ADMIN_SECRET`, por defecto `EDUSIM-ADMIN-2026` en entorno local).
   * Permite validar preguntas (`validado_por_docente = true`) verificando la **Rúbrica de 5 Criterios** (alineación curricular, nivel Bloom, validez sintáctica JS, distractores plausibles y justificación/pista).
   * Incluye simulador de datos experimentales y exportación directa a **CSV y JSON** de `bitacora_trazabilidad`, `telemetria_rag`, `encuesta_usabilidad` y la matriz consolidada de resultados ($Pretest, Postest, G, g$).

---

## 7. Script Inicial de Datos (Seed Obligatorio)
El proyecto incluye tanto el script SQL (`scripts/seed.sql`) como el módulo tipado (`src/data/seedData.ts`) con:
* Los pares validados de Pretest (`PRE-01` a `PRE-20`), Postest isomorfo (`POST-01` a `POST-20`) y banco amplio de Práctica Adaptativa y Remediación (`PRAC-01` a `PRAC-24`) distribuidos en los 8 temas (`DOM-01` a `ERR-08`).
* Los 10 usuarios de prueba obligatorios (`EST-001` a `EST-005` en `experimental_adaptativo` y `EST-006` a `EST-010` en `control_fijo`), además de soporte para cualquier código `EST-001` a `EST-060`.
* Documentación técnica de JavaScript (MDN Web Docs sintetizado por tema, con múltiples fragmentos por cada uno de los 8 temas) en `corpus_rag`.

---

## 8. Guardrails y Buenas Prácticas de Ingeniería
* **Medición de Tiempo en Cliente:** Siempre captura `performance.now()` en el navegador desde que se renderiza el ítem hasta que se envía la respuesta (`tiempo_segundos` con dos decimales).
* **Aislamiento del Grupo Control:** Nunca ejecutes llamadas al motor RAG ni muestres pistas guiadas en `control_fijo`.
* **Resiliencia ante Rate Limits (HTTP 429):** Si Gemini o Groq devuelven error o no están configurados en `.env.local`, activa automáticamente el motor RAG local sobre `corpus_rag` registrando la telemetría correspondiente para que el piloto en aula jamás se interrumpa.
* **Seguridad de Credenciales:** Mantén las variables de entorno documentadas en `.env.example` y nunca subas secretos ni carpetas de documentación privada al repositorio de GitHub.
