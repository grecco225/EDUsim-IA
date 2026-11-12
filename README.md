# EduSim IA — Sistema Tutor Inteligente con Recomendación Adaptativa y RAG para Desarrollo Web I

**EduSim IA** es un instrumento científico cuasiexperimental (diseño de grupos no equivalentes con Pretest y Postest) desarrollado para evaluar el impacto de la **adaptación secuencial asimétrica** y la **Generación Aumentada por Recuperación (RAG)** en el aprendizaje de JavaScript y manipulación del DOM en estudiantes de tercer semestre de **Desarrollo Web I**.

---

## Características Científicas y Técnicas Principales

1. **Separación Estricta de Condiciones Experimentales:**
   - **Grupo A (`experimental_adaptativo`):** Selección dinámica del tema con menor dominio ($D_t < 0.700$), progresión en la Taxonomía de Bloom (`Recordar` $\rightarrow$ `Comprender` $\rightarrow$ `Aplicar` $\rightarrow$ `Analizar`), **Tutor RAG** con recuperación de los **Top-5 fragmentos (`k = 5`)** del corpus MDN y **Bucle de Remediación Guiada** con pistas preventivas.
   - **Grupo B (`control_fijo`):** Secuencia lineal fija (`DOM-01` $\rightarrow$ `ERR-08`) con validación estática (`justificacion_pedagogica`) y aislamiento total de llamadas al LLM/RAG.

2. **Motor Matemático de Actualización Secuencial Asimétrica (Modelo Escalonado de Guttman):**
   $$D_t = \text{clamp}\Big(D_{t-1} + \alpha \cdot (R_t - D_{t-1}) \cdot W(d, R_t),\; 0.000,\; 1.000\Big)$$
   - Valor inicial: $D_0 = 0.300$ en los 8 temas curriculares.
   - Tasa de aprendizaje: $\alpha = 0.20$.
   - Pesos asimétricos $W(d, R_t)$:
     - Acierto ($R_t = 1$): `{1: 0.60, 2: 0.80, 3: 1.00, 4: 1.20, 5: 1.40}`
     - Fallo ($R_t = 0$): `{1: 1.40, 2: 1.20, 3: 1.00, 4: 0.80, 5: 0.60}`

3. **Modelo de Dominio Curricular (8 Temas Obligatorios):**
   - `DOM-01`: Selección y recorrido del DOM (`getElementById`, `querySelector`, `querySelectorAll`, `closest`).
   - `DOM-02`: Eventos del navegador y objeto `event` (`addEventListener`, `preventDefault`, `stopPropagation`).
   - `DOM-03`: Manipulación dinámica de elementos (`textContent`, `classList`, `createElement`, `appendChild`, prevención XSS).
   - `JS-04`: Funciones y alcance (*scope* léxico, `let`, `const`, funciones flecha y clausuras).
   - `DAT-05`: Estructuración y serialización JSON (`JSON.parse`, `JSON.stringify`).
   - `NET-06`: Consumo de APIs con HTTP y `fetch` (`GET`/`POST`, `response.ok`, códigos HTTP).
   - `ASY-07`: Asincronía con Promesas y `async/await` (`Promise`, `Promise.all`, flujo no bloqueante).
   - `ERR-08`: Manejo básico de errores (`try...catch...finally`, `throw new Error()`).

4. **Flujo Completo en 5 Vistas Experimentales + Panel del Investigador:**
   - `/login`: Acceso con código seudonimizado (`EST-001` a `EST-060`) y firma de Consentimiento Informado (LOPDP Ecuador).
   - `/pretest`: Evaluación diagnóstica inicial con cronometraje de alta precisión en cliente (`performance.now()`) y bloqueo de reingreso.
   - `/practica`: Entorno de entrenamiento adaptativo con resaltado de código JS, mapa de dominio en vivo y Panel Tutor RAG.
   - `/postest` y `/usabilidad`: Evaluación sumativa isomorfa y cuestionario de 8 ítems en escala Likert (1 a 5).
   - `/investigador`: Panel protegido por `ADMIN_SECRET` con validación docente bajo rúbrica de 5 criterios, simulador empírico del piloto y exportación directa a **CSV y JSON** (incluyendo Ganancia Bruta $G$ y Ganancia Normalizada de Hake $g$).

---

## Estructura del Proyecto

```text
EDUsim/
├── AGENTS.md / agents2.md                     # Especificación técnica y científica v2.0
├── EduSimDemo.tsx                             # Aplicación multi-vista completa
├── src/
│   ├── types/edusim.ts                        # Tipos de las 7 tablas y métricas científicas
│   ├── lib/mathEngine.ts                      # Fórmula asimétrica, bifurcación y Hake (g)
│   ├── lib/ragEngine.ts                       # Recuperación Top-5 MDN + Gemini/Groq + Fallback
│   ├── lib/exportUtils.ts                     # Exportación CSV/JSON y simulador de piloto
│   ├── data/seedData.ts                       # 40 ítems validados, 10 usuarios y 16 chunks RAG
│   ├── main.tsx                               # Entrada principal React
│   └── styles.css                             # Sistema de diseño accesible y responsivo
├── supabase/
│   └── migrations/001_edusim_schema.sql       # Esquema PostgreSQL + pgvector (7 tablas + RPC)
├── scripts/
│   └── seed.sql                               # Script SQL de carga inicial obligatoria
└── .env.example                               # Plantilla de variables de entorno
```

---

## Ejecución Local

```bash
npm install
npm run dev
```

Para compilar y verificar tipos en producción:

```bash
npm run build
npm run preview
```
