// =====================================================
//  app.js  —  Lógica de la interfaz del generador y validación
// =====================================================

const TOPICS = [
  { id: "aritmetica",        label: "Aritmética",                    icon: "+" },
  { id: "algebra",           label: "Álgebra",                       icon: "x" },
  { id: "ecuaciones",        label: "Ecuaciones",                    icon: "=" },
  { id: "polinomios",        label: "Polinomios",                    icon: "xⁿ" },
  { id: "funciones",         label: "Funciones",                     icon: "f(x)" },
  { id: "exponenciales",     label: "Exponenciales",                 icon: "eˣ" },
  { id: "trigonometria",     label: "Trigonometría",                 icon: "sin" },
  { id: "logaritmos",        label: "Logaritmos",                    icon: "log" },
  { id: "limites",           label: "Límites",                       icon: "lim" },
  { id: "derivadas",         label: "Derivadas",                     icon: "d/dx" },
  { id: "integrales",        label: "Integrales",                    icon: "∫" },
  { id: "series",            label: "Series y Sucesiones",           icon: "Σ" },
  { id: "edo",               label: "Ec. Diferenciales",             icon: "y'" },
  { id: "laplace",           label: "Transformada de Laplace",       icon: "ℒ" },
  { id: "fourier_series",    label: "Transformada de Fourier",       icon: "F(ω)" },
  { id: "estadistica",       label: "Media, Mediana y Moda",         icon: "x̄" },
  { id: "medias_especiales", label: "Media Geométrica y Ponderada",  icon: "G" },
  { id: "dispersion",        label: "Varianza y Desv. Estándar",     icon: "σ" },
];

const TOPIC_ALIAS = {
  series_y_sucesiones: "series",
};

let selectedTopic = null;
let selectedDiff  = "basico";
let currentExerciseData = null;
let currentTutorialExerciseData = null;

// ── Init ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  buildTopicGrid();
  buildDiffButtons();
  initTutorialGeneratorWidget();
});

function buildTopicGrid() {
  const grid = document.getElementById("topicsGrid");
  if (!grid) return;
  TOPICS.forEach(t => {
    const btn = document.createElement("button");
    btn.className = "topic-btn";
    btn.innerHTML = `<span class="topic-icon">${t.icon}</span>${t.label}`;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".topic-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTopic = t;
    });
    grid.appendChild(btn);
  });
}

function buildDiffButtons() {
  document.querySelectorAll(".diff-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedDiff = btn.dataset.diff;
    });
  });
}

// ── Generar en página principal generador.html ────────

function generateExercise() {
  if (!selectedTopic) {
    showError("Selecciona un tema primero.");
    return;
  }

  const gen = GENERATORS[selectedTopic.id];
  if (!gen) {
    showError("Tema no disponible aún.");
    return;
  }

  const fn = gen[selectedDiff] || gen["basico"];
  currentExerciseData = fn();
  renderExercise(currentExerciseData);
}

// ── Renderizado unificado de tarjeta de ejercicio ─────

function buildExerciseCardHtml(data, topicLabel, diffLabel, onNewCall, contextKey) {
  const stepsHtml = (data.pasos || []).map((p, i) => `
    <div class="step">
      <div class="step-num">${i + 1}</div>
      <div class="step-body">
        <div class="step-title">${escHtml(p.titulo)}</div>
        ${p.explicacion ? `<div class="step-text">${escHtml(p.explicacion)}</div>` : ""}
        ${p.formula ? `<code class="step-formula">${escHtml(p.formula)}</code>` : ""}
      </div>
    </div>
  `).join("");

  return `
    <div class="ex-header">
      <div class="ex-meta">
        <span class="badge badge-topic">${escHtml(topicLabel)}</span>
        <span class="badge badge-diff">${escHtml(diffLabel)}</span>
      </div>
      <button class="new-btn" onclick="${onNewCall}">Nuevo ↺</button>
    </div>

    <p class="ex-question">${escHtml(data.enunciado)}</p>

    <div class="ex-check-box">
      <div class="ex-check-row">
        <input
          type="text"
          id="ansInput_${contextKey}"
          class="ex-answer-input"
          placeholder="Escribe tu respuesta"
          onkeydown="if(event.key==='Enter') checkExerciseAnswer('${contextKey}')"
        />
        <button type="button" class="ex-check-btn" onclick="checkExerciseAnswer('${contextKey}')">
          Comprobar
        </button>
      </div>
      <div id="ansFeedback_${contextKey}" class="ex-check-feedback"></div>
    </div>

    <div class="divider"></div>

    <button class="sol-toggle" id="solToggle" onclick="toggleSolution()">
      <span>Ver solución paso a paso</span>
      <span class="sol-arrow">▾</span>
    </button>

    <div class="solution-box" id="solutionBox">
      ${stepsHtml}
      <div class="answer-box">
        <span class="answer-label">Respuesta</span>
        <span class="answer-value">${escHtml(data.respuesta)}</span>
      </div>
    </div>`;
}

function renderExercise(data) {
  const area = document.getElementById("exerciseArea");
  if (!area) return;
  const diffLabel = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" }[selectedDiff] || selectedDiff;
  area.innerHTML = buildExerciseCardHtml(data, selectedTopic.label, diffLabel, "generateExercise()", "main");
}

function toggleSolution() {
  const box = document.getElementById("solutionBox");
  const btn = document.getElementById("solToggle");
  if (!box || !btn) return;
  const open = box.classList.toggle("open");
  btn.classList.toggle("open", open);
  btn.querySelector("span:first-child").textContent =
    open ? "Ocultar solución" : "Ver solución paso a paso";
}

// Alias para compatibilidad
const toggleSol = toggleSolution;

function checkExerciseAnswer(contextKey) {
  const inputEl = document.getElementById(`ansInput_${contextKey}`);
  const fbEl = document.getElementById(`ansFeedback_${contextKey}`);
  const data = contextKey === "tutorial" ? currentTutorialExerciseData : currentExerciseData;
  if (!inputEl || !fbEl || !data) return;

  const result = (typeof StatsEngine !== "undefined" && StatsEngine.validateAnswer)
    ? StatsEngine.validateAnswer(inputEl.value, data)
    : { valid: inputEl.value.trim() === String(data.respuesta).trim(), message: "" };

  fbEl.className = "ex-check-feedback " + (result.valid ? "ok" : "err");
  fbEl.textContent = (result.valid ? "✓ " : "✗ ") + result.message;
}

// ── Widget generador embebido en cada tutorial ────────

function initTutorialGeneratorWidget() {
  const genContainer = document.getElementById("generador-container");
  if (!genContainer) return;

  const enTutorial = window.location.pathname.includes("/tutoriales/");
  const base = enTutorial ? "../" : "";
  fetch(`${base}utilidades/generador.html`)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar el generador");
      return response.text();
    })
    .then(html => {
      genContainer.innerHTML = html;
      const temaAsignado = genContainer.getAttribute("data-tema");
      const topicSelect = document.getElementById("topicSelect");
      if (topicSelect && temaAsignado) {
        topicSelect.value = temaAsignado;
      }
    })
    .catch(error => console.error("Error cargando el generador:", error));
}

function genFromTutorial() {
  const selectEl = document.getElementById("topicSelect");
  const diffEl   = document.getElementById("diffSelect");
  const area     = document.getElementById("tutorialExArea");
  if (!selectEl || !diffEl || !area) return;

  let topicId = selectEl.value;
  topicId     = TOPIC_ALIAS[topicId] || topicId;
  const diff  = diffEl.value;
  const gen   = GENERATORS[topicId];

  if (!gen) {
    area.innerHTML = `<p style="color:#f87171;margin-top:12px">Tema no disponible aún.</p>`;
    return;
  }

  currentTutorialExerciseData = (gen[diff] || gen["basico"])();
  const topicLabel = selectEl.selectedOptions[0] ? selectEl.selectedOptions[0].text : topicId;
  const diffLabel  = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" }[diff] || diff;

  area.innerHTML = `<div style="margin-top:16px">` +
    buildExerciseCardHtml(currentTutorialExerciseData, topicLabel, diffLabel, "genFromTutorial()", "tutorial") +
    `</div>`;
}

// ── Helpers ───────────────────────────────────────────

function showError(msg) {
  const area = document.getElementById("exerciseArea");
  if (area) {
    area.innerHTML = `<div style="color:#f87171;padding:1rem;font-size:14px;">${escHtml(msg)}</div>`;
  }
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

const esc = escHtml;
