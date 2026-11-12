import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AppView,
  BancoPregunta,
  BitacoraTrazabilidad,
  EncuestaUsabilidad,
  OptionKey,
  Participante,
  PerfilDominio,
  TelemetriaRag,
  TopicCode,
} from "./src/types/edusim";
import {
  CORPUS_RAG_ITEMS,
   createInitialProfilesForParticipants,
  CURRICULUM_TOPICS,
  INITIAL_PARTICIPANTS,
  INITIAL_QUESTIONS,
  USABILITY_LIKERT_ITEMS,
} from "./src/data/seedData";
import {
  ALGORITHM_VERSION,
  buildStudentScientificSummary,
  calculateUpdatedMastery,
  getAsymmetricWeight,
  INITIAL_MASTERY,
  MASTERY_THRESHOLD,
  ORDERED_TOPICS,
  selectNextPracticeQuestion,
} from "./src/lib/mathEngine";
import { generateRagRemediation } from "./src/lib/ragEngine";
import {
  downloadCsvFile,
  downloadJsonFile,
  flattenSummariesForCsv,
  generatePilotSimulationData,
} from "./src/lib/exportUtils";

const STORAGE_KEY = "edusim_ia_scientific_state_v2";
const DEFAULT_ADMIN_SECRET =
  (import.meta.env.VITE_ADMIN_SECRET as string | undefined) || "EDUSIM-ADMIN-2026";

interface PersistedState {
  participants: Participante[];
  profiles: PerfilDominio[];
  questions: BancoPregunta[];
  logs: BitacoraTrazabilidad[];
  ragLogs: TelemetriaRag[];
  surveys: EncuestaUsabilidad[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (
        Array.isArray(parsed.participants) &&
        Array.isArray(parsed.questions) &&
        parsed.participants.length > 0
      ) {
        return parsed;
      }
    }
  } catch {
    // Ignorar errores de lectura de localStorage
  }
  return {
    participants: INITIAL_PARTICIPANTS,
    profiles: createInitialProfilesForParticipants(INITIAL_PARTICIPANTS),
    questions: INITIAL_QUESTIONS,
    logs: [],
    ragLogs: [],
    surveys: [],
  };
}

export default function EduSimDemo() {
  const [db, setDb] = useState<PersistedState>(loadInitialState);
  const [activeView, setActiveView] = useState<AppView>("/login");
  const [activeStudentHash, setActiveStudentHash] = useState<string>("EST-001");
  const [loginInput, setLoginInput] = useState<string>("EST-001");
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  // Estado para evaluaciones diagnósticas (Pretest / Postest)
  const [examIndex, setExamIndex] = useState<number>(0);
  const [examSelected, setExamSelected] = useState<OptionKey | null>(null);

  // Estado para sesión de práctica (/practica)
  const [practiceSelected, setPracticeSelected] = useState<OptionKey | null>(null);
  const [pendingRemediationTopic, setPendingRemediationTopic] =
    useState<TopicCode | null>(null);
  const [activeRagFeedback, setActiveRagFeedback] = useState<TelemetriaRag | null>(
    null,
  );
  const [isGeneratingRag, setIsGeneratingRag] = useState<boolean>(false);
  const [lastMasteryTransition, setLastMasteryTransition] = useState<{
    tema: TopicCode;
    prev: number;
    next: number;
    weight: number;
    correct: boolean;
  } | null>(null);

  // Estado para encuesta de usabilidad (/usabilidad)
  const [likertAnswers, setLikertAnswers] = useState<Record<string, number>>({
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
    q6: 5,
    q7: 5,
    q8: 5,
  });
  const [openComment, setOpenComment] = useState<string>("");

  // Estado para panel de investigador (/investigador)
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(false);
  const [adminKeyInput, setAdminKeyInput] = useState<string>("");
  const [adminError, setAdminError] = useState<string>("");
  const [adminTab, setAdminTab] = useState<
    "resumen" | "banco" | "bitacora" | "rag"
  >("resumen");
  const [filterTopic, setFilterTopic] = useState<string>("ALL");

  // Medición de tiempo de alta precisión en cliente con performance.now() (Sección 8 de agents2.md)
  const questionStartMsRef = useRef<number>(performance.now());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignorar cuota excedida en navegadores restringidos
    }
  }, [db]);

  const resetQuestionTimer = () => {
    questionStartMsRef.current = performance.now();
  };

  const getElapsedSeconds = (): number => {
    const diffSec = (performance.now() - questionStartMsRef.current) / 1000;
    return Number(Math.max(0.4, diffSec).toFixed(2));
  };

  // Participante actual
  const activeParticipant = useMemo(
    () =>
      db.participants.find((p) => p.estudiante_hash === activeStudentHash) ??
      db.participants[0],
    [db.participants, activeStudentHash],
  );

  // Mapa de dominio del participante actual
  const studentMasteryMap = useMemo(() => {
    const map: Record<TopicCode, number> = {
      "DOM-01": INITIAL_MASTERY,
      "DOM-02": INITIAL_MASTERY,
      "DOM-03": INITIAL_MASTERY,
      "JS-04": INITIAL_MASTERY,
      "DAT-05": INITIAL_MASTERY,
      "NET-06": INITIAL_MASTERY,
      "ASY-07": INITIAL_MASTERY,
      "ERR-08": INITIAL_MASTERY,
    };
    db.profiles
      .filter((p) => p.estudiante_hash === activeParticipant.estudiante_hash)
      .forEach((p) => {
        map[p.tema] = p.dominio_actual;
      });
    return map;
  }, [db.profiles, activeParticipant.estudiante_hash]);

  // Historial del participante actual
  const studentLogs = useMemo(
    () =>
      db.logs.filter(
        (l) => l.estudiante_hash === activeParticipant.estudiante_hash,
      ),
    [db.logs, activeParticipant.estudiante_hash],
  );

  const studentPracticeLogs = useMemo(
    () =>
      studentLogs.filter(
        (l) => l.tipo_actividad === "practica" || l.tipo_actividad === "remediacion",
      ),
    [studentLogs],
  );

  // Preguntas por tipo de uso
  const pretestQuestions = useMemo(
    () =>
      db.questions.filter((q) => q.tipo_uso === "pretest" && q.validado_por_docente),
    [db.questions],
  );

  const postestQuestions = useMemo(
    () =>
      db.questions.filter((q) => q.tipo_uso === "postest" && q.validado_por_docente),
    [db.questions],
  );

  // Selección de pregunta actual en /practica
  const currentPracticeSelection = useMemo(
    () =>
      selectNextPracticeQuestion({
        condition: activeParticipant.condicion_grupo,
        practiceBank: db.questions.filter(
          (q) => q.tipo_uso === "practica_adaptativa",
        ),
        masteryMap: studentMasteryMap,
        history: studentLogs,
        pendingRemediationTopic,
      }),
    [
      activeParticipant.condicion_grupo,
      db.questions,
      studentMasteryMap,
      studentLogs,
      pendingRemediationTopic,
    ],
  );

  // Tema más débil actual
  const weakestTopic = useMemo(() => {
    return [...ORDERED_TOPICS].sort(
      (a, b) => studentMasteryMap[a] - studentMasteryMap[b],
    )[0];
  }, [studentMasteryMap]);

  // Resúmenes científicos consolidados para todos los participantes
  const allScientificSummaries = useMemo(() => {
    return db.participants.map((participant) =>
      buildStudentScientificSummary({
        participant,
        profiles: db.profiles,
        logs: db.logs,
        survey: db.surveys.find(
          (s) => s.estudiante_hash === participant.estudiante_hash,
        ),
      }),
    );
  }, [db.participants, db.profiles, db.logs, db.surveys]);

  const currentStudentSummary = useMemo(
    () =>
      allScientificSummaries.find(
        (s) => s.estudiante_hash === activeParticipant.estudiante_hash,
      ),
    [allScientificSummaries, activeParticipant.estudiante_hash],
  );

  // Cambiar de vista reiniciando temporizador de pregunta
  function navigateTo(view: AppView) {
    setExamIndex(0);
    setExamSelected(null);
    setPracticeSelected(null);
    setActiveRagFeedback(null);
    setLastMasteryTransition(null);
    resetQuestionTimer();
    setActiveView(view);
  }

  // Autenticación por código seudonimizado EST-XXX
  function handleStudentLogin(codeRaw: string) {
    const normalized = codeRaw.trim().toUpperCase();
    if (!/^EST-\d{3}$/.test(normalized)) {
      alert("Ingresa un código seudonimizado válido en formato EST-001 a EST-060.");
      return;
    }

    const existing = db.participants.find((p) => p.estudiante_hash === normalized);
    if (!existing) {
      const num = parseInt(normalized.replace("EST-", ""), 10);
      const assignedGroup =
        num % 2 === 1 ? "experimental_adaptativo" : "control_fijo";
      const newParticipant: Participante = {
        id: db.participants.length + 1,
        estudiante_hash: normalized,
        condicion_grupo: assignedGroup,
        consentimiento_aceptado: false,
        fecha_consentimiento: null,
        pretest_completado: false,
        postest_completado: false,
        encuesta_completada: false,
        creado_en: new Date().toISOString(),
      };
      const newProfiles = ORDERED_TOPICS.map((tema, i) => ({
        id: db.profiles.length + i + 1,
        estudiante_hash: normalized,
        tema,
        dominio_actual: INITIAL_MASTERY,
        actualizado_en: new Date().toISOString(),
      }));
      setDb((prev) => ({
        ...prev,
        participants: [...prev.participants, newParticipant],
        profiles: [...prev.profiles, ...newProfiles],
      }));
    }

    setActiveStudentHash(normalized);
    setLoginInput(normalized);
    setConsentChecked(false);
    setPendingRemediationTopic(null);
    setPracticeSelected(null);
    setActiveRagFeedback(null);
    resetQuestionTimer();
  }

  // Aceptar consentimiento informado (LOPDP Ecuador)
  function handleAcceptConsent() {
    const nowIso = new Date().toISOString();
    setDb((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.estudiante_hash === activeParticipant.estudiante_hash
          ? {
              ...p,
              consentimiento_aceptado: true,
              fecha_consentimiento: nowIso,
            }
          : p,
      ),
    }));
  }

  // Registrar respuesta en Pretest o Postest (sin pistas ni feedback inmediato)
  function handleSubmitExamQuestion(mode: "pretest" | "postest") {
    if (!examSelected) return;
    const bank = mode === "pretest" ? pretestQuestions : postestQuestions;
    const currentQ = bank[examIndex];
    if (!currentQ) return;

    const elapsedSec = getElapsedSeconds();
    const isCorrect = examSelected === currentQ.respuesta_correcta;
    const prevD = studentMasteryMap[currentQ.tema] ?? INITIAL_MASTERY;
    const nextD = calculateUpdatedMastery(prevD, currentQ.dificultad, isCorrect);
    const nowIso = new Date().toISOString();

    const newLog: BitacoraTrazabilidad = {
      id: db.logs.length + 1,
      estudiante_hash: activeParticipant.estudiante_hash,
      condicion_grupo: activeParticipant.condicion_grupo,
      codigo_item: currentQ.codigo_item,
      tipo_actividad: mode,
      tema: currentQ.tema,
      nivel_bloom: currentQ.nivel_bloom,
      dificultad: currentQ.dificultad,
      opcion_elegida: examSelected,
      resultado: isCorrect,
      tiempo_segundos: elapsedSec,
      dominio_previo: prevD,
      dominio_posterior: nextD,
      motivo_seleccion:
        mode === "pretest"
          ? "Evaluación diagnóstica inicial (Pretest)"
          : "Evaluación sumativa isomorfa (Postest)",
      version_algoritmo: ALGORITHM_VERSION,
      creado_en: nowIso,
    };

    const isLast = examIndex + 1 >= bank.length;

    setDb((prev) => ({
      ...prev,
      logs: [...prev.logs, newLog],
      profiles: prev.profiles.map((prof) =>
        prof.estudiante_hash === activeParticipant.estudiante_hash &&
        prof.tema === currentQ.tema
          ? { ...prof, dominio_actual: nextD, actualizado_en: nowIso }
          : prof,
      ),
      participants: prev.participants.map((p) =>
        p.estudiante_hash === activeParticipant.estudiante_hash && isLast
          ? mode === "pretest"
            ? { ...p, pretest_completado: true }
            : { ...p, postest_completado: true }
          : p,
      ),
    }));

    if (isLast) {
      setExamSelected(null);
      setExamIndex(0);
      if (mode === "pretest") {
        navigateTo("/practica");
      } else {
        navigateTo("/usabilidad");
      }
    } else {
      setExamSelected(null);
      setExamIndex((idx) => idx + 1);
      resetQuestionTimer();
    }
  }

  // Responder actividad en /practica con actualización asimétrica y RAG condicional
  async function handleAnswerPractice(option: OptionKey) {
    if (practiceSelected !== null || isGeneratingRag) return;

    const currentQ = currentPracticeSelection.question;
    const activityType = currentPracticeSelection.activityType;
    const selectionReason = currentPracticeSelection.reason;

    const elapsedSec = getElapsedSeconds();
    const isCorrect = option === currentQ.respuesta_correcta;
    const prevD = studentMasteryMap[currentQ.tema] ?? INITIAL_MASTERY;
    const nextD = calculateUpdatedMastery(prevD, currentQ.dificultad, isCorrect);
    const weightUsed = getAsymmetricWeight(currentQ.dificultad, isCorrect);
    const nowIso = new Date().toISOString();
    const interactionId = db.logs.length + 1;

    setPracticeSelected(option);
    setLastMasteryTransition({
      tema: currentQ.tema,
      prev: prevD,
      next: nextD,
      weight: weightUsed,
      correct: isCorrect,
    });

    const newLog: BitacoraTrazabilidad = {
      id: interactionId,
      estudiante_hash: activeParticipant.estudiante_hash,
      condicion_grupo: activeParticipant.condicion_grupo,
      codigo_item: currentQ.codigo_item,
      tipo_actividad: activityType,
      tema: currentQ.tema,
      nivel_bloom: currentQ.nivel_bloom,
      dificultad: currentQ.dificultad,
      opcion_elegida: option,
      resultado: isCorrect,
      tiempo_segundos: elapsedSec,
      dominio_previo: prevD,
      dominio_posterior: nextD,
      motivo_seleccion: selectionReason,
      version_algoritmo: ALGORITHM_VERSION,
      creado_en: nowIso,
    };

    setDb((prev) => ({
      ...prev,
      logs: [...prev.logs, newLog],
      profiles: prev.profiles.map((prof) =>
        prof.estudiante_hash === activeParticipant.estudiante_hash &&
        prof.tema === currentQ.tema
          ? { ...prof, dominio_actual: nextD, actualizado_en: nowIso }
          : prof,
      ),
    }));

    // Bifurcación Experimental (Sección 5.2 de agents2.md):
    // SOLO el Grupo Experimental ('experimental_adaptativo') invoca RAG y entra a remediación guiada
    if (activeParticipant.condicion_grupo === "experimental_adaptativo") {
      if (!isCorrect) {
        setIsGeneratingRag(true);
        try {
          const ragTelemetry = await generateRagRemediation({
            condition: activeParticipant.condicion_grupo,
            interaccionId: interactionId,
            estudianteHash: activeParticipant.estudiante_hash,
            question: currentQ,
            selectedOption: option,
          });
          setActiveRagFeedback(ragTelemetry);
          setDb((prev) => ({
            ...prev,
            ragLogs: [...prev.ragLogs, ragTelemetry],
          }));
        } finally {
          setIsGeneratingRag(false);
        }
      } else {
        setActiveRagFeedback(null);
      }
    }
  }

  function handleNextPracticeQuestion() {
    if (practiceSelected === null) return;
    const currentQ = currentPracticeSelection.question;
    const wasCorrect = practiceSelected === currentQ.respuesta_correcta;
    const currentD = studentMasteryMap[currentQ.tema] ?? INITIAL_MASTERY;

    // Si es Grupo A y falló (y aún no estaba en remediación), activar bucle de remediación guiada en ese tema
    if (
      activeParticipant.condicion_grupo === "experimental_adaptativo" &&
      !wasCorrect &&
      currentPracticeSelection.activityType !== "remediacion" &&
      currentD < MASTERY_THRESHOLD
    ) {
      setPendingRemediationTopic(currentQ.tema);
    } else {
      setPendingRemediationTopic(null);
    }

    setPracticeSelected(null);
    setActiveRagFeedback(null);
    setLastMasteryTransition(null);
    resetQuestionTimer();
  }

  // Guardar encuesta de usabilidad (8 ítems Likert 1-5)
  function handleSaveUsabilitySurvey() {
    const nowIso = new Date().toISOString();
    const newSurvey: EncuestaUsabilidad = {
      id: db.surveys.length + 1,
      estudiante_hash: activeParticipant.estudiante_hash,
      respuestas: { ...likertAnswers },
      comentarios_abiertos:
        openComment.trim() || "Sin comentarios adicionales.",
      creado_en: nowIso,
    };

    setDb((prev) => ({
      ...prev,
      surveys: [
        ...prev.surveys.filter(
          (s) => s.estudiante_hash !== activeParticipant.estudiante_hash,
        ),
        newSurvey,
      ],
      participants: prev.participants.map((p) =>
        p.estudiante_hash === activeParticipant.estudiante_hash
          ? { ...p, encuesta_completada: true }
          : p,
      ),
    }));
  }

  // Validar / Invalidar pregunta en el banco docente (/investigador)
  function handleToggleQuestionValidation(questionId: number) {
    setDb((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? { ...q, validado_por_docente: !q.validado_por_docente }
          : q,
      ),
    }));
  }

  // Ejecutar simulación de piloto completo para los 10 estudiantes
  function handleSimulateFullPilot() {
    const simulated = generatePilotSimulationData({
      participants: INITIAL_PARTICIPANTS,
      questions: db.questions,
    });
    setDb((prev) => ({
      ...prev,
      participants: simulated.participants,
      profiles: simulated.profiles,
      logs: simulated.logs,
      ragLogs: simulated.ragLogs,
      surveys: simulated.surveys,
    }));
  }

  // Restaurar base de datos limpia (Seed inicial)
  function handleResetDatabaseToSeed() {
    localStorage.removeItem(STORAGE_KEY);
    setDb({
      participants: INITIAL_PARTICIPANTS,
      profiles: createInitialProfilesForParticipants(INITIAL_PARTICIPANTS),
      questions: INITIAL_QUESTIONS,
      logs: [],
      ragLogs: [],
      surveys: [],
    });
    setPendingRemediationTopic(null);
    setPracticeSelected(null);
    setActiveRagFeedback(null);
    setLastMasteryTransition(null);
    resetQuestionTimer();
  }

  // Estadísticas comparativas por grupo para /investigador
  const groupComparison = useMemo(() => {
    const calcGroupStats = (group: "experimental_adaptativo" | "control_fijo") => {
      const items = allScientificSummaries.filter((s) => s.condicion_grupo === group);
      const withPre = items.filter((s) => s.pretest_score_pct !== null);
      const withPost = items.filter((s) => s.postest_score_pct !== null);
      const withHake = items.filter((s) => s.ganancia_hake_g !== null);
      const withUsability = items.filter((s) => s.usabilidad_promedio !== null);

      const avg = (arr: number[]) =>
        arr.length > 0
          ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
          : null;

      return {
        count: items.length,
        avgPretest: avg(withPre.map((s) => s.pretest_score_pct!)),
        avgPostest: avg(withPost.map((s) => s.postest_score_pct!)),
        avgGainG: avg(withHake.map((s) => s.ganancia_bruta_G!)),
        avgHakeG:
          withHake.length > 0
            ? Number(
                (
                  withHake.reduce((a, b) => a + b.ganancia_hake_g!, 0) /
                  withHake.length
                ).toFixed(3),
              )
            : null,
        avgMastery: Number(
          (
            items.reduce((a, b) => a + b.dominio_promedio, 0) /
            Math.max(1, items.length)
          ).toFixed(3),
        ),
        avgUsability: avg(withUsability.map((s) => s.usabilidad_promedio!)),
        totalRagRemediations: items.reduce((a, b) => a + b.remediaciones_rag, 0),
      };
    };

    return {
      experimental: calcGroupStats("experimental_adaptativo"),
      control: calcGroupStats("control_fijo"),
    };
  }, [allScientificSummaries]);

  return (
    <main className="app-shell">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido principal
      </a>
      <div className="app-frame">
        {/* BARRA SUPERIOR INSTITUCIONAL Y NAVEGACIÓN DE 5 VISTAS */}
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              E
            </div>
            <div>
              <p className="eyebrow">
                Instrumento Científico Cuasiexperimental · Desarrollo Web I
              </p>
              <p className="brand-name">
                EduSim <span>IA</span>{" "}
                <small className="version-pill">{ALGORITHM_VERSION}</small>
              </p>
            </div>
          </div>

          <nav className="view-nav" aria-label="Vistas del protocolo experimental">
            {(
              [
                { path: "/login", label: "1. Acceso y Consentimiento" },
                { path: "/pretest", label: "2. Pretest" },
                { path: "/practica", label: "3. Práctica ITS/RAG" },
                { path: "/postest", label: "4. Postest" },
                { path: "/usabilidad", label: "5. Usabilidad" },
                { path: "/investigador", label: "Panel Investigador" },
              ] as { path: AppView; label: string }[]
            ).map((item) => (
              <button
                key={item.path}
                type="button"
                className={`nav-tab ${activeView === item.path ? "active" : ""}`}
                onClick={() => navigateTo(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="session-pill">
            <span className="dot" aria-hidden="true" />
            <div>
              <strong>{activeParticipant.estudiante_hash}</strong>
              <small>
                {activeParticipant.condicion_grupo === "experimental_adaptativo"
                  ? "Grupo A · Experimental (Adaptativo + RAG)"
                  : "Grupo B · Control (Secuencia Fija)"}
              </small>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL POR VISTA */}
        <div id="contenido-principal">
          {/* =================================================================
              VISTA 1: /login Y CONSENTIMIENTO INFORMADO
             ================================================================= */}
          {activeView === "/login" && (
            <div className="content-grid">
              <section className="practice-panel">
                <p className="eyebrow accent">
                  Fase 1 · Identificación Seudonimizada y Ética de Investigación
                </p>
                <h1 className="hero-title">
                  Ingreso al Estudio Cuasiexperimental de Desarrollo Web I
                </h1>
                <p className="intro-copy">
                  En cumplimiento con la{" "}
                  <strong>Ley Orgánica de Protección de Datos Personales (LOPDP — Ecuador)</strong>,
                  EduSim IA no almacena nombres ni correos electrónicos. Ingresa con tu
                  código asignado (<code>EST-001</code> a <code>EST-060</code>) o
                  selecciona uno de los 10 perfiles precargados del seed experimental.
                </p>

                <div className="login-box">
                  <label htmlFor="student-code-input" className="field-label">
                    Código de Participante Seudonimizado
                  </label>
                  <div className="login-input-row">
                    <input
                      id="student-code-input"
                      type="text"
                      className="text-input"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="Ej: EST-001"
                    />
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => handleStudentLogin(loginInput)}
                    >
                      Cargar Participante
                    </button>
                  </div>

                  <p className="field-hint">
                    Selección rápida de los 10 usuarios del Seed Obligatorio:
                  </p>
                  <div className="seed-user-grid">
                    {db.participants.slice(0, 10).map((p) => (
                      <button
                        key={p.estudiante_hash}
                        type="button"
                        className={`seed-chip ${
                          p.estudiante_hash === activeParticipant.estudiante_hash
                            ? "selected"
                            : ""
                        } ${
                          p.condicion_grupo === "experimental_adaptativo"
                            ? "exp"
                            : "ctrl"
                        }`}
                        onClick={() => handleStudentLogin(p.estudiante_hash)}
                      >
                        <strong>{p.estudiante_hash}</strong>
                        <span>
                          {p.condicion_grupo === "experimental_adaptativo"
                            ? "Grupo A (Adapt+RAG)"
                            : "Grupo B (Control)"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PROTOCOLO DE CONSENTIMIENTO INFORMADO */}
                <div className="consent-card">
                  <div className="consent-header">
                    <div>
                      <p className="eyebrow">Documento Ético Obligatorio</p>
                      <h2>Consentimiento Informado y Protección de Datos</h2>
                    </div>
                    <span
                      className={`status-badge ${
                        activeParticipant.consentimiento_aceptado
                          ? "accepted"
                          : "pending"
                      }`}
                    >
                      {activeParticipant.consentimiento_aceptado
                        ? "✓ Consentimiento Firmado"
                        : "Pendiente de Aceptación"}
                    </span>
                  </div>

                  <ul className="consent-list">
                    <li>
                      <strong>Propósito científico:</strong> Evaluar el impacto de un
                      Sistema Tutor Inteligente con adaptación asimétrica y RAG en el
                      aprendizaje de JavaScript y manipulación del DOM en estudiantes de
                      tercer semestre.
                    </li>
                    <li>
                      <strong>Seudonimización y confidencialidad:</strong> Tus respuestas,
                      tiempos de resolución en milisegundos y progresión de dominio se
                      asocian exclusivamente al hash{" "}
                      <code>{activeParticipant.estudiante_hash}</code>.
                    </li>
                    <li>
                      <strong>Participación voluntaria:</strong> Puedes retirarte del
                      piloto en cualquier momento sin afectación a tus calificaciones
                      académicas.
                    </li>
                  </ul>

                  {!activeParticipant.consentimiento_aceptado ? (
                    <div className="consent-actions">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={consentChecked}
                          onChange={(e) => setConsentChecked(e.target.checked)}
                        />
                        <span>
                          He leído el protocolo de investigación y acepto participar
                          voluntariamente bajo el código{" "}
                          <strong>{activeParticipant.estudiante_hash}</strong>.
                        </span>
                      </label>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={!consentChecked}
                        onClick={handleAcceptConsent}
                      >
                        Firmar Consentimiento y Habilitar Estudio →
                      </button>
                    </div>
                  ) : (
                    <div className="consent-confirmed-bar">
                      <span>
                        Consentimiento registrado el{" "}
                        <strong>
                          {new Date(
                            activeParticipant.fecha_consentimiento ?? Date.now(),
                          ).toLocaleString()}
                        </strong>
                      </span>
                      <div className="actions" style={{ marginTop: 0 }}>
                        {!activeParticipant.pretest_completado ? (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => navigateTo("/pretest")}
                          >
                            Iniciar Pretest Diagnóstico →
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => navigateTo("/practica")}
                          >
                            Continuar a Entorno de Práctica →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* PANEL LATERAL: RUTA DEL PARTICIPANTE Y 8 TEMAS */}
              <aside className="sidebar">
                <section className="side-panel">
                  <p className="eyebrow">Estado del Participante</p>
                  <h2>Ruta del Protocolo ({activeParticipant.estudiante_hash})</h2>
                  <div className="step-checklist">
                    <div
                      className={`step-item ${
                        activeParticipant.consentimiento_aceptado ? "done" : ""
                      }`}
                    >
                      <span>1. Consentimiento Informado</span>
                      <strong>
                        {activeParticipant.consentimiento_aceptado
                          ? "Completado"
                          : "Pendiente"}
                      </strong>
                    </div>
                    <div
                      className={`step-item ${
                        activeParticipant.pretest_completado ? "done" : ""
                      }`}
                    >
                      <span>2. Pretest Diagnóstico (Línea Base)</span>
                      <strong>
                        {activeParticipant.pretest_completado
                          ? `${currentStudentSummary?.pretest_score_pct ?? 0}%`
                          : "Pendiente"}
                      </strong>
                    </div>
                    <div
                      className={`step-item ${
                        studentPracticeLogs.length > 0 ? "done" : ""
                      }`}
                    >
                      <span>3. Práctica ({activeParticipant.condicion_grupo})</span>
                      <strong>{studentPracticeLogs.length} actividades</strong>
                    </div>
                    <div
                      className={`step-item ${
                        activeParticipant.postest_completado ? "done" : ""
                      }`}
                    >
                      <span>4. Postest Sumativo Isomorfo</span>
                      <strong>
                        {activeParticipant.postest_completado
                          ? `${currentStudentSummary?.postest_score_pct ?? 0}%`
                          : "Pendiente"}
                      </strong>
                    </div>
                    <div
                      className={`step-item ${
                        activeParticipant.encuesta_completada ? "done" : ""
                      }`}
                    >
                      <span>5. Encuesta Likert de Usabilidad</span>
                      <strong>
                        {activeParticipant.encuesta_completada
                          ? `${currentStudentSummary?.usabilidad_promedio ?? 5}/5`
                          : "Pendiente"}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="side-panel">
                  <p className="eyebrow">Modelo de Dominio Curricular</p>
                  <h2>8 Temas Obligatorios (Desarrollo Web I)</h2>
                  <div className="topic-mini-list">
                    {ORDERED_TOPICS.map((code) => (
                      <div key={code} className="topic-mini-row">
                        <span className="tag blue">{code}</span>
                        <span>{CURRICULUM_TOPICS[code].title}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          )}

          {/* =================================================================
              VISTA 2: /pretest (EVALUACIÓN DIAGNÓSTICA SIN PISTAS)
             ================================================================= */}
          {activeView === "/pretest" && (
            <div className="content-grid">
              <section className="practice-panel">
                {!activeParticipant.consentimiento_aceptado ? (
                  <div className="empty-state">
                    <h2>Consentimiento Informado Requerido</h2>
                    <p>
                      Antes de iniciar la evaluación diagnóstica debes aceptar el
                      protocolo de consentimiento informado en la vista de ingreso.
                    </p>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => navigateTo("/login")}
                    >
                      Ir a Consentimiento Informado
                    </button>
                  </div>
                ) : activeParticipant.pretest_completado ? (
                  <div className="empty-state">
                    <span className="tag blue">Línea Base Bloqueada</span>
                    <h2>Pretest Diagnóstico Completado</h2>
                    <p>
                      El protocolo experimental bloquea el reingreso al Pretest para no
                      contaminar la línea base diagnóstica. Tu calificación registrada es{" "}
                      <strong>{currentStudentSummary?.pretest_score_pct ?? 0}%</strong>.
                    </p>
                    <div className="actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => navigateTo("/practica")}
                      >
                        Ir al Entorno de Práctica (/practica) →
                      </button>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const q = pretestQuestions[examIndex] ?? pretestQuestions[0];
                    const progress = Math.round(
                      ((examIndex + 1) / pretestQuestions.length) * 100,
                    );
                    return (
                      <>
                        <div className="panel-heading">
                          <div>
                            <p className="eyebrow accent">
                              Evaluación Diagnóstica Inicial · Sin Retroalimentación ni
                              Pistas
                            </p>
                            <h2>
                              Ítem {examIndex + 1} de {pretestQuestions.length} (
                              {q.codigo_item})
                            </h2>
                          </div>
                          <span className="progress-value">{progress}%</span>
                        </div>
                        <div
                          className="progress-track"
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>

                        <div className="tag-row">
                          <span className="tag blue">
                            {q.tema} · {CURRICULUM_TOPICS[q.tema].shortName}
                          </span>
                          <span className="tag gold">Bloom: {q.nivel_bloom}</span>
                          <span className="tag neutral">
                            Dificultad {q.dificultad}/5
                          </span>
                          <span className="tag neutral">
                            ⏱ Medición invisible performance.now() activa
                          </span>
                        </div>

                        <h3 className="question">{q.enunciado}</h3>
                        {q.codigo_js && (
                          <pre className="code-block">
                            <code>{q.codigo_js}</code>
                          </pre>
                        )}

                        <div className="options" role="group" aria-label="Opciones">
                          {(["A", "B", "C", "D"] as OptionKey[]).map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              className={`option ${
                                examSelected === letter ? "selected-neutral" : ""
                              }`}
                              onClick={() => setExamSelected(letter)}
                            >
                              <span className="option-letter">{letter}</span>
                              <span>{q.opciones[letter]}</span>
                            </button>
                          ))}
                        </div>

                        <div className="actions">
                          <button
                            type="button"
                            className="primary-button"
                            disabled={!examSelected}
                            onClick={() => handleSubmitExamQuestion("pretest")}
                          >
                            {examIndex + 1 < pretestQuestions.length
                              ? "Registrar Respuesta y Siguiente Ítem →"
                              : "Finalizar Pretest e Inicializar Perfil de Dominio →"}
                          </button>
                        </div>
                      </>
                    );
                  })()
                )}
              </section>

              <aside className="sidebar">
                <section className="side-panel">
                  <p className="eyebrow">Regla Metodológica</p>
                  <h2>Control de Línea Base</h2>
                  <p className="side-copy">
                    Durante el Pretest no se muestran indicadores de acierto/error,
                    justificaciones ni pistas guiadas. Cada respuesta calibra tu vector
                    inicial de dominio <var>D</var> en los 8 temas curriculares.
                  </p>
                </section>
              </aside>
            </div>
          )}

          {/* =================================================================
              VISTA 3: /practica (ENTORNO DE ENTRENAMIENTO ITS + TUTOR RAG)
             ================================================================= */}
          {activeView === "/practica" && (
            <>
              <section className="stats-row" aria-label="Resumen de sesión de práctica">
                <div className="stat-card">
                  <span className="stat-label">Interacciones de Práctica</span>
                  <strong>
                    {String(studentPracticeLogs.length).padStart(2, "0")}
                  </strong>
                  <small>registradas en bitácora inmutable</small>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Precisión en Práctica</span>
                  <strong>
                    {currentStudentSummary?.practica_precision_pct !== null &&
                    currentStudentSummary?.practica_precision_pct !== undefined
                      ? `${currentStudentSummary.practica_precision_pct}%`
                      : "--"}
                  </strong>
                  <small>
                    Dominio medio:{" "}
                    {Math.round((currentStudentSummary?.dominio_promedio ?? 0.3) * 100)}%
                  </small>
                </div>
                <div className="stat-card highlight">
                  <span className="stat-label">Prioridad Adaptativa</span>
                  <strong>{weakestTopic}</strong>
                  <small>{CURRICULUM_TOPICS[weakestTopic].shortName}</small>
                </div>
              </section>

              <div className="content-grid">
                <article className="practice-panel">
                  {(() => {
                    const q = currentPracticeSelection.question;
                    const isCorrect =
                      practiceSelected !== null &&
                      practiceSelected === q.respuesta_correcta;

                    return (
                      <>
                        <div className="panel-heading">
                          <div>
                            <p className="eyebrow accent">
                              {currentPracticeSelection.activityType === "remediacion"
                                ? "⚡ Bucle de Remediación Guiada Activo"
                                : "Entrenamiento de Desarrollo Web I"}
                            </p>
                            <h2>
                              Ítem {q.codigo_item} · {CURRICULUM_TOPICS[q.tema].title}
                            </h2>
                          </div>
                          <span className="tag neutral">
                            {activeParticipant.condicion_grupo ===
                            "experimental_adaptativo"
                              ? "Grupo A (Adaptativo + RAG)"
                              : "Grupo B (Control Fijo)"}
                          </span>
                        </div>

                        <div className="selection-reason-banner">
                          <strong>Motivo de selección algorítmica:</strong>{" "}
                          {currentPracticeSelection.reason}
                        </div>

                        <div className="tag-row">
                          <span className="tag blue">{q.tema}</span>
                          <span className="tag gold">Bloom: {q.nivel_bloom}</span>
                          <span className="tag neutral">
                            Dificultad {q.dificultad}/5
                          </span>
                          <span className="tag neutral">
                            Dominio actual del tema:{" "}
                            {Math.round((studentMasteryMap[q.tema] ?? 0.3) * 100)}% (
                            {(studentMasteryMap[q.tema] ?? 0.3).toFixed(3)})
                          </span>
                        </div>

                        {/* Si está en bucle de remediación guiada (Grupo A), mostrar la pista guiada preventiva */}
                        {activeParticipant.condicion_grupo ===
                          "experimental_adaptativo" &&
                          currentPracticeSelection.activityType === "remediacion" && (
                            <div className="guided-hint-box">
                              <strong>
                                💡 Pista Guiada de Remediación ({q.tema}):
                              </strong>{" "}
                              {q.pista_guiada}
                            </div>
                          )}

                        <h3 className="question">{q.enunciado}</h3>
                        {q.codigo_js && (
                          <pre className="code-block">
                            <code>{q.codigo_js}</code>
                          </pre>
                        )}

                        <div
                          className="options"
                          role="group"
                          aria-label="Opciones de respuesta"
                        >
                          {(["A", "B", "C", "D"] as OptionKey[]).map((letter) => {
                            const isChosen = practiceSelected === letter;
                            const isRightOption = letter === q.respuesta_correcta;
                            const stateClass =
                              practiceSelected === null
                                ? ""
                                : isRightOption
                                  ? "correct"
                                  : isChosen
                                    ? "incorrect"
                                    : "muted";
                            return (
                              <button
                                key={letter}
                                type="button"
                                className={`option ${stateClass}`}
                                disabled={practiceSelected !== null || isGeneratingRag}
                                onClick={() => handleAnswerPractice(letter)}
                              >
                                <span className="option-letter">{letter}</span>
                                <span>{q.opciones[letter]}</span>
                                {practiceSelected !== null && isRightOption && (
                                  <span
                                    className="option-result"
                                    aria-label="Respuesta correcta"
                                  >
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* RETROALIMENTACIÓN ESTÁNDAR + ACTUALIZACIÓN MATEMÁTICA D_t */}
                        {practiceSelected !== null && (
                          <div
                            className={`feedback visible ${
                              isCorrect ? "feedback-ok" : "feedback-warn"
                            }`}
                            role="status"
                            aria-live="polite"
                          >
                            <div className="feedback-icon" aria-hidden="true">
                              {isCorrect ? "✓" : "!"}
                            </div>
                            <div style={{ width: "100%" }}>
                              <strong>
                                {isCorrect
                                  ? "¡Respuesta Correcta! Dominio incrementado."
                                  : activeParticipant.condicion_grupo ===
                                      "experimental_adaptativo"
                                    ? "Respuesta Incorrecta · Activando Tutor RAG y Remediación Guiada"
                                    : "Respuesta Incorrecta · Validación Estándar (Grupo Control)"}
                              </strong>
                              <p className="evidence">
                                <strong>Justificación pedagógica:</strong>{" "}
                                {q.justificacion_pedagogica}
                              </p>
                              {lastMasteryTransition && (
                                <div className="math-trace-pill">
                                  <span>
                                    Fórmula Asimétrica (α=0.20, W={lastMasteryTransition.weight.toFixed(2)}):
                                  </span>{" "}
                                  <code>
                                    D_prev = {lastMasteryTransition.prev.toFixed(3)} → D_post ={" "}
                                    {lastMasteryTransition.next.toFixed(3)}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* PANEL DE TUTOR RAG EXCLUSIVO PARA GRUPO EXPERIMENTAL A CUANDO FALLA */}
                        {activeParticipant.condicion_grupo ===
                          "experimental_adaptativo" &&
                          practiceSelected !== null &&
                          !isCorrect && (
                            <div className="rag-tutor-panel">
                              <div className="rag-header">
                                <div>
                                  <p className="eyebrow">
                                    Generación Aumentada por Recuperación · Fidelidad
                                    Estricta al Corpus MDN
                                  </p>
                                  <h4>
                                    🤖 Tutor RAG Inteligente (Top-5 Fragmentos Recuperados)
                                  </h4>
                                </div>
                                {activeRagFeedback && (
                                  <span className="rag-telemetry-badge">
                                    {activeRagFeedback.modelo_llm} ·{" "}
                                    {activeRagFeedback.latencia_ms} ms ·{" "}
                                    {activeRagFeedback.tokens_prompt +
                                      activeRagFeedback.tokens_completion}{" "}
                                    tokens
                                  </span>
                                )}
                              </div>

                              {isGeneratingRag ? (
                                <p className="rag-loading">
                                  Consultando corpus_rag (k=5) y generando explicación
                                  adaptativa...
                                </p>
                              ) : (
                                activeRagFeedback && (
                                  <>
                                    <div className="rag-explanation-text">
                                      {activeRagFeedback.explicacion_generada
                                        .split("\n\n")
                                        .map((para, i) => (
                                          <p key={i}>{para}</p>
                                        ))}
                                    </div>
                                    <div className="guided-hint-box">
                                      <strong>💡 Pista Guiada para tu siguiente intento:</strong>{" "}
                                      {q.pista_guiada}
                                    </div>
                                    <div className="rag-chunks-details">
                                      <p className="eyebrow">
                                        Evidencia Vectorial Recuperada (Top-5 Chunks de{" "}
                                        <code>corpus_rag</code>):
                                      </p>
                                      <div className="rag-chunk-list">
                                        {activeRagFeedback.fragmentos_recuperados.map(
                                          (frag) => (
                                            <div
                                              key={frag.chunk_id}
                                              className="rag-chunk-chip"
                                            >
                                              <strong>
                                                Chunk #{frag.chunk_id} ({frag.tema})
                                              </strong>
                                              <span>
                                                Similitud:{" "}
                                                {Math.round(frag.similitud * 100)}%
                                              </span>
                                              <small>{frag.titulo_fuente}</small>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )
                              )}
                            </div>
                          )}

                        <div className="actions">
                          <button
                            type="button"
                            className="primary-button"
                            disabled={practiceSelected === null || isGeneratingRag}
                            onClick={handleNextPracticeQuestion}
                          >
                            Siguiente Actividad{" "}
                            {activeParticipant.condicion_grupo ===
                              "experimental_adaptativo" &&
                            practiceSelected !== null &&
                            !isCorrect &&
                            currentPracticeSelection.activityType !== "remediacion"
                              ? "(Iniciar Refuerzo Guiado)"
                              : ""}{" "}
                            →
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigateTo("/postest")}
                          >
                            Ir al Postest Sumativo →
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </article>

                {/* MAPA DE DOMINIO DE LOS 8 TEMAS OBLIGATORIOS */}
                <aside className="sidebar" aria-label="Perfil dinámico de dominio">
                  <section className="side-panel profile-panel">
                    <div className="panel-title">
                      <div>
                        <p className="eyebrow">Tabla perfil_dominio (Umbral 0.700)</p>
                        <h2>Mapa de los 8 Temas</h2>
                      </div>
                      <span className="sparkle" aria-hidden="true">
                        ✦
                      </span>
                    </div>
                    {ORDERED_TOPICS.map((topic) => {
                      const val = studentMasteryMap[topic] ?? INITIAL_MASTERY;
                      const pct = Math.round(val * 100);
                      const isMastered = val >= MASTERY_THRESHOLD;
                      const isWeakest = topic === weakestTopic;
                      return (
                        <div className="mastery-item" key={topic}>
                          <div className="mastery-label">
                            <span>
                              <strong>{topic}</strong> ·{" "}
                              {CURRICULUM_TOPICS[topic].shortName}
                            </span>
                            <strong>
                              {pct}% ({val.toFixed(3)})
                            </strong>
                          </div>
                          <div className="mastery-track">
                            <span
                              className={
                                isMastered ? "strong" : isWeakest ? "weak" : "medium"
                              }
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <small>
                            {isMastered
                              ? "✓ Dominio consolidado (≥ 0.700)"
                              : isWeakest
                                ? "⚡ Prioridad actual del motor adaptativo"
                                : "En desarrollo (< 0.700)"}
                          </small>
                        </div>
                      );
                    })}
                  </section>

                  <section className="side-panel adaptive-panel">
                    <p className="eyebrow">Regla Experimental Activa</p>
                    <h2>
                      {activeParticipant.condicion_grupo === "experimental_adaptativo"
                        ? `Foco Adaptativo: ${weakestTopic}`
                        : "Modo Control: Secuencia Fija"}
                    </h2>
                    <p>
                      {activeParticipant.condicion_grupo === "experimental_adaptativo"
                        ? "El motor prioriza temas con D < 0.700, escala niveles de Bloom al acertar y despliega remediación RAG con Top-5 fragmentos MDN al detectar errores."
                        : "Como participante del Grupo de Control (Grupo B), recibes las actividades en orden lineal fijo (DOM-01 → ERR-08) con validación estática sin intervención del LLM."}
                    </p>
                  </section>
                </aside>
              </div>
            </>
          )}

          {/* =================================================================
              VISTA 4: /postest (EVALUACIÓN SUMATIVA ISOMORFA)
             ================================================================= */}
          {activeView === "/postest" && (
            <div className="content-grid">
              <section className="practice-panel">
                {activeParticipant.postest_completado ? (
                  <div className="empty-state">
                    <span className="tag blue">Postest Registrado</span>
                    <h2>Evaluación Postest Finalizada</h2>
                    <p>
                      Has completado los ítems isomorfos del Postest. Tu puntaje final es{" "}
                      <strong>{currentStudentSummary?.postest_score_pct ?? 0}%</strong>{" "}
                      (Ganancia Bruta{" "}
                      <strong>G = {currentStudentSummary?.ganancia_bruta_G ?? 0}%</strong>
                      , Ganancia Normalizada de Hake{" "}
                      <strong>g = {currentStudentSummary?.ganancia_hake_g ?? 0}</strong>).
                    </p>
                    <div className="actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => navigateTo("/usabilidad")}
                      >
                        Completar Encuesta de Usabilidad (/usabilidad) →
                      </button>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const q = postestQuestions[examIndex] ?? postestQuestions[0];
                    const progress = Math.round(
                      ((examIndex + 1) / postestQuestions.length) * 100,
                    );
                    return (
                      <>
                        <div className="panel-heading">
                          <div>
                            <p className="eyebrow accent">
                              Evaluación Sumativa Isomorfa · Medición de Ganancia de
                              Hake (g)
                            </p>
                            <h2>
                              Postest Ítem {examIndex + 1} de {postestQuestions.length} (
                              {q.codigo_item})
                            </h2>
                          </div>
                          <span className="progress-value">{progress}%</span>
                        </div>
                        <div className="progress-track">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        <div className="tag-row">
                          <span className="tag blue">
                            {q.tema} · {CURRICULUM_TOPICS[q.tema].shortName}
                          </span>
                          <span className="tag gold">Bloom: {q.nivel_bloom}</span>
                          <span className="tag neutral">
                            Dificultad {q.dificultad}/5
                          </span>
                        </div>
                        <h3 className="question">{q.enunciado}</h3>
                        {q.codigo_js && (
                          <pre className="code-block">
                            <code>{q.codigo_js}</code>
                          </pre>
                        )}
                        <div className="options">
                          {(["A", "B", "C", "D"] as OptionKey[]).map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              className={`option ${
                                examSelected === letter ? "selected-neutral" : ""
                              }`}
                              onClick={() => setExamSelected(letter)}
                            >
                              <span className="option-letter">{letter}</span>
                              <span>{q.opciones[letter]}</span>
                            </button>
                          ))}
                        </div>
                        <div className="actions">
                          <button
                            type="button"
                            className="primary-button"
                            disabled={!examSelected}
                            onClick={() => handleSubmitExamQuestion("postest")}
                          >
                            {examIndex + 1 < postestQuestions.length
                              ? "Guardar y Continuar →"
                              : "Finalizar Postest y Pasar a Usabilidad →"}
                          </button>
                        </div>
                      </>
                    );
                  })()
                )}
              </section>

              <aside className="sidebar">
                <section className="side-panel">
                  <p className="eyebrow">Equivalencia Psicométrica</p>
                  <h2>Ítems Isomorfos</h2>
                  <p className="side-copy">
                    Cada pregunta del Postest (<code>POST-01</code> a{" "}
                    <code>POST-08</code>) evalúa exactamente el mismo tema, nivel de la
                    Taxonomía de Bloom y dificultad que su par diagnóstico del Pretest (
                    <code>PRE-01</code> a <code>PRE-08</code>).
                  </p>
                </section>
              </aside>
            </div>
          )}

          {/* =================================================================
              VISTA 5: /usabilidad (ENCUESTA LIKERT DE 8 ÍTEMS 1-5)
             ================================================================= */}
          {activeView === "/usabilidad" && (
            <div className="content-grid">
              <section className="practice-panel">
                <p className="eyebrow accent">
                  Cierre del Piloto · Tabla encuesta_usabilidad
                </p>
                <h2>Cuestionario de Usabilidad y Percepción Pedagógica (Escala Likert 1–5)</h2>
                <p className="intro-copy">
                  Valora cada afirmación desde <strong>1 (Totalmente en desacuerdo)</strong>{" "}
                  hasta <strong>5 (Totalmente de acuerdo)</strong>.
                </p>

                <div className="likert-list">
                  {USABILITY_LIKERT_ITEMS.map((item, idx) => (
                    <div key={item.id} className="likert-item">
                      <div className="likert-question-header">
                        <span className="tag blue">{item.dimension}</span>
                        <strong>
                          {idx + 1}. {item.statement}
                        </strong>
                      </div>
                      <div className="likert-scale-row">
                        {[1, 2, 3, 4, 5].map((scoreVal) => (
                          <button
                            key={scoreVal}
                            type="button"
                            className={`likert-btn ${
                              likertAnswers[item.id] === scoreVal ? "active" : ""
                            }`}
                            onClick={() =>
                              setLikertAnswers((prev) => ({
                                ...prev,
                                [item.id]: scoreVal,
                              }))
                            }
                          >
                            {scoreVal}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="comment-box">
                  <label htmlFor="open-comment-area" className="field-label">
                    Comentarios abiertos sobre tu experiencia con EduSim IA:
                  </label>
                  <textarea
                    id="open-comment-area"
                    rows={3}
                    className="text-input"
                    value={openComment}
                    onChange={(e) => setOpenComment(e.target.value)}
                    placeholder="Escribe tus observaciones sobre las preguntas, pistas guiadas o explicaciones RAG..."
                  />
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSaveUsabilitySurvey}
                  >
                    Guardar Encuesta de Usabilidad
                  </button>
                  {activeParticipant.encuesta_completada && (
                    <span className="status-badge accepted">
                      ✓ Encuesta guardada para {activeParticipant.estudiante_hash}
                    </span>
                  )}
                </div>
              </section>

              <aside className="sidebar">
                <section className="side-panel">
                  <p className="eyebrow">Resumen Empírico Individual</p>
                  <h2>Resultados de {activeParticipant.estudiante_hash}</h2>
                  <div className="step-checklist">
                    <div className="step-item">
                      <span>Pretest Diagnóstico</span>
                      <strong>
                        {currentStudentSummary?.pretest_score_pct !== null
                          ? `${currentStudentSummary?.pretest_score_pct}%`
                          : "Sin realizar"}
                      </strong>
                    </div>
                    <div className="step-item">
                      <span>Postest Sumativo</span>
                      <strong>
                        {currentStudentSummary?.postest_score_pct !== null
                          ? `${currentStudentSummary?.postest_score_pct}%`
                          : "Sin realizar"}
                      </strong>
                    </div>
                    <div className="step-item">
                      <span>Ganancia Bruta (G)</span>
                      <strong>
                        {currentStudentSummary?.ganancia_bruta_G !== null
                          ? `${currentStudentSummary?.ganancia_bruta_G}%`
                          : "--"}
                      </strong>
                    </div>
                    <div className="step-item">
                      <span>Ganancia Normalizada de Hake (g)</span>
                      <strong>
                        {currentStudentSummary?.ganancia_hake_g !== null
                          ? currentStudentSummary?.ganancia_hake_g
                          : "--"}
                      </strong>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}

          {/* =================================================================
              VISTA 6: /investigador (PANEL DOCENTE Y EXPORTACIÓN CIENTÍFICA)
             ================================================================= */}
          {activeView === "/investigador" && (
            <section className="practice-panel">
              {!adminUnlocked ? (
                <div className="admin-login-box">
                  <p className="eyebrow accent">
                    Acceso Restringido · Variable ADMIN_SECRET
                  </p>
                  <h2>Panel del Investigador y Validación Docente</h2>
                  <p className="intro-copy">
                    Ingresa la clave de administrador (<code>ADMIN_SECRET</code>) para
                    acceder a la rúbrica de validación de ítems, simulación empírica y
                    exportación a CSV / JSON para R, Python o SPSS.
                  </p>
                  <div className="login-input-row">
                    <input
                      type="password"
                      className="text-input"
                      placeholder="Clave ADMIN_SECRET"
                      value={adminKeyInput}
                      onChange={(e) => setAdminKeyInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        if (adminKeyInput.trim() === DEFAULT_ADMIN_SECRET) {
                          setAdminUnlocked(true);
                          setAdminError("");
                        } else {
                          setAdminError("Clave incorrecta. Usa EDUSIM-ADMIN-2026.");
                        }
                      }}
                    >
                      Desbloquear Panel
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setAdminKeyInput(DEFAULT_ADMIN_SECRET);
                        setAdminUnlocked(true);
                        setAdminError("");
                      }}
                    >
                      Acceso Rápido Demo ({DEFAULT_ADMIN_SECRET})
                    </button>
                  </div>
                  {adminError && <p className="error-msg">{adminError}</p>}
                </div>
              ) : (
                <div className="researcher-dashboard">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow accent">
                        Instrumentación Científica · Análisis Cuasiexperimental y
                        Auditoría RAG
                      </p>
                      <h2>Panel de Control del Investigador (/investigador)</h2>
                    </div>
                    <div className="actions" style={{ marginTop: 0 }}>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={handleSimulateFullPilot}
                      >
                        ⚡ Simular Datos de Piloto Completo (10 Estudiantes)
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handleResetDatabaseToSeed}
                      >
                        Reiniciar a Seed Limpio
                      </button>
                    </div>
                  </div>

                  {/* BOTONES DE EXPORTACIÓN DIRECTA A CSV Y JSON */}
                  <div className="export-toolbar">
                    <div className="export-group">
                      <strong>Matriz Consolidada (Pretest, Postest, G, Hake g):</strong>
                      <button
                        type="button"
                        className="chip-button"
                        onClick={() =>
                          downloadCsvFile(
                            "edusim_resultados_consolidados_hake.csv",
                            flattenSummariesForCsv(allScientificSummaries),
                          )
                        }
                      >
                        ⬇ Exportar CSV
                      </button>
                      <button
                        type="button"
                        className="chip-button"
                        onClick={() =>
                          downloadJsonFile(
                            "edusim_resultados_consolidados_hake.json",
                            allScientificSummaries,
                          )
                        }
                      >
                        ⬇ Exportar JSON
                      </button>
                    </div>

                    <div className="export-group">
                      <strong>Bitácora de Trazabilidad ({db.logs.length}):</strong>
                      <button
                        type="button"
                        className="chip-button"
                        onClick={() =>
                          downloadCsvFile(
                            "edusim_bitacora_trazabilidad.csv",
                            db.logs as unknown as Record<string, unknown>[],
                          )
                        }
                      >
                        ⬇ CSV
                      </button>
                      <button
                        type="button"
                        className="chip-button"
                        onClick={() =>
                          downloadJsonFile("edusim_bitacora_trazabilidad.json", db.logs)
                        }
                      >
                        ⬇ JSON
                      </button>
                    </div>

                    <div className="export-group">
                      <strong>Telemetría RAG ({db.ragLogs.length}):</strong>
                      <button
                        type="button"
                        className="chip-button"
                        onClick={() =>
                          downloadCsvFile(
                            "edusim_telemetria_rag.csv",
                            db.ragLogs as unknown as Record<string, unknown>[],
                          )
                        }
                      >
                        ⬇ CSV
                      </button>
                      <button
                        type="button"
                        className="chip-button"
                        onClick={() =>
                          downloadJsonFile("edusim_telemetria_rag.json", db.ragLogs)
                        }
                      >
                        ⬇ JSON
                      </button>
                    </div>
                  </div>

                  {/* COMPARACIÓN ESTADÍSTICA GRUPO EXPERIMENTAL VS GRUPO CONTROL */}
                  <div className="comparison-grid">
                    <div className="comparison-card exp">
                      <p className="eyebrow">
                        Grupo A · experimental_adaptativo (n ={" "}
                        {groupComparison.experimental.count})
                      </p>
                      <h3>Motor Asimétrico + Tutor RAG (MDN)</h3>
                      <div className="metric-pairs">
                        <div>
                          <span>Pretest Promedio</span>
                          <strong>
                            {groupComparison.experimental.avgPretest !== null
                              ? `${groupComparison.experimental.avgPretest}%`
                              : "--"}
                          </strong>
                        </div>
                        <div>
                          <span>Postest Promedio</span>
                          <strong>
                            {groupComparison.experimental.avgPostest !== null
                              ? `${groupComparison.experimental.avgPostest}%`
                              : "--"}
                          </strong>
                        </div>
                        <div>
                          <span>Ganancia Bruta (G)</span>
                          <strong>
                            {groupComparison.experimental.avgGainG !== null
                              ? `+${groupComparison.experimental.avgGainG}%`
                              : "--"}
                          </strong>
                        </div>
                        <div>
                          <span>Ganancia de Hake (g)</span>
                          <strong>
                            {groupComparison.experimental.avgHakeG ?? "--"}
                          </strong>
                        </div>
                        <div>
                          <span>Remediaciones RAG</span>
                          <strong>
                            {groupComparison.experimental.totalRagRemediations}
                          </strong>
                        </div>
                        <div>
                          <span>Usabilidad Likert (1-5)</span>
                          <strong>
                            {groupComparison.experimental.avgUsability ?? "--"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="comparison-card ctrl">
                      <p className="eyebrow">
                        Grupo B · control_fijo (n = {groupComparison.control.count})
                      </p>
                      <h3>Secuencia Lineal Fija (Sin LLM/RAG)</h3>
                      <div className="metric-pairs">
                        <div>
                          <span>Pretest Promedio</span>
                          <strong>
                            {groupComparison.control.avgPretest !== null
                              ? `${groupComparison.control.avgPretest}%`
                              : "--"}
                          </strong>
                        </div>
                        <div>
                          <span>Postest Promedio</span>
                          <strong>
                            {groupComparison.control.avgPostest !== null
                              ? `${groupComparison.control.avgPostest}%`
                              : "--"}
                          </strong>
                        </div>
                        <div>
                          <span>Ganancia Bruta (G)</span>
                          <strong>
                            {groupComparison.control.avgGainG !== null
                              ? `+${groupComparison.control.avgGainG}%`
                              : "--"}
                          </strong>
                        </div>
                        <div>
                          <span>Ganancia de Hake (g)</span>
                          <strong>{groupComparison.control.avgHakeG ?? "--"}</strong>
                        </div>
                        <div>
                          <span>Remediaciones RAG</span>
                          <strong>{groupComparison.control.totalRagRemediations}</strong>
                        </div>
                        <div>
                          <span>Usabilidad Likert (1-5)</span>
                          <strong>
                            {groupComparison.control.avgUsability ?? "--"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUB-NAVEGACIÓN DE TABLAS DEL INVESTIGADOR */}
                  <div className="sub-tabs">
                    <button
                      type="button"
                      className={`nav-tab ${adminTab === "resumen" ? "active" : ""}`}
                      onClick={() => setAdminTab("resumen")}
                    >
                      Matriz por Participante (Hake g)
                    </button>
                    <button
                      type="button"
                      className={`nav-tab ${adminTab === "banco" ? "active" : ""}`}
                      onClick={() => setAdminTab("banco")}
                    >
                      Validación Docente de Preguntas ({db.questions.length})
                    </button>
                    <button
                      type="button"
                      className={`nav-tab ${adminTab === "bitacora" ? "active" : ""}`}
                      onClick={() => setAdminTab("bitacora")}
                    >
                      Bitácora de Trazabilidad ({db.logs.length})
                    </button>
                    <button
                      type="button"
                      className={`nav-tab ${adminTab === "rag" ? "active" : ""}`}
                      onClick={() => setAdminTab("rag")}
                    >
                      Telemetría RAG y Corpus ({db.ragLogs.length})
                    </button>
                  </div>

                  {adminTab === "resumen" && (
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Hash</th>
                            <th>Condición Experimental</th>
                            <th>Pretest %</th>
                            <th>Postest %</th>
                            <th>Ganancia Bruta (G)</th>
                            <th>Hake (g)</th>
                            <th>Práctica (Intentos)</th>
                            <th>Dominio Medio</th>
                            <th>Tiempo Medio (s)</th>
                            <th>Likert (1-5)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allScientificSummaries.map((row) => (
                            <tr key={row.estudiante_hash}>
                              <td>
                                <strong>{row.estudiante_hash}</strong>
                              </td>
                              <td>
                                <span
                                  className={`tag ${
                                    row.condicion_grupo === "experimental_adaptativo"
                                      ? "blue"
                                      : "neutral"
                                  }`}
                                >
                                  {row.condicion_grupo}
                                </span>
                              </td>
                              <td>
                                {row.pretest_score_pct !== null
                                  ? `${row.pretest_score_pct}%`
                                  : "--"}
                              </td>
                              <td>
                                {row.postest_score_pct !== null
                                  ? `${row.postest_score_pct}%`
                                  : "--"}
                              </td>
                              <td>
                                {row.ganancia_bruta_G !== null
                                  ? `${row.ganancia_bruta_G > 0 ? "+" : ""}${row.ganancia_bruta_G}%`
                                  : "--"}
                              </td>
                              <td>
                                <strong>
                                  {row.ganancia_hake_g !== null
                                    ? row.ganancia_hake_g.toFixed(3)
                                    : "--"}
                                </strong>
                              </td>
                              <td>
                                {row.practica_intentos} (RAG: {row.remediaciones_rag})
                              </td>
                              <td>{row.dominio_promedio.toFixed(3)}</td>
                              <td>
                                {row.tiempo_promedio_seg !== null
                                  ? `${row.tiempo_promedio_seg}s`
                                  : "--"}
                              </td>
                              <td>{row.usabilidad_promedio ?? "--"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {adminTab === "banco" && (
                    <div>
                      <div className="rubric-banner">
                        <strong>
                          Rúbrica Docente de 5 Criterios (validado_por_docente):
                        </strong>{" "}
                        1) Alineación curricular (DOM-01 a ERR-08) · 2) Nivel cognitivo
                        de Bloom · 3) Exactitud sintáctica ES6+ · 4) Distractores
                        diagnósticos sin ambigüedad · 5) Pertinencia de justificación y
                        pista guiada.
                        <select
                          className="topic-filter-select"
                          value={filterTopic}
                          onChange={(e) => setFilterTopic(e.target.value)}
                          aria-label="Filtrar por tema"
                        >
                          <option value="ALL">Todos los temas (40 ítems)</option>
                          {ORDERED_TOPICS.map((t) => (
                            <option key={t} value={t}>
                              {t} · {CURRICULUM_TOPICS[t].shortName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Código</th>
                              <th>Uso</th>
                              <th>Tema</th>
                              <th>Bloom</th>
                              <th>Dif.</th>
                              <th>Enunciado y Respuesta</th>
                              <th>Validación Docente</th>
                            </tr>
                          </thead>
                          <tbody>
                            {db.questions
                              .filter(
                                (q) => filterTopic === "ALL" || q.tema === filterTopic,
                              )
                              .map((q) => (
                                <tr key={q.id}>
                                  <td>
                                    <strong>{q.codigo_item}</strong>
                                  </td>
                                  <td>{q.tipo_uso}</td>
                                  <td>
                                    <span className="tag blue">{q.tema}</span>
                                  </td>
                                  <td>{q.nivel_bloom}</td>
                                  <td>{q.dificultad}/5</td>
                                  <td>
                                    <div>{q.enunciado}</div>
                                    <small className="table-subtext">
                                      Correcta ({q.respuesta_correcta}):{" "}
                                      {q.opciones[q.respuesta_correcta]}
                                    </small>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`chip-button ${
                                        q.validado_por_docente ? "valid" : "invalid"
                                      }`}
                                      onClick={() => handleToggleQuestionValidation(q.id)}
                                    >
                                      {q.validado_por_docente
                                        ? "✓ Validado"
                                        : "Pendiente"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {adminTab === "bitacora" && (
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Estudiante</th>
                            <th>Grupo</th>
                            <th>Ítem</th>
                            <th>Actividad</th>
                            <th>Tema</th>
                            <th>Resultado</th>
                            <th>Tiempo (s)</th>
                            <th>D_prev → D_post</th>
                            <th>Motivo de Selección</th>
                          </tr>
                        </thead>
                        <tbody>
                          {db.logs.length === 0 ? (
                            <tr>
                              <td colSpan={10}>
                                No hay interacciones registradas aún. Responde preguntas
                                o pulsa &ldquo;Simular Datos de Piloto Completo&rdquo;.
                              </td>
                            </tr>
                          ) : (
                            db.logs
                              .slice()
                              .reverse()
                              .slice(0, 60)
                              .map((log) => (
                                <tr key={log.id}>
                                  <td>{log.id}</td>
                                  <td>
                                    <strong>{log.estudiante_hash}</strong>
                                  </td>
                                  <td>{log.condicion_grupo}</td>
                                  <td>{log.codigo_item}</td>
                                  <td>{log.tipo_actividad}</td>
                                  <td>{log.tema}</td>
                                  <td>
                                    {log.resultado ? "✓ Acierto" : "✗ Fallo"}
                                  </td>
                                  <td>{log.tiempo_segundos}s</td>
                                  <td>
                                    {log.dominio_previo.toFixed(3)} →{" "}
                                    <strong>{log.dominio_posterior.toFixed(3)}</strong>
                                  </td>
                                  <td>{log.motivo_seleccion}</td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {adminTab === "rag" && (
                    <div>
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Estudiante</th>
                              <th>Ítem</th>
                              <th>Modelo LLM</th>
                              <th>Tokens (P/C)</th>
                              <th>Latencia</th>
                              <th>Top-5 Fragmentos Recuperados (corpus_rag)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {db.ragLogs.length === 0 ? (
                              <tr>
                                <td colSpan={7}>
                                  Sin registros en telemetria_rag. Fallar un ítem con un
                                  usuario del Grupo Experimental (EST-001 a EST-005) o
                                  simular el piloto poblará esta tabla.
                                </td>
                              </tr>
                            ) : (
                              db.ragLogs.map((r) => (
                                <tr key={r.id}>
                                  <td>{r.id}</td>
                                  <td>
                                    <strong>{r.estudiante_hash}</strong>
                                  </td>
                                  <td>{r.codigo_item}</td>
                                  <td>{r.modelo_llm}</td>
                                  <td>
                                    {r.tokens_prompt} / {r.tokens_completion}
                                  </td>
                                  <td>{r.latencia_ms} ms</td>
                                  <td>
                                    {r.fragmentos_recuperados
                                      .map(
                                        (f) =>
                                          `#${f.chunk_id} (${f.tema}: ${Math.round(
                                            f.similitud * 100,
                                          )}%)`,
                                      )
                                      .join(", ")}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <h3 style={{ marginTop: "24px" }}>
                        Base de Conocimiento Vectorial (<code>corpus_rag</code> —{" "}
                        {CORPUS_RAG_ITEMS.length} Fragmentos MDN)
                      </h3>
                      <div className="rag-chunk-list">
                        {CORPUS_RAG_ITEMS.map((c) => (
                          <div key={c.id} className="rag-chunk-chip">
                            <strong>
                              Chunk #{c.id} · {c.tema}
                            </strong>
                            <span>{c.titulo_fuente}</span>
                            <small>{c.contenido}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="footer">
          <span>
            EduSim IA · Sistema Tutor Inteligente con Recomendación Adaptativa y RAG para
            Desarrollo Web I
          </span>
          <span>
            Cumplimiento LOPDP Ecuador · Seudonimización EST-XXX · Trazabilidad Científica
            Inmutable
          </span>
        </footer>
      </div>
    </main>
  );
}
