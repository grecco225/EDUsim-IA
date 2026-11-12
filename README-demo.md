# EduSim IA: demo de aprendizaje adaptativo

Prototipo local de un tutor que propone actividades, explica el resultado y actualiza un perfil de dominio por tema. La interfaz está diseñada para presentar el flujo de personalización sin depender de servicios externos.

## Ejecutar en el navegador

### Requisitos

- Node.js 18.18 o superior.
- npm.

### Comandos

```bash
npm install
npm run dev
```

Después, abre la URL que muestra Vite, normalmente [http://localhost:5173](http://localhost:5173).

Para validar el bundle de producción:

```bash
npm run build
npm run preview
```

## Qué se puede probar

- Preguntas clasificadas por tema, nivel de Bloom y dificultad.
- Respuesta única con prevención de doble selección.
- Retroalimentación inmediata y evidencia asociada.
- Perfil de dominio reactivo por tema.
- Priorización visual del tema con menor dominio.
- Métricas de actividades respondidas, precisión y aciertos.
- Reinicio de la sesión sin persistencia.
- Diseño responsive para escritorio y móvil.
- Navegación por teclado, foco visible, regiones `aria-live` y barra de progreso accesible.

## Guion de demostración

1. Responde la primera actividad y observa cómo cambian precisión y dominio.
2. Revisa la evidencia que aparece después de responder.
3. Pulsa **Siguiente actividad** para continuar el ciclo.
4. Responde incorrectamente otra pregunta y compara el tratamiento visual del resultado.
5. Observa el tema priorizado en **Tu perfil** y en la recomendación del motor.
6. Pulsa **Reiniciar sesión** para volver al estado inicial.

## Ecuador: privacidad y cumplimiento

Esta versión está preparada como demo local para Ecuador y aplica medidas preventivas razonables:

- No solicita nombre, correo, edad, centro educativo ni ningún dato personal.
- No usa cookies, analítica, publicidad, tracking ni almacenamiento persistente.
- No realiza llamadas de red desde la aplicación.
- No incluye autenticación, perfiles reales ni procesamiento de datos de menores.
- Los resultados viven únicamente en el estado de React y desaparecen al recargar.
- El pie de página identifica la aplicación como prototipo no productivo.
- La interfaz incorpora prácticas básicas de accesibilidad: HTML semántico, foco visible, contraste cuidado, `aria-label`, `aria-live`, navegación por teclado y respeto por `prefers-reduced-motion`.

### Referencias que deberán revisarse antes de producción

- **Ley Orgánica de Protección de Datos Personales (LOPDP):** base legal, finalidad, minimización, transparencia, seguridad, conservación, atención de derechos y gestión de encargados del tratamiento.
- **Reglamento General de la LOPDP y criterios de la autoridad de protección de datos:** registro de tratamientos, evaluaciones de impacto y notificación de incidentes cuando sean aplicables al caso real.
- **Código de la Niñez y Adolescencia:** garantías reforzadas si el producto se usa con estudiantes menores de edad; se debe definir representación legal, información comprensible y protección frente a usos secundarios.
- **Ley Orgánica de Discapacidades y normativa técnica de accesibilidad aplicable:** la interfaz debe validarse con usuarios y herramientas especializadas, no solo con los controles incluidos en esta demo.
- **Normativa educativa, institucional y de propiedad intelectual:** autorización para materiales, evidencias, calificaciones y cualquier integración con una institución educativa.

Estas referencias no equivalen a una certificación legal. La aplicación no debe recopilar datos reales hasta definir responsable y encargado del tratamiento, base legal, aviso de privacidad, canal para ejercer derechos, plazos de conservación, controles de seguridad, gestión de incidentes y, cuando corresponda, consentimiento o autorización de representantes. Tampoco se debe presentar esta demo como cumplimiento legal completo: la revisión final depende del país, la institución, la edad de los estudiantes y el tratamiento concreto.

## Cómo funciona

### Banco local

Las preguntas están en `EduSimDemo.tsx` y cada registro contiene:

```ts
{
  id: number;
  topic: string;
  bloom: string;
  difficulty: number;
  text: string;
  options: string[];
  answer: number;
  evidence: string;
}
```

La respuesta correcta se representa mediante el índice de la opción. La evidencia es texto fijo; simula una fuente recuperada, pero no ejecuta RAG, embeddings ni búsqueda semántica.

### Actualización del dominio

- Acierto: suma `0.12` al dominio del tema.
- Error: resta `0.08`.
- El valor queda limitado al intervalo `0..1`.

Es una regla demostrativa, no un modelo psicométrico validado. La selección de preguntas continúa siendo secuencial; el motor muestra una recomendación basada en el tema más débil, pero todavía no reordena el banco con un algoritmo de recomendación real.

## Estructura

```text
EDUsim/
├── EduSimDemo.tsx       # componente principal
├── src/
│   ├── main.tsx         # entrada de React
│   └── styles.css       # sistema visual responsive
├── index.html           # documento HTML de la demo
├── package.json         # scripts y dependencias
├── tsconfig*.json       # configuración TypeScript
├── vite.config.ts       # configuración Vite
└── README-demo.md
```

## Fuera de alcance

Todavía no incluye PDF, MongoDB, Gemini, autenticación, API backend, historial, panel docente, analítica, exportación de reportes ni persistencia de usuarios.

## Próximos pasos

1. Separar preguntas y reglas de dominio en módulos testeables.
2. Añadir tests unitarios para corrección, puntuación y actualización del dominio.
3. Definir el país y el contexto institucional antes de diseñar el tratamiento de datos reales.
4. Incorporar consentimiento, política de privacidad y controles de eliminación si se agregan usuarios.
5. Sustituir la evidencia simulada por una recuperación documentada y auditable.
6. Validar accesibilidad con usuarios y herramientas automáticas antes de publicar.

La demo actual es una prueba visual y funcional del flujo, no una aplicación lista para producción.
