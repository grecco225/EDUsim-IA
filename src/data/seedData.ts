import type {
  BancoPregunta,
  CorpusRagItem,
  Participante,
  PerfilDominio,
  TopicCode,
  TopicMetadata,
} from "../types/edusim";
import { INITIAL_MASTERY, ORDERED_TOPICS } from "../lib/mathEngine";

export const CURRICULUM_TOPICS: Record<TopicCode, TopicMetadata> = {
  "DOM-01": {
    code: "DOM-01",
    shortName: "Selección DOM",
    title: "Selección y recorrido del DOM",
    description: "getElementById, querySelector, querySelectorAll y navegación de nodos.",
    keywords: ["getElementById", "querySelector", "querySelectorAll", "selector", "DOM", "nodo", "id", "clase"],
  },
  "DOM-02": {
    code: "DOM-02",
    shortName: "Eventos DOM",
    title: "Eventos del navegador y objeto event",
    description: "addEventListener, preventDefault, target y propagación de eventos.",
    keywords: ["addEventListener", "preventDefault", "stopPropagation", "event", "submit", "click", "target", "bubbling"],
  },
  "DOM-03": {
    code: "DOM-03",
    shortName: "Manipulación DOM",
    title: "Manipulación dinámica de elementos",
    description: "textContent, classList, createElement, appendChild y prevención de XSS.",
    keywords: ["textContent", "classList", "createElement", "appendChild", "innerHTML", "XSS", "atributo"],
  },
  "JS-04": {
    code: "JS-04",
    shortName: "Funciones y Scope",
    title: "Funciones y alcance (Scope léxico)",
    description: "let, const, funciones flecha, alcance de bloque y clausuras básicas.",
    keywords: ["scope", "let", "const", "arrow", "flecha", "clausura", "closure", "bloque", "shadowing"],
  },
  "DAT-05": {
    code: "DAT-05",
    shortName: "Serialización JSON",
    title: "Estructuración y serialización JSON",
    description: "JSON.parse, JSON.stringify y transformación entre objetos y cadenas.",
    keywords: ["JSON", "parse", "stringify", "serializar", "deserializar", "localStorage", "objeto", "cadena"],
  },
  "NET-06": {
    code: "NET-06",
    shortName: "HTTP y Fetch API",
    title: "Consumo de APIs con HTTP y fetch",
    description: "Peticiones GET/POST, cabeceras, response.ok y códigos de estado HTTP.",
    keywords: ["fetch", "HTTP", "GET", "POST", "response.ok", "status", "404", "500", "headers"],
  },
  "ASY-07": {
    code: "ASY-07",
    shortName: "Promesas y Async",
    title: "Asincronía con Promesas y async/await",
    description: "Flujo no bloqueante, estados de una Promise, async y await.",
    keywords: ["Promise", "async", "await", "pending", "fulfilled", "rejected", "asincronia", "json"],
  },
  "ERR-08": {
    code: "ERR-08",
    shortName: "Manejo de Errores",
    title: "Manejo básico de errores en JS y HTTP",
    description: "try...catch, finally y lanzamiento manual con throw new Error().",
    keywords: ["try", "catch", "finally", "throw", "Error", "excepcion", "validacion", "response.ok"],
  },
};

export const INITIAL_PARTICIPANTS: Participante[] = [
  {
    id: 1,
    estudiante_hash: "EST-001",
    condicion_grupo: "experimental_adaptativo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 2,
    estudiante_hash: "EST-002",
    condicion_grupo: "experimental_adaptativo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 3,
    estudiante_hash: "EST-003",
    condicion_grupo: "experimental_adaptativo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 4,
    estudiante_hash: "EST-004",
    condicion_grupo: "experimental_adaptativo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 5,
    estudiante_hash: "EST-005",
    condicion_grupo: "experimental_adaptativo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 6,
    estudiante_hash: "EST-006",
    condicion_grupo: "control_fijo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 7,
    estudiante_hash: "EST-007",
    condicion_grupo: "control_fijo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 8,
    estudiante_hash: "EST-008",
    condicion_grupo: "control_fijo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 9,
    estudiante_hash: "EST-009",
    condicion_grupo: "control_fijo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 10,
    estudiante_hash: "EST-010",
    condicion_grupo: "control_fijo",
    consentimiento_aceptado: false,
    fecha_consentimiento: null,
    pretest_completado: false,
    postest_completado: false,
    encuesta_completada: false,
    creado_en: "2026-11-01T08:00:00Z",
  },
];

export function createInitialProfilesForParticipants(
  participants: Participante[],
): PerfilDominio[] {
  let idCounter = 1;
  const profiles: PerfilDominio[] = [];
  for (const p of participants) {
    for (const tema of ORDERED_TOPICS) {
      profiles.push({
        id: idCounter++,
        estudiante_hash: p.estudiante_hash,
        tema,
        dominio_actual: INITIAL_MASTERY,
        actualizado_en: "2026-11-01T08:00:00Z",
      });
    }
  }
  return profiles;
}

export const INITIAL_QUESTIONS: BancoPregunta[] = [
  // ================= PRETEST (8 Ítems Validados de los 8 Temas) =================
  {
    id: 1,
    codigo_item: "PRE-01",
    tipo_uso: "pretest",
    tema: "DOM-01",
    nivel_bloom: "Aplicar",
    dificultad: 2,
    enunciado:
      'Dado el siguiente fragmento HTML, ¿qué expresión retorna únicamente el primer párrafo con la clase "nota" dentro de #panel?',
    codigo_js: `<div id="panel">\n  <p class="nota">Nota A</p>\n  <p class="nota">Nota B</p>\n</div>`,
    opciones: {
      A: 'document.getElementById(".nota")',
      B: 'document.querySelector("#panel .nota")',
      C: 'document.querySelectorAll("#panel .nota")[1]',
      D: 'document.getElementsByClassName("nota").first()',
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "document.querySelector() recibe un selector CSS válido y retorna el primer elemento coincidente dentro del árbol DOM.",
    pista_guiada:
      "Recuerda que querySelector acepta selectores CSS combinados (#id .clase) y devuelve el primer nodo coincidente.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 2,
    codigo_item: "PRE-02",
    tipo_uso: "pretest",
    tema: "DOM-02",
    nivel_bloom: "Comprender",
    dificultad: 2,
    enunciado:
      'Al manejar el envío de un formulario con form.addEventListener("submit", fn), ¿qué método del objeto event evita que la página se recargue?',
    codigo_js: `form.addEventListener("submit", (event) => {\n  // ¿Qué instrucción evita la recarga de página?\n});`,
    opciones: {
      A: "event.stopPropagation()",
      B: "event.preventDefault()",
      C: "event.cancelBubble()",
      D: "form.reset()",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "event.preventDefault() cancela la acción predeterminada del navegador asociada al evento submit sin detener su propagación.",
    pista_guiada:
      "Piensa en el método estándar del objeto Event que previene el comportamiento por defecto del navegador.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 3,
    codigo_item: "PRE-03",
    tipo_uso: "pretest",
    tema: "DOM-03",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      '¿Cuál es la secuencia segura para crear un elemento <li> con texto escrito por un usuario e insertarlo en <ul id="lista"> evitando inyección XSS?',
    opciones: {
      A: 'const li = document.createElement("li"); li.textContent = texto; lista.appendChild(li);',
      B: 'lista.innerHTML += "<li>" + texto + "</li>";',
      C: 'document.write("<li>" + texto + "</li>");',
      D: 'const li = new HTMLElement("li", texto); lista.append(li);',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "createElement crea el nodo en memoria, textContent escapa cualquier marca HTML evitando XSS y appendChild lo inserta en el contenedor.",
    pista_guiada:
      "Evita innerHTML cuando insertes texto de usuario; combina createElement, textContent y appendChild.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 4,
    codigo_item: "PRE-04",
    tipo_uso: "pretest",
    tema: "JS-04",
    nivel_bloom: "Analizar",
    dificultad: 3,
    enunciado: "¿Qué valores se imprimen en la consola al ejecutar este bloque de código?",
    codigo_js: `const factor = 2;\nconst calcular = (x) => {\n  const factor = 5;\n  return x * factor;\n};\nconsole.log(calcular(3), factor);`,
    opciones: {
      A: "6 2",
      B: "15 5",
      C: "15 2",
      D: "Lanza SyntaxError por redeclarar factor",
    },
    respuesta_correcta: "C",
    justificacion_pedagogica:
      "Por alcance léxico (block scope), la constante factor = 5 sombrea a la externa solo dentro de la función flecha (3 * 5 = 15), manteniendo factor = 2 fuera de ella.",
    pista_guiada:
      "Analiza el alcance de bloque de const dentro de la función flecha frente al ámbito externo.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 5,
    codigo_item: "PRE-05",
    tipo_uso: "pretest",
    tema: "DAT-05",
    nivel_bloom: "Aplicar",
    dificultad: 2,
    enunciado:
      "Si recibes una cadena JSON desde localStorage, ¿cómo accedes correctamente a la propiedad curso como objeto de JavaScript?",
    codigo_js: `const raw = '{"curso":"Desarrollo Web I","activo":true}';`,
    opciones: {
      A: "JSON.stringify(raw).curso",
      B: "JSON.parse(raw).curso",
      C: "raw.toObject().curso",
      D: "Object.fromJSON(raw).curso",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "JSON.parse() deserializa una cadena JSON válida y la convierte en un objeto nativo de JavaScript cuyas propiedades pueden leerse.",
    pista_guiada:
      "Diferencia entre serializar a texto (stringify) y reconstruir el objeto desde texto (parse).",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 6,
    codigo_item: "PRE-06",
    tipo_uso: "pretest",
    tema: "NET-06",
    nivel_bloom: "Comprender",
    dificultad: 3,
    enunciado:
      'Al usar fetch("https://api.ejemplo.edu/notas"), el servidor responde con estado HTTP 404 Not Found. ¿Qué ocurre con la promesa devuelta por fetch?',
    opciones: {
      A: "Se rechaza automáticamente entrando de inmediato al bloque catch",
      B: "Se resuelve normalmente, pero response.ok vale false y response.status vale 404",
      C: "Retorna null hasta que se invoque response.retry()",
      D: "Detiene el hilo principal del navegador con una excepción síncrona",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "fetch() solo rechaza su promesa ante fallos de red o CORS; los códigos HTTP 4xx y 5xx resuelven la promesa con response.ok === false.",
    pista_guiada:
      "Revisa qué valor toma la propiedad booleana response.ok cuando el estado HTTP no está entre 200 y 299.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 7,
    codigo_item: "PRE-07",
    tipo_uso: "pretest",
    tema: "ASY-07",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      "Dentro de una función declarada como async, ¿qué efecto tiene colocar la palabra clave await antes de response.json()?",
    opciones: {
      A: "Congela toda la interfaz gráfica del navegador hasta recibir los datos",
      B: "Pausa la ejecución de esa función async hasta que la promesa se resuelva, sin bloquear el hilo principal",
      C: "Convierte automáticamente la función en un hilo secundario del sistema operativo",
      D: "Ejecuta response.json() sin esperar a que la promesa termine",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "await suspende de forma no bloqueante la función async actual hasta que la Promesa cambie a estado fulfilled o rejected, liberando el event loop.",
    pista_guiada:
      "Recuerda que async/await es azúcar sintáctico no bloqueante construido sobre Promesas.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 8,
    codigo_item: "PRE-08",
    tipo_uso: "pretest",
    tema: "ERR-08",
    nivel_bloom: "Analizar",
    dificultad: 4,
    enunciado:
      "En una petición async/await con fetch, ¿cuál es el patrón correcto para capturar tanto fallos de red como respuestas HTTP 500 en un solo bloque catch?",
    opciones: {
      A: "Usar try { const r = await fetch(url); if (!r.ok) throw new Error(r.status); } catch (e) { ... }",
      B: "Usar únicamente fetch(url).then(r => r.json()) sin verificar r.ok",
      C: "Colocar try/catch únicamente alrededor de JSON.stringify()",
      D: "Usar window.onerror porque try/catch no captura errores con await",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Al verificar if (!r.ok) y lanzar manualmente throw new Error(), forzamos que los estados HTTP de error fluyan hacia el mismo bloque catch que captura fallos de red.",
    pista_guiada:
      "Combina la verificación de !response.ok con throw new Error() dentro de un bloque try...catch.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // ================= POSTEST ISOMORFO (8 Ítems Validados de los 8 Temas) =================
  {
    id: 9,
    codigo_item: "POST-01",
    tipo_uso: "postest",
    tema: "DOM-01",
    nivel_bloom: "Aplicar",
    dificultad: 2,
    enunciado:
      'En el siguiente bloque HTML, ¿qué instrucción selecciona el primer enlace con la clase "item" ubicado dentro de #menu?',
    codigo_js: `<nav id="menu">\n  <a class="item">Inicio</a>\n  <a class="item">Laboratorio</a>\n</nav>`,
    opciones: {
      A: 'document.querySelector("#menu .item")',
      B: 'document.getElementById("#menu .item")',
      C: 'document.querySelectorAll(".item").first()',
      D: 'document.getElementsByName("menu.item")[0]',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      'document.querySelector("#menu .item") evalúa el selector descendiente CSS y retorna el primer nodo <a> coincidente.',
    pista_guiada:
      "Usa el método del DOM que recibe cualquier selector CSS y devuelve el primer elemento.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 10,
    codigo_item: "POST-02",
    tipo_uso: "postest",
    tema: "DOM-02",
    nivel_bloom: "Comprender",
    dificultad: 2,
    enunciado:
      'Cuando un usuario hace clic en un enlace <a href="/salir"> pero deseas interceptarlo con addEventListener("click", fn) sin navegar fuera de la página, ¿qué debes invocar?',
    opciones: {
      A: "event.stopImmediatePropagation()",
      B: "event.preventDefault()",
      C: "window.stop()",
      D: "event.returnValue = true",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "event.preventDefault() detiene la navegación predeterminada del elemento <a> permitiendo manejar la acción con JavaScript.",
    pista_guiada:
      "Busca el método estándar de Event que cancela la acción por defecto del elemento HTML.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 11,
    codigo_item: "POST-03",
    tipo_uso: "postest",
    tema: "DOM-03",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      'Para agregar dinámicamente una tarjeta <article> con texto proveniente de un usuario y añadirle la clase "destacado" de forma segura, ¿qué código es el más adecuado?',
    opciones: {
      A: 'const art = document.createElement("article"); art.classList.add("destacado"); art.textContent = entrada; contenedor.appendChild(art);',
      B: 'contenedor.innerHTML = "<article class=destacado>" + entrada + "</article>";',
      C: 'const art = document.querySelector("article"); art.className.push("destacado");',
      D: 'document.createNode("article", entrada).appendTo(contenedor);',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "createElement junto con classList.add(), textContent y appendChild manipula el DOM de forma estructurada y previene vulnerabilidades XSS.",
    pista_guiada:
      "Utiliza la API estándar del DOM: createElement, classList.add, textContent y appendChild.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 12,
    codigo_item: "POST-04",
    tipo_uso: "postest",
    tema: "JS-04",
    nivel_bloom: "Analizar",
    dificultad: 3,
    enunciado: "¿Cuál es la salida en consola al ejecutar el siguiente fragmento?",
    codigo_js: `let base = 10;\nconst sumar = (n) => {\n  let base = 4;\n  return n + base;\n};\nconsole.log(sumar(6), base);`,
    opciones: {
      A: "16 10",
      B: "10 10",
      C: "10 4",
      D: "ReferenceError: base is not defined",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "Dentro de sumar, la variable local base = 4 tiene alcance de bloque (6 + 4 = 10), mientras que fuera de la función la variable base conserva su valor 10.",
    pista_guiada:
      "Evalúa primero la suma con la variable local dentro del bloque y luego el valor de la variable externa.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 13,
    codigo_item: "POST-05",
    tipo_uso: "postest",
    tema: "DAT-05",
    nivel_bloom: "Aplicar",
    dificultad: 2,
    enunciado:
      "Tienes el objeto perfil en memoria y necesitas enviarlo como texto en el cuerpo (body) de una petición HTTP POST. ¿Qué método debes usar?",
    codigo_js: `const perfil = { id: "EST-01", semestre: 3 };`,
    opciones: {
      A: "JSON.parse(perfil)",
      B: "JSON.stringify(perfil)",
      C: "perfil.toJSONText()",
      D: "String(perfil)",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "JSON.stringify() serializa un objeto o arreglo de JavaScript convirtiéndolo en una cadena de texto con formato JSON estándar.",
    pista_guiada:
      "Para transmitir un objeto por red en formato JSON, debes serializarlo a cadena de texto.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 14,
    codigo_item: "POST-06",
    tipo_uso: "postest",
    tema: "NET-06",
    nivel_bloom: "Comprender",
    dificultad: 3,
    enunciado:
      "Si realizas una petición con fetch() y el servidor responde con código 500 Internal Server Error, ¿cómo puedes detectarlo correctamente en tu código?",
    opciones: {
      A: "Comprobando if (!response.ok) o revisando response.status === 500 tras resolver fetch",
      B: "Esperando a que fetch devuelva undefined automáticamente",
      C: "Verificando si response === false",
      D: "No es posible detectar códigos 500 con la API fetch",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Debido a que fetch resuelve la promesa aun con códigos 500, es indispensable inspeccionar response.ok (que será false) o response.status.",
    pista_guiada:
      "Recuerda qué propiedad booleana de Response indica si el código HTTP estuvo en el rango 200-299.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 15,
    codigo_item: "POST-07",
    tipo_uso: "postest",
    tema: "ASY-07",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      "¿Qué retorna siempre una función declarada con la palabra clave async en JavaScript, incluso si su cuerpo ejecuta return 42?",
    opciones: {
      A: "El número primitivo 42 de forma síncrona inmediata",
      B: "Una Promesa (Promise) que se resuelve con el valor 42",
      C: "Un objeto Callback con estado 42",
      D: "Un hilo de ejecución bloqueante",
    },
    respuesta_correcta: "B",
    justificacion_pedagogica:
      "Toda función marcada como async envuelve automáticamente su valor de retorno en una instancia de Promise.",
    pista_guiada:
      "Piensa en el tipo de objeto que devuelve cualquier función async al ser invocada.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 16,
    codigo_item: "POST-08",
    tipo_uso: "postest",
    tema: "ERR-08",
    nivel_bloom: "Analizar",
    dificultad: 4,
    enunciado:
      "Observa el siguiente bloque try...catch. Si el servidor devuelve un código HTTP 403 Forbidden, ¿qué se imprime en console.error?",
    codigo_js: `try {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error("HTTP " + res.status);\n  return await res.json();\n} catch (err) {\n  console.error(err.message);\n}`,
    opciones: {
      A: '"HTTP 403"',
      B: "Nada, porque los errores HTTP no entran al catch aunque se use throw",
      C: "undefined",
      D: "Un objeto Response sin mensaje",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      'Como res.ok es false para el estado 403, se ejecuta throw new Error("HTTP 403"), transfiriendo el control al bloque catch donde err.message vale "HTTP 403".',
    pista_guiada:
      "Sigue el flujo de ejecución cuando res.ok es false y se lanza el objeto Error con el mensaje personalizado.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // ================= BANCO DE PRÁCTICA ADAPTATIVA Y REMEDIACIÓN (24 Ítems: 3 por cada uno de los 8 temas) =================
  // DOM-01
  {
    id: 17,
    codigo_item: "PRAC-01",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-01",
    nivel_bloom: "Recordar",
    dificultad: 1,
    enunciado:
      '¿Qué método del objeto document selecciona un elemento único utilizando exactamente el valor de su atributo id="cabecera" (sin incluir el símbolo #)?',
    codigo_js: `<header id="cabecera">Portal Académico</header>`,
    opciones: {
      A: 'document.getElementById("cabecera")',
      B: 'document.getElementById("#cabecera")',
      C: 'document.querySelectorAll("cabecera")',
      D: 'document.getElement("#cabecera")',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      'document.getElementById("cabecera") recibe el identificador exacto sin el prefijo # y retorna el elemento HTML correspondiente o null.',
    pista_guiada:
      "A diferencia de querySelector, getElementById NO lleva el símbolo # antes del nombre del id.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 18,
    codigo_item: "PRAC-02",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-01",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      '¿Qué devuelve document.querySelectorAll("ul.tareas > li.pendiente") y cómo puedes recorrer todos los elementos encontrados?',
    codigo_js: `const nodos = document.querySelectorAll("ul.tareas > li.pendiente");`,
    opciones: {
      A: "Devuelve una NodeList estática que puede recorrerse directamente con nodos.forEach(...)",
      B: "Devuelve un único elemento HTML y no permite iteración",
      C: "Devuelve una cadena JSON con los textos de los elementos",
      D: "Lanza un error si no encuentra al menos un elemento",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "querySelectorAll retorna una NodeList estática (vacía si no hay coincidencias) que implementa el método forEach() para iterar sobre cada nodo.",
    pista_guiada:
      "Recuerda que querySelectorAll retorna una colección NodeList iterable con forEach.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 19,
    codigo_item: "PRAC-03",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-01",
    nivel_bloom: "Analizar",
    dificultad: 4,
    enunciado:
      "Si un botón está dentro de una tarjeta <article class='card'>, ¿qué método permite subir por el árbol DOM desde el botón hasta encontrar su ancestro .card más cercano?",
    codigo_js: `boton.addEventListener("click", (e) => {\n  const tarjeta = e.currentTarget.closest(".card");\n});`,
    opciones: {
      A: 'elemento.closest(".card")',
      B: 'elemento.querySelector(".card")',
      C: 'document.parentNode(".card")',
      D: 'elemento.childNodes[".card"]',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      'El método element.closest(selector) recorre el elemento y sus padres hacia la raíz del documento hasta hallar el primer ancestro que coincida con el selector CSS.',
    pista_guiada:
      "Mientras querySelector busca hacia abajo (descendientes), closest() busca hacia arriba (ancestros).",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // DOM-02
  {
    id: 20,
    codigo_item: "PRAC-04",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-02",
    nivel_bloom: "Recordar",
    dificultad: 1,
    enunciado:
      "¿Cuál es el método estándar de JavaScript para registrar una función que se ejecute cuando el usuario haga clic en un botón?",
    codigo_js: `const btn = document.querySelector("#enviar");`,
    opciones: {
      A: 'btn.addEventListener("click", manejarClic)',
      B: 'btn.onEvent("click", manejarClic)',
      C: 'btn.listen("onClick", manejarClic)',
      D: 'document.triggerClick(btn, manejarClic)',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      'addEventListener("click", callback) es el método estándar del DOM que permite asociar uno o varios escuchadores de eventos sin sobrescribir los existentes.',
    pista_guiada:
      'El nombre del método en la especificación DOM Events es addEventListener(tipoEvento, funcion).',
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 21,
    codigo_item: "PRAC-05",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-02",
    nivel_bloom: "Comprender",
    dificultad: 2,
    enunciado:
      "En delegación de eventos sobre una lista <ul id='menu'>, ¿qué diferencia existe entre event.target y event.currentTarget?",
    codigo_js: `menu.addEventListener("click", (event) => {\n  console.log(event.target, event.currentTarget);\n});`,
    opciones: {
      A: "event.target es el elemento específico donde ocurrió el clic (ej. <li>) y event.currentTarget es el elemento que tiene registrado el listener (<ul>)",
      B: "Ambos apuntan siempre al objeto global window",
      C: "event.target es siempre <ul> y event.currentTarget es el nodo hijo",
      D: "event.currentTarget solo existe en eventos de teclado",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Gracias al burbujeo (bubbling), event.target identifica el nodo exacto que disparó el evento, mientras que event.currentTarget referencia al contenedor donde se llamó a addEventListener.",
    pista_guiada:
      "Piensa en target como el objetivo original del clic y currentTarget como el dueño actual del manejador.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 22,
    codigo_item: "PRAC-06",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-02",
    nivel_bloom: "Analizar",
    dificultad: 4,
    enunciado:
      "Tienes un botón dentro de una tarjeta que también tiene un evento click. Si al pulsar el botón NO quieres que el evento suba y active el click de la tarjeta padre, ¿qué método debes usar?",
    opciones: {
      A: "event.stopPropagation()",
      B: "event.preventDefault()",
      C: "event.clearBubbling()",
      D: "return false",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "event.stopPropagation() impide que el evento continúe propagándose en la fase de burbujeo hacia los elementos ancestros del árbol DOM.",
    pista_guiada:
      "No confundas preventDefault (acción por defecto del navegador) con stopPropagation (detener el viaje del evento hacia los padres).",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // DOM-03
  {
    id: 23,
    codigo_item: "PRAC-07",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-03",
    nivel_bloom: "Comprender",
    dificultad: 1,
    enunciado:
      '¿Qué método de classList alterna la clase "activo" en un elemento (la agrega si no está presente y la elimina si ya la tiene)?',
    codigo_js: `panel.classList.______("activo");`,
    opciones: {
      A: 'panel.classList.toggle("activo")',
      B: 'panel.classList.switch("activo")',
      C: 'panel.classList.replace("activo")',
      D: 'panel.classList.invert("activo")',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      'element.classList.toggle("activo") añade la clase si no existe en el elemento y la remueve si ya existe, devolviendo un booleano.',
    pista_guiada:
      "En inglés, el verbo para alternar un interruptor encendido/apagado en classList es toggle.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 24,
    codigo_item: "PRAC-08",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-03",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      "¿Por qué se recomienda usar elemento.textContent en lugar de elemento.innerHTML al mostrar comentarios ingresados por usuarios?",
    opciones: {
      A: "Porque textContent inserta únicamente texto plano y neutraliza etiquetas <script> maliciosas (prevención de XSS)",
      B: "Porque innerHTML no funciona dentro de etiquetas <div> o <p>",
      C: "Porque textContent compila automáticamente código TypeScript",
      D: "Porque innerHTML borra los estilos CSS de toda la página",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "textContent trata cualquier cadena como texto literal sin parsear etiquetas HTML, bloqueando vectores de ataque Cross-Site Scripting (XSS).",
    pista_guiada:
      "Considera qué ocurre si un usuario escribe '<img src=x onerror=alert(1)>' y lo asignas con innerHTML vs textContent.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 25,
    codigo_item: "PRAC-09",
    tipo_uso: "practica_adaptativa",
    tema: "DOM-03",
    nivel_bloom: "Analizar",
    dificultad: 4,
    enunciado:
      "Necesitas insertar 50 filas en una tabla sin provocar 50 reflujos (reflows) sucesivos en el documento real. ¿Qué estructura del DOM permite agrupar los nodos en memoria e insertarlos en una sola operación?",
    opciones: {
      A: "document.createDocumentFragment()",
      B: "document.createShadowDOM()",
      C: "window.createBufferNode()",
      D: "document.writeBatch()",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Un DocumentFragment es un contenedor ligero en memoria; al añadirle los 50 nodos y luego hacer tabla.appendChild(fragmento), el navegador realiza una sola actualización del DOM.",
    pista_guiada:
      "Busca el método del objeto document que crea un fragmento de documento ligero fuera del árbol principal.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // JS-04
  {
    id: 26,
    codigo_item: "PRAC-10",
    tipo_uso: "practica_adaptativa",
    tema: "JS-04",
    nivel_bloom: "Recordar",
    dificultad: 1,
    enunciado:
      "En JavaScript moderno (ES6+), ¿qué ocurre si declaras un objeto con const config = { tema: 'oscuro' } y luego ejecutas config.tema = 'claro'?",
    codigo_js: `const config = { tema: "oscuro" };\nconfig.tema = "claro";`,
    opciones: {
      A: "Es válido: const impide reasignar la variable config, pero permite mutar las propiedades internas del objeto",
      B: "Lanza un TypeError porque const congela profundamente todas las propiedades del objeto",
      C: "Ignora el cambio silenciosamente manteniendo 'oscuro'",
      D: "Convierte el objeto en una cadena de texto",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "const garantiza que el identificador apunte siempre a la misma referencia en memoria, pero las propiedades del objeto referenciado siguen siendo mutables.",
    pista_guiada:
      "Distingue entre reasignar la variable (config = ...) y modificar una propiedad (config.tema = ...).",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 27,
    codigo_item: "PRAC-11",
    tipo_uso: "practica_adaptativa",
    tema: "JS-04",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      "¿Cuál es la forma correcta de escribir una función flecha que retorna directamente un objeto literal { ok: true } sin usar la palabra return?",
    opciones: {
      A: "const crearEstado = () => ({ ok: true });",
      B: "const crearEstado = () => { ok: true };",
      C: "const crearEstado = => [ ok: true ];",
      D: "function => ({ ok: true })",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Al envolver el objeto literal entre paréntesis ({ ok: true }), el intérprete de JavaScript distingue el objeto de las llaves que delimitan el cuerpo de una función.",
    pista_guiada:
      "Sin paréntesis alrededor de { ok: true }, JavaScript interpreta las llaves como un bloque de código y no como un objeto.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 28,
    codigo_item: "PRAC-12",
    tipo_uso: "practica_adaptativa",
    tema: "JS-04",
    nivel_bloom: "Analizar",
    dificultad: 5,
    enunciado:
      "Analiza la siguiente clausura (closure). ¿Qué valores devuelven las dos llamadas sucesivas a contador()?",
    codigo_js: `function crearContador() {\n  let cuenta = 0;\n  return () => ++cuenta;\n}\nconst contador = crearContador();\nconsole.log(contador(), contador());`,
    opciones: {
      A: "1 y 2",
      B: "0 y 0",
      C: "1 y 1",
      D: "ReferenceError: cuenta is not defined",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "La función interna retiene una referencia al entorno léxico de crearContador() (clausura), preservando y actualizando el estado de la variable privada cuenta entre invocaciones.",
    pista_guiada:
      "Una clausura recuerda las variables de su ámbito externo incluso después de que la función externa terminó de ejecutarse.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // DAT-05
  {
    id: 29,
    codigo_item: "PRAC-13",
    tipo_uso: "practica_adaptativa",
    tema: "DAT-05",
    nivel_bloom: "Recordar",
    dificultad: 1,
    enunciado:
      "¿Qué método convierte un arreglo de objetos de JavaScript en una cadena de texto JSON lista para guardarse en localStorage?",
    codigo_js: `const tareas = [{ id: 1, hecha: false }];\nlocalStorage.setItem("tareas", ______(tareas));`,
    opciones: {
      A: "JSON.stringify",
      B: "JSON.parse",
      C: "JSON.encode",
      D: "Array.toJSON",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "localStorage solo almacena cadenas de texto; JSON.stringify(tareas) serializa la estructura de datos a texto JSON válido.",
    pista_guiada:
      "Para pasar de Objeto/Arreglo en memoria a String JSON se usa JSON.stringify.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 30,
    codigo_item: "PRAC-14",
    tipo_uso: "practica_adaptativa",
    tema: "DAT-05",
    nivel_bloom: "Comprender",
    dificultad: 2,
    enunciado:
      "¿Cuál de las siguientes cadenas es un documento JSON estandarizado y válido que NO lanzará error al pasarse a JSON.parse()?",
    opciones: {
      A: '\'{"nombre": "Ana", "semestre": 3, "beca": true}\'',
      B: "\"{'nombre': 'Ana', 'semestre': 3}\"",
      C: '\'{nombre: "Ana", semestre: 3,}\'',
      D: '\'{"nombre": "Ana", "calcular": function() { return 1; }}\'',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "El estándar JSON exige comillas dobles obligatorias en nombres de propiedades y cadenas, no permite comas finales (trailing commas) ni funciones.",
    pista_guiada:
      "Revisa qué opción usa comillas dobles en todas las claves y valores de texto sin incluir funciones ni comas sobrantes.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 31,
    codigo_item: "PRAC-15",
    tipo_uso: "practica_adaptativa",
    tema: "DAT-05",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      "Al serializar un objeto con JSON.stringify(), ¿qué ocurre con las propiedades cuyo valor es undefined o una función?",
    codigo_js: `const obj = { id: 10, clave: undefined, saludar: () => "hola" };\nconsole.log(JSON.stringify(obj));`,
    opciones: {
      A: 'Se omiten automáticamente, produciendo únicamente \'{"id":10}\'',
      B: "Lanza un TypeError deteniendo el programa",
      C: "Convierte las funciones en código fuente ejecutable dentro del JSON",
      D: 'Reemplaza undefined por la cadena "undefined"',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "JSON solo soporta objetos, arreglos, cadenas, números, booleanos y null; las propiedades con valores undefined, Function o Symbol en un objeto son omitidas por JSON.stringify.",
    pista_guiada:
      "Recuerda que JSON es un formato de datos puros y descarta funciones o valores undefined dentro de objetos.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // NET-06
  {
    id: 32,
    codigo_item: "PRAC-16",
    tipo_uso: "practica_adaptativa",
    tema: "NET-06",
    nivel_bloom: "Recordar",
    dificultad: 1,
    enunciado:
      "Si invocas fetch('https://api.universidad.edu/cursos') sin pasar un segundo argumento de opciones, ¿qué método HTTP utiliza por defecto?",
    opciones: {
      A: "GET",
      B: "POST",
      C: "PUT",
      D: "OPTIONS",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Por defecto, fetch(url) realiza una petición HTTP con el método GET para recuperar recursos del servidor.",
    pista_guiada:
      "El método HTTP predeterminado para consultar información de una URL es GET.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 33,
    codigo_item: "PRAC-17",
    tipo_uso: "practica_adaptativa",
    tema: "NET-06",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      "Para enviar datos en formato JSON mediante una petición HTTP POST con fetch, ¿qué configuración es indispensable en el segundo parámetro?",
    codigo_js: `await fetch("/api/estudiantes", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(datos)\n});`,
    opciones: {
      A: 'Definir method: "POST", la cabecera "Content-Type": "application/json" y serializar body con JSON.stringify(datos)',
      B: "Pasar el objeto directamente en body sin usar JSON.stringify",
      C: 'Usar method: "GET" junto con un body JSON',
      D: 'Colocar los datos dentro de response.send(datos)',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Una petición POST con carga JSON requiere especificar el verbo HTTP, declarar el tipo MIME application/json en headers y serializar el cuerpo a texto.",
    pista_guiada:
      "Verifica los tres elementos clave del objeto de opciones en fetch: method, headers y body serializado.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 34,
    codigo_item: "PRAC-18",
    tipo_uso: "practica_adaptativa",
    tema: "NET-06",
    nivel_bloom: "Analizar",
    dificultad: 4,
    enunciado:
      "¿Para qué rango de códigos de estado HTTP la propiedad booleana response.ok evalúa exactamente a true?",
    opciones: {
      A: "Códigos entre 200 y 299 (respuestas satisfactorias como 200 OK o 201 Created)",
      B: "Cualquier código menor a 500 (incluyendo 400 y 404)",
      C: "Únicamente para el código 200 exacto",
      D: "Códigos entre 100 y 399",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "La especificación Fetch define response.ok como true sí y solo si response.status se encuentra en el rango inclusivo 200–299.",
    pista_guiada:
      "Recuerda la familia de códigos de éxito 2xx del protocolo HTTP.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // ASY-07
  {
    id: 35,
    codigo_item: "PRAC-19",
    tipo_uso: "practica_adaptativa",
    tema: "ASY-07",
    nivel_bloom: "Recordar",
    dificultad: 1,
    enunciado:
      "¿Cuáles son los tres estados posibles por los que puede pasar un objeto Promise en JavaScript?",
    opciones: {
      A: "pending (pendiente), fulfilled (resuelta) y rejected (rechazada)",
      B: "start, running y stopped",
      C: "open, closed y cached",
      D: "sync, async y deferred",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Una Promesa nace en estado pending y transiciona de manera inmutable hacia fulfilled (éxito) o rejected (fallo).",
    pista_guiada:
      "Revisa la terminología estándar de ECMAScript para el ciclo de vida de una Promise.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 36,
    codigo_item: "PRAC-20",
    tipo_uso: "practica_adaptativa",
    tema: "ASY-07",
    nivel_bloom: "Aplicar",
    dificultad: 3,
    enunciado:
      "¿Por qué es necesario usar dos veces await al consumir JSON con fetch: primero en await fetch(url) y luego en await res.json()?",
    codigo_js: `const res = await fetch(url);\nconst data = await res.json();`,
    opciones: {
      A: "Porque fetch() devuelve una Promesa con los encabezados HTTP, y leer/parsear el cuerpo con res.json() también es una operación asíncrona que devuelve otra Promesa",
      B: "Porque JavaScript exige repetir await por cada variable const declarada",
      C: "Porque res.json() vuelve a realizar una segunda petición HTTP al servidor",
      D: "No es necesario; res.json() devuelve el objeto de forma síncrona",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "fetch resuelve tan pronto llegan las cabeceras de respuesta; el flujo de bytes del cuerpo aún debe descargarse y parsearse asíncronamente mediante la promesa que retorna res.json().",
    pista_guiada:
      "Tanto la conexión inicial (fetch) como la lectura completa del cuerpo (.json) retornan Promesas.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 37,
    codigo_item: "PRAC-21",
    tipo_uso: "practica_adaptativa",
    tema: "ASY-07",
    nivel_bloom: "Analizar",
    dificultad: 4,
    enunciado:
      "Si necesitas consultar dos endpoints independientes (/api/perfil y /api/notas) al mismo tiempo para minimizar el tiempo total de espera, ¿qué método de Promise es el más eficiente?",
    codigo_js: `const [resPerfil, resNotas] = await Promise.all([\n  fetch("/api/perfil"),\n  fetch("/api/notas")\n]);`,
    opciones: {
      A: "Promise.all([fetch('/api/perfil'), fetch('/api/notas')])",
      B: "Colocar un bucle while esperando a cada petición por separado",
      C: "Promise.reject([fetch('/api/perfil'), fetch('/api/notas')])",
      D: "No es posible iniciar dos promesas en paralelo en JavaScript",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Promise.all ejecuta ambas peticiones de forma concurrente y se resuelve cuando todas las promesas del arreglo se han completado exitosamente.",
    pista_guiada:
      "En lugar de esperar una tras otra en serie, Promise.all aguarda en paralelo a un arreglo de promesas.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },

  // ERR-08
  {
    id: 38,
    codigo_item: "PRAC-22",
    tipo_uso: "practica_adaptativa",
    tema: "ERR-08",
    nivel_bloom: "Recordar",
    dificultad: 1,
    enunciado:
      "En una estructura try { ... } catch (err) { ... } finally { ... }, ¿cuándo se ejecuta el bloque finally?",
    opciones: {
      A: "Siempre al finalizar, tanto si el bloque try tuvo éxito como si ocurrió un error capturado en catch",
      B: "Únicamente cuando NO ocurre ningún error en try",
      C: "Únicamente cuando falla el bloque catch",
      D: "Solo si se llama manualmente a window.finally()",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "El bloque finally se ejecuta invariablemente al terminar try/catch, siendo ideal para ocultar indicadores de carga (spinners) o liberar recursos.",
    pista_guiada:
      "Piensa en qué bloque utilizarías para apagar un 'Cargando...' sin importar si la petición acertó o falló.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 39,
    codigo_item: "PRAC-23",
    tipo_uso: "practica_adaptativa",
    tema: "ERR-08",
    nivel_bloom: "Comprender",
    dificultad: 2,
    enunciado:
      "¿Qué instrucción permite crear y lanzar manualmente una excepción descriptiva cuando un parámetro recibido es inválido?",
    codigo_js: `if (!idEstudiante) {\n  // Lanzar error descriptivo\n}`,
    opciones: {
      A: 'throw new Error("El código de estudiante es obligatorio");',
      B: 'catch new Error("El código de estudiante es obligatorio");',
      C: 'return Error.reject("El código de estudiante es obligatorio");',
      D: 'console.throw("El código de estudiante es obligatorio");',
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "La sentencia throw seguida de una instancia new Error(mensaje) interrumpe el flujo normal y transfiere el control al bloque catch más cercano.",
    pista_guiada:
      "Usa la palabra clave reservada throw junto con el constructor new Error(...).",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
  {
    id: 40,
    codigo_item: "PRAC-24",
    tipo_uso: "practica_adaptativa",
    tema: "ERR-08",
    nivel_bloom: "Analizar",
    dificultad: 5,
    enunciado:
      "Si una cadena JSON recibida de una fuente externa está corrupta (ej. '{activo: tru}'), ¿qué sucede al ejecutar JSON.parse(cadena) y cómo debes proteger la aplicación?",
    opciones: {
      A: "JSON.parse lanza un SyntaxError síncrono, por lo que debe envolverse en un bloque try...catch para mostrar un mensaje seguro sin romper la interfaz",
      B: "JSON.parse devuelve null silenciosamente sin necesidad de try...catch",
      C: "JSON.parse corrige automáticamente los errores ortográficos del JSON",
      D: "Solo puede capturarse reiniciando el navegador",
    },
    respuesta_correcta: "A",
    justificacion_pedagogica:
      "Cualquier texto que viole la gramática JSON provoca que JSON.parse arroje una excepción SyntaxError; envolverlo en try...catch previene el colapso del componente.",
    pista_guiada:
      "Recuerda que JSON.parse lanza una excepción de tipo SyntaxError cuando la cadena no es JSON válido.",
    validado_por_docente: true,
    creado_en: "2026-11-01T08:00:00Z",
  },
];

export const CORPUS_RAG_ITEMS: CorpusRagItem[] = [
  {
    id: 1,
    tema: "DOM-01",
    titulo_fuente: "MDN Web Docs — Selección de elementos: getElementById y querySelector",
    contenido:
      "document.getElementById(id) busca un elemento único por su atributo id exacto (sin anteponer '#'). Por su parte, document.querySelector(selector) recibe cualquier selector CSS válido (como '#panel .nota' o 'nav > a.item') y retorna únicamente el primer elemento descendiente que coincida, o null si no existe.",
    keywords: ["getElementById", "querySelector", "id", "selector", "primer", "null", "DOM-01"],
  },
  {
    id: 2,
    tema: "DOM-01",
    titulo_fuente: "MDN Web Docs — Colecciones NodeList con querySelectorAll y recorrido con closest()",
    contenido:
      "document.querySelectorAll(selector) devuelve una NodeList estática con todos los elementos que coinciden con el selector CSS, permitiendo iterar directamente con .forEach(). Para navegar hacia arriba en el árbol DOM desde un elemento hijo hasta un contenedor padre, element.closest(selector) busca el ancestro más cercano que cumpla el selector.",
    keywords: ["querySelectorAll", "NodeList", "forEach", "closest", "ancestro", "recorrido", "DOM-01"],
  },
  {
    id: 3,
    tema: "DOM-02",
    titulo_fuente: "MDN Web Docs — Registro de eventos con addEventListener y Event.preventDefault()",
    contenido:
      "target.addEventListener(tipo, callback) registra un manejador para eventos como 'click' o 'submit'. Cuando se dispara el evento, el callback recibe el objeto event. Invocar event.preventDefault() cancela la acción predeterminada del navegador (como recargar la página al enviar un <form> o navegar al pulsar un enlace <a>).",
    keywords: ["addEventListener", "preventDefault", "submit", "click", "formulario", "recargar", "DOM-02"],
  },
  {
    id: 4,
    tema: "DOM-02",
    titulo_fuente: "MDN Web Docs — Propagación de eventos (Bubbling), target vs currentTarget y stopPropagation()",
    contenido:
      "Los eventos en el DOM se propagan desde el nodo más específico hacia sus ancestros (fase de burbujeo o bubbling). En un listener delegado, event.target es el elemento exacto donde se originó la interacción, mientras que event.currentTarget es el elemento al que se asoció addEventListener. Para impedir que el evento siga subiendo a los nodos padres se invoca event.stopPropagation().",
    keywords: ["stopPropagation", "target", "currentTarget", "bubbling", "burbujeo", "delegacion", "DOM-02"],
  },
  {
    id: 5,
    tema: "DOM-03",
    titulo_fuente: "MDN Web Docs — Creación segura de nodos: createElement, textContent y appendChild",
    contenido:
      "Para insertar contenido dinámico proveniente del usuario sin riesgo de Cross-Site Scripting (XSS), nunca debe concatenarse en innerHTML. El flujo seguro es: 1) crear el elemento con document.createElement(tag); 2) asignar el texto con elemento.textContent = valor (que escapa etiquetas HTML); y 3) añadirlo al árbol con contenedor.appendChild(elemento).",
    keywords: ["createElement", "textContent", "appendChild", "innerHTML", "XSS", "seguro", "DOM-03"],
  },
  {
    id: 6,
    tema: "DOM-03",
    titulo_fuente: "MDN Web Docs — Gestión de clases con classList y optimización con DocumentFragment",
    contenido:
      "La propiedad elemento.classList ofrece métodos seguros para manipular clases CSS: add('clase'), remove('clase') y toggle('clase') (que alterna la presencia de la clase). Cuando se requiere insertar múltiples elementos en lote, document.createDocumentFragment() permite agruparlos en memoria y anexarlos en un solo reflow.",
    keywords: ["classList", "toggle", "add", "remove", "createDocumentFragment", "reflow", "DOM-03"],
  },
  {
    id: 7,
    tema: "JS-04",
    titulo_fuente: "MDN Web Docs — Alcance de bloque (Block Scope), let, const y sombreado de variables",
    contenido:
      "Las palabras clave let y const declaran variables con alcance de bloque (limitado al par de llaves {} donde se definen). Si una función declara internamente una variable let o const con el mismo nombre que una variable externa, ocurre sombreado (variable shadowing): la función opera sobre su copia local sin alterar el valor de la variable externa. Además, const impide reasignar la referencia, pero permite modificar propiedades de un objeto.",
    keywords: ["let", "const", "scope", "bloque", "shadowing", "sombreado", "objeto", "JS-04"],
  },
  {
    id: 8,
    tema: "JS-04",
    titulo_fuente: "MDN Web Docs — Funciones flecha (Arrow Functions) y Clausuras (Closures)",
    contenido:
      "Una función flecha (x) => expresion permite retorno implícito; si retorna directamente un objeto literal debe envolverse entre paréntesis: () => ({ ok: true }). Una clausura (closure) se forma cuando una función interna conserva acceso a las variables léxicas de su función externa incluso después de que la función externa ha finalizado su ejecución.",
    keywords: ["flecha", "arrow", "closure", "clausura", "objeto", "parentesis", "retorno", "JS-04"],
  },
  {
    id: 9,
    tema: "DAT-05",
    titulo_fuente: "MDN Web Docs — Deserialización con JSON.parse() y reglas sintácticas de JSON",
    contenido:
      "JSON.parse(cadena) recibe un texto con formato JSON válido y construye el objeto o arreglo de JavaScript correspondiente. El estándar JSON exige que todas las claves de propiedades y cadenas usen comillas dobles (\"clave\") y prohíbe comas finales o funciones. Si la cadena no cumple la sintaxis, JSON.parse lanza un SyntaxError.",
    keywords: ["JSON.parse", "parse", "deserializar", "comillas", "SyntaxError", "localStorage", "DAT-05"],
  },
  {
    id: 10,
    tema: "DAT-05",
    titulo_fuente: "MDN Web Docs — Serialización de objetos con JSON.stringify()",
    contenido:
      "JSON.stringify(valor) convierte un objeto o arreglo de JavaScript en una cadena de texto JSON, indispensable para enviarlo en el body de una petición HTTP o almacenarlo en localStorage. Durante la serialización de un objeto, las propiedades cuyos valores sean undefined, funciones o símbolos son omitidas automáticamente.",
    keywords: ["JSON.stringify", "stringify", "serializar", "body", "undefined", "funciones", "DAT-05"],
  },
  {
    id: 11,
    tema: "NET-06",
    titulo_fuente: "MDN Web Docs — Uso de Fetch API, métodos HTTP y verificación de response.ok",
    contenido:
      "fetch(url, opciones) realiza peticiones HTTP (usando el método GET por defecto). La promesa devuelta por fetch() NO se rechaza ante códigos de error HTTP como 404 Not Found o 500 Internal Server Error; en esos casos la promesa se resuelve normalmente pero la propiedad booleana response.ok vale false (response.ok solo es true para estados 200 a 299).",
    keywords: ["fetch", "response.ok", "status", "404", "500", "200", "GET", "NET-06"],
  },
  {
    id: 12,
    tema: "NET-06",
    titulo_fuente: "MDN Web Docs — Envío de datos JSON en peticiones POST con Fetch",
    contenido:
      "Para enviar datos a una API mediante HTTP POST con fetch, se pasa un objeto de configuración con method: 'POST', headers: { 'Content-Type': 'application/json' } y body: JSON.stringify(datos). Omitir la cabecera Content-Type o no serializar el body impide que el servidor interprete correctamente el documento JSON.",
    keywords: ["POST", "headers", "Content-Type", "application/json", "body", "stringify", "NET-06"],
  },
  {
    id: 13,
    tema: "ASY-07",
    titulo_fuente: "MDN Web Docs — Ciclo de vida de una Promise, funciones async y operador await",
    contenido:
      "Una Promise tiene tres estados: pending (pendiente), fulfilled (resuelta) y rejected (rechazada). Toda función declarada con la palabra clave async retorna siempre una Promise. Dentro de ella, el operador await pausa de forma no bloqueante la ejecución de esa función hasta que la promesa se resuelva, liberando el hilo principal del navegador.",
    keywords: ["Promise", "async", "await", "pending", "fulfilled", "rejected", "bloqueante", "ASY-07"],
  },
  {
    id: 14,
    tema: "ASY-07",
    titulo_fuente: "MDN Web Docs — Doble await en response.json() y concurrencia con Promise.all()",
    contenido:
      "Al consumir una API con fetch en una función async se requieren dos await: primero 'const res = await fetch(url)' para recibir las cabeceras HTTP, y luego 'const data = await res.json()' porque leer y parsear el flujo del cuerpo también devuelve una Promesa. Si se necesitan varias peticiones independientes al mismo tiempo, Promise.all([p1, p2]) las ejecuta en paralelo.",
    keywords: ["response.json", "json", "Promise.all", "paralelo", "concurrencia", "await", "ASY-07"],
  },
  {
    id: 15,
    tema: "ERR-08",
    titulo_fuente: "MDN Web Docs — Estructura try...catch...finally y lanzamiento manual con throw new Error()",
    contenido:
      "El bloque try...catch permite interceptar excepciones en tiempo de ejecución tanto en código síncrono (como JSON.parse fallido) como en promesas esperadas con await. La sentencia throw new Error('mensaje') crea y lanza manualmente una excepción que transfiere el control al bloque catch(err), donde err.message contiene la descripción. El bloque finally se ejecuta siempre al finalizar.",
    keywords: ["try", "catch", "finally", "throw", "Error", "message", "excepcion", "ERR-08"],
  },
  {
    id: 16,
    tema: "ERR-08",
    titulo_fuente: "MDN Web Docs — Patrón unificado de manejo de errores HTTP y de red en Fetch",
    contenido:
      "Dado que fetch() no lanza una excepción automática en estados HTTP 4xx o 5xx, el patrón estándar dentro de un bloque try consiste en evaluar inmediatamente 'if (!response.ok) { throw new Error(\"HTTP \" + response.status); }'. De este modo, tanto las caídas de red como las respuestas 403, 404 o 500 son capturadas de forma centralizada en el bloque catch.",
    keywords: ["response.ok", "throw", "HTTP", "403", "404", "500", "catch", "ERR-08"],
  },
];

export const USABILITY_LIKERT_ITEMS: { id: string; dimension: string; statement: string }[] = [
  {
    id: "q1",
    dimension: "Claridad de Interfaz",
    statement: "La interfaz de EduSim IA es clara, limpia y libre de distracciones durante la resolución de ejercicios.",
  },
  {
    id: "q2",
    dimension: "Alineación Curricular",
    statement: "Los problemas de código JavaScript corresponden fielmente a los temas de la asignatura Desarrollo Web I.",
  },
  {
    id: "q3",
    dimension: "Utilidad de la Retroalimentación",
    statement: "Las explicaciones y evidencias mostradas tras responder me ayudaron a comprender por qué acerté o fallé.",
  },
  {
    id: "q4",
    dimension: "Adaptación Pedagógica",
    statement: "La secuencia de actividades y el mapa de dominio por tema me permitieron enfocarme en mis puntos más débiles.",
  },
  {
    id: "q5",
    dimension: "Confianza Técnica",
    statement: "Siento mayor seguridad al programar manipulación del DOM, Fetch API, asincronía y manejo de errores tras usar la plataforma.",
  },
  {
    id: "q6",
    dimension: "Facilidad de Uso (SUS)",
    statement: "Cualquier estudiante de tercer semestre podría aprender a utilizar este entorno en pocos minutos sin ayuda técnica.",
  },
  {
    id: "q7",
    dimension: "Velocidad y Fluidez",
    statement: "El tiempo de respuesta del sistema al validar mis opciones y presentar nuevas actividades fue rápido y fluido.",
  },
  {
    id: "q8",
    dimension: "Satisfacción Global",
    statement: "Recomendaría integrar EduSim IA de forma permanente en las prácticas de laboratorio de Desarrollo Web I.",
  },
];
