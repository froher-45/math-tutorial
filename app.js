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
//detector de la side bar
document.addEventListener("DOMContentLoaded", () => {
  // 1. Buscamos el archivo sidebar.html
  fetch('../utilidades/sidebar.html')
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar el menú");
      return response.text();
    })
    .then(html => {
      // 2. Insertamos el HTML dentro del aside
      document.getElementById('menu-lateral').innerHTML = html;

      // 3. Lógica para pintar de morado el tema actual
      // Obtenemos el nombre del archivo actual (ej. 'laplace.html')
      let paginaActual = window.location.pathname.split('/').pop();
      
      // Si entra a la raíz sin nombre de archivo, asumimos index.html
      if (paginaActual === '') paginaActual = 'index.html'; 

      // Buscamos todos los enlaces inyectados
      const enlaces = document.querySelectorAll('#menu-lateral a');

      enlaces.forEach(enlace => {
        const href = enlace.getAttribute('href');
        // Si el enlace coincide con la página en la que estamos, le damos la clase 'active'
        if (href === paginaActual) {
          enlace.classList.add('active');
        } else {
          enlace.classList.remove('active');
        }
      });
    })
    .catch(error => console.error('Error cargando el menú lateral:', error));
// --- 2. CÓDIGO DEL GENERADOR DE EJERCICIOS ---
  const genContainer = document.getElementById('generador-container');
  
  if (genContainer) {
    fetch('../utilidades/generador.html')
      .then(response => {
        if (!response.ok) throw new Error("No se pudo cargar el generador");
        return response.text();
      })
      .then(html => {
        // Inyectamos el HTML del generador
        genContainer.innerHTML = html;

        // Leemos qué tema necesita esta página específica
        const temaAsignado = genContainer.getAttribute('data-tema');
        const topicSelect = document.getElementById('topicSelect');

        // Si existe el select y tenemos un tema asignado, lo forzamos
        if (topicSelect && temaAsignado) {
          topicSelect.value = temaAsignado;
        }
      })
      .catch(error => console.error('Error cargando el generador:', error));
  }

  });

 function genFromTutorial() {
      const topicId = document.getElementById("topicSelect").value;
      const diff    = document.getElementById("diffSelect").value;
      const area    = document.getElementById("tutorialExArea");
      const gen     = GENERATORS[topicId];

      if (!gen) { area.innerHTML = `<p style="color:#f87171;margin-top:12px">Tema no disponible aún.</p>`; return; }

      const data       = (gen[diff] || gen["basico"])();
      const topicLabel = document.getElementById("topicSelect").selectedOptions[0].text;
      const diffLabel  = { basico:"Básico", intermedio:"Intermedio", avanzado:"Avanzado" }[diff];

      area.innerHTML = `
        <div class="ex-header" style="margin-top:16px">
          <div class="ex-meta">
            <span class="badge badge-topic">${topicLabel}</span>
            <span class="badge badge-diff">${diffLabel}</span>
          </div>
          <button class="new-btn" onclick="genFromTutorial()">Nuevo ↺</button>
        </div>
        <p class="ex-question">${esc(data.enunciado)}</p>
        <div class="divider"></div>
        <button class="sol-toggle" id="solToggle" onclick="toggleSol()">
          <span>Ver solución paso a paso</span>
          <span class="sol-arrow">▾</span>
        </button>
        <div class="solution-box" id="solutionBox">
          ${(data.pasos||[]).map((p,i) => `
            <div class="step">
              <div class="step-num">${i+1}</div>
              <div class="step-body">
                <div class="step-title">${esc(p.titulo)}</div>
                ${p.explicacion ? `<div class="step-text">${esc(p.explicacion)}</div>` : ""}
                ${p.formula     ? `<code class="step-formula">${esc(p.formula)}</code>` : ""}
              </div>
            </div>`).join("")}
          <div class="answer-box">
            <span class="answer-label">Respuesta</span>
            <span class="answer-value">${esc(data.respuesta)}</span>
          </div>
        </div>`;
    }

    function toggleSol() {
      const box  = document.getElementById("solutionBox");
      const btn  = document.getElementById("solToggle");
      const open = box.classList.toggle("open");
      btn.classList.toggle("open", open);
      btn.querySelector("span:first-child").textContent = open ? "Ocultar solución" : "Ver solución paso a paso";
    }

    function esc(s) {
      return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\n/g,"<br>");
    }