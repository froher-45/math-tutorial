// =====================================================
//  app.js  —  Lógica de la interfaz
// =====================================================

const TOPICS = [
  { id: "aritmetica",    label: "Aritmética",              icon: "+" },
  { id: "algebra",       label: "Álgebra",                 icon: "x" },
  { id: "ecuaciones",    label: "Ecuaciones",              icon: "=" },
  { id: "polinomios",    label: "Polinomios",              icon: "xⁿ" },
  { id: "funciones",     label: "Funciones",               icon: "f(x)" },
  { id: "trigonometria", label: "Trigonometría",           icon: "sin" },
  { id: "logaritmos",    label: "Logaritmos",              icon: "log" },
  { id: "limites",       label: "Límites",                 icon: "lim" },
  { id: "derivadas",     label: "Derivadas",               icon: "d/dx" },
  { id: "integrales",    label: "Integrales",              icon: "∫" },
  { id: "series",        label: "Series y Sucesiones",     icon: "Σ" },
  { id: "edo",           label: "Ec. Diferenciales",       icon: "y'" },
  { id: "laplace",       label: "Transformada de Laplace", icon: "L" },
];

let selectedTopic = null;
let selectedDiff  = "basico";

// ── Init ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  buildTopicGrid();
  buildDiffButtons();
});

function buildTopicGrid() {
  const grid = document.getElementById("topicsGrid");
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

// ── Generar ───────────────────────────────────────────

function generateExercise() {
  if (!selectedTopic) {
    showError("Selecciona un tema primero.");
    return;
  }

  const gen = GENERATORS[selectedTopic.id];
  if (!gen) { showError("Tema no disponible aún."); return; }

  const fn = gen[selectedDiff] || gen["basico"];
  const data = fn();
  renderExercise(data);
}

// ── Render ────────────────────────────────────────────

function renderExercise(data) {
  const area = document.getElementById("exerciseArea");

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

  const diffLabel = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" }[selectedDiff] || selectedDiff;

  area.innerHTML = `
    <div class="ex-header">
      <div class="ex-meta">
        <span class="badge badge-topic">${escHtml(selectedTopic.label)}</span>
        <span class="badge badge-diff">${diffLabel}</span>
      </div>
      <button class="new-btn" onclick="generateExercise()">Nuevo ↺</button>
    </div>

    <p class="ex-question">${escHtml(data.enunciado)}</p>

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

function toggleSolution() {
  const box = document.getElementById("solutionBox");
  const btn = document.getElementById("solToggle");
  const open = box.classList.toggle("open");
  btn.classList.toggle("open", open);
  btn.querySelector("span:first-child").textContent =
    open ? "Ocultar solución" : "Ver solución paso a paso";
}

// ── Helpers ───────────────────────────────────────────

function showError(msg) {
  document.getElementById("exerciseArea").innerHTML =
    `<div style="color:#f87171;padding:1rem;font-size:14px;">⚠ ${msg}</div>`;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/\n/g,"<br>");
}
