
//  quiz.js — Quiz de 3 preguntas al final del tutorial


// ── Banco de preguntas por tema ────────────────────

const QUIZ_BANK = {

  funciones: [
    {
      pregunta: "¿Qué es el dominio de una función?",
      opciones: [
        "El conjunto de todos los valores posibles de f(x)",
        "El conjunto de todos los valores posibles de x",
        "El valor máximo que puede tomar x",
        "La pendiente de la función"
      ],
      correcta: 1
    },
    {
      pregunta: "Dada f(x) = 2x + 5, ¿cuánto vale f(3)?",
      opciones: ["8", "10", "11", "13"],
      correcta: 2
    },
    {
      pregunta: "¿Cuál de estas NO es una función?",
      opciones: [
        "f(x) = x²",
        "f(x) = 3x − 1",
        "Una relación donde x = 2 tiene dos valores de y distintos",
        "f(x) = √x"
      ],
      correcta: 2
    },
    {
      pregunta: "Si f(x) = x² − 4, ¿cuánto vale f(0)?",
      opciones: ["0", "4", "−4", "2"],
      correcta: 2
    },
    {
      pregunta: "¿Qué representa f(x) en una función?",
      opciones: [
        "El valor de entrada",
        "La variable independiente",
        "El valor de salida",
        "El dominio"
      ],
      correcta: 2
    }
  ],

  limites: [
    {
      pregunta: "¿Qué significa lím(x→2) f(x) = 5?",
      opciones: [
        "f(2) = 5 siempre",
        "f(x) se acerca a 5 cuando x se acerca a 2",
        "x nunca llega a 2",
        "La función no está definida en x = 2"
      ],
      correcta: 1
    },
    {
      pregunta: "¿Cuánto vale lím(x→3) de (2x + 1)?",
      opciones: ["5", "6", "7", "8"],
      correcta: 2
    },
    {
      pregunta: "¿Qué forma indeterminada aparece en lím(x→a) de (x²−a²)/(x−a)?",
      opciones: ["1/0", "∞/∞", "0/0", "0·∞"],
      correcta: 2
    },
    {
      pregunta: "¿Cuándo existe un límite en x = a?",
      opciones: [
        "Cuando f(a) está definida",
        "Cuando el límite por la izquierda e derecha son iguales",
        "Cuando la función es continua en todo su dominio",
        "Cuando f(a) = 0"
      ],
      correcta: 1
    },
    {
      pregunta: "¿Cuánto vale lím(x→∞) de 1/x?",
      opciones: ["1", "∞", "0", "−1"],
      correcta: 2
    }
  ],

  derivadas: [
    {
      pregunta: "¿Cuál es la derivada de f(x) = x³?",
      opciones: ["x²", "3x", "3x²", "x⁴/4"],
      correcta: 2
    },
    {
      pregunta: "¿Cuál es la derivada de una constante?",
      opciones: ["La misma constante", "1", "0", "Indefinida"],
      correcta: 2
    },
    {
      pregunta: "¿Cuál es la derivada de f(x) = 5x²?",
      opciones: ["5x", "10x", "10x²", "5x³/3"],
      correcta: 1
    },
    {
      pregunta: "La derivada representa geométricamente:",
      opciones: [
        "El área bajo la curva",
        "La pendiente de la recta tangente",
        "El volumen de revolución",
        "El valor máximo de la función"
      ],
      correcta: 1
    },
    {
      pregunta: "¿Cuál es la derivada de f(x) = sen(x)?",
      opciones: ["−sen(x)", "cos(x)", "−cos(x)", "tan(x)"],
      correcta: 1
    }
  ],

  integrales: [
    {
      pregunta: "¿Cuál es la integral de f(x) = 2x?",
      opciones: ["2", "x²", "x² + C", "2x² + C"],
      correcta: 2
    },
    {
      pregunta: "¿Qué representa la constante C en una integral indefinida?",
      opciones: [
        "El valor inicial de la función",
        "Una constante arbitraria de integración",
        "El área bajo la curva",
        "El límite superior de integración"
      ],
      correcta: 1
    },
    {
      pregunta: "¿Cuál es la integral de f(x) = 1?",
      opciones: ["0", "x", "x + C", "1/x + C"],
      correcta: 2
    },
    {
      pregunta: "La integral definida ∫ₐᵇ f(x)dx representa:",
      opciones: [
        "La derivada de f en [a,b]",
        "El área con signo bajo la curva entre a y b",
        "El valor máximo de f en [a,b]",
        "La longitud de la curva"
      ],
      correcta: 1
    },
    {
      pregunta: "¿Cuál es la integral de xⁿ (n ≠ −1)?",
      opciones: ["nxⁿ⁻¹", "xⁿ⁺¹ + C", "xⁿ⁺¹/(n+1) + C", "xⁿ/n + C"],
      correcta: 2
    }
  ],

  laplace: [
    {
      pregunta: "¿Cuál es la Transformada de Laplace de f(t) = 1?",
      opciones: ["s", "1/s²", "1/s", "s²"],
      correcta: 2
    },
    {
      pregunta: "¿Cuál es la Transformada de Laplace de eᵃᵗ?",
      opciones: ["1/(s+a)", "a/(s−a)", "1/(s−a)", "s/(s−a)"],
      correcta: 2
    },
    {
      pregunta: "¿Para qué se usa principalmente la Transformada de Laplace?",
      opciones: [
        "Calcular áreas bajo curvas",
        "Resolver ecuaciones diferenciales",
        "Encontrar máximos y mínimos",
        "Calcular derivadas parciales"
      ],
      correcta: 1
    },
    {
      pregunta: "¿Cuál es la Transformada de Laplace de tⁿ?",
      opciones: ["n!/sⁿ", "n!/sⁿ⁺¹", "1/sⁿ", "n/sⁿ⁺¹"],
      correcta: 1
    },
    {
      pregunta: "El primer teorema de traslación establece que L{eᵃᵗf(t)} =",
      opciones: ["F(s+a)", "F(s−a)", "eᵃˢF(s)", "F(s)/a"],
      correcta: 1
    }
  ]
};

// ── Inicializar quiz ───────────────────────────────

function initQuiz(topicId) {
  const container = document.getElementById("quiz");
  if (!container) return;

  const bank = QUIZ_BANK[topicId];
  if (!bank) { container.innerHTML = `<p style="color:#f87171">Quiz no disponible para este tema.</p>`; return; }

  // Seleccionar 3 preguntas al azar
  const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 3);
  container.dataset.questions = JSON.stringify(shuffled);
  container.dataset.current   = 0;
  container.dataset.score     = 0;

  renderQuestion(container, shuffled, 0);
}

// ── Renderizar pregunta ────────────────────────────

function renderQuestion(container, questions, idx) {
  const q     = questions[idx];
  const total = questions.length;

  container.innerHTML = `
    <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center">
      <span style="font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:0.08em">
        Pregunta ${idx + 1} de ${total}
      </span>
      <div style="display:flex; gap:6px">
        ${Array.from({length: total}, (_, i) => `
          <div style="width:8px; height:8px; border-radius:50%;
            background:${i === idx ? 'var(--accent)' : 'var(--bg3)'}; 
            border:1px solid ${i < idx ? 'var(--accent)' : 'var(--border)'}">
          </div>`).join("")}
      </div>
    </div>

    <p style="font-family:var(--serif); font-size:18px; font-style:italic;
      color:var(--text); margin-bottom:20px; line-height:1.4">
      ${q.pregunta}
    </p>

    <div style="display:flex; flex-direction:column; gap:8px" id="quiz-options">
      ${q.opciones.map((op, i) => `
        <button onclick="selectAnswer(${i})" data-idx="${i}" style="
          background:var(--bg3); border:1px solid var(--border);
          border-radius:var(--radius-sm); padding:11px 16px;
          font-family:var(--sans); font-size:13px; color:var(--text2);
          cursor:pointer; text-align:left; transition:all 0.18s;
          display:flex; align-items:center; gap:10px;">
          <span style="width:22px; height:22px; min-width:22px; border-radius:50%;
            background:var(--bg2); border:1px solid var(--border);
            display:flex; align-items:center; justify-content:center;
            font-size:11px; font-family:var(--mono); color:var(--accent)">
            ${String.fromCharCode(65 + i)}
          </span>
          ${op}
        </button>`).join("")}
    </div>

    <div id="quiz-feedback" style="margin-top:14px"></div>`;
}

// ── Seleccionar respuesta ──────────────────────────

function selectAnswer(selected) {
  const container = document.getElementById("quiz");
  const questions = JSON.parse(container.dataset.questions);
  const idx       = parseInt(container.dataset.current);
  const score     = parseInt(container.dataset.score);
  const q         = questions[idx];
  const correct   = q.correcta;
  const buttons   = document.querySelectorAll("#quiz-options button");

  // Deshabilitar todos
  buttons.forEach(b => b.style.pointerEvents = "none");

  // Colorear correcta e incorrecta
  buttons.forEach((b, i) => {
    if (i === correct) {
      b.style.background    = "rgba(52,211,153,0.12)";
      b.style.borderColor   = "#34d399";
      b.style.color         = "#34d399";
      b.querySelector("span").style.background   = "rgba(52,211,153,0.2)";
      b.querySelector("span").style.borderColor  = "#34d399";
      b.querySelector("span").style.color        = "#34d399";
    }
    if (i === selected && selected !== correct) {
      b.style.background    = "rgba(248,113,113,0.1)";
      b.style.borderColor   = "#f87171";
      b.style.color         = "#f87171";
      b.querySelector("span").style.background  = "rgba(248,113,113,0.15)";
      b.querySelector("span").style.borderColor = "#f87171";
      b.querySelector("span").style.color       = "#f87171";
    }
  });

  const isCorrect  = selected === correct;
  const newScore   = isCorrect ? score + 1 : score;
  const isLast     = idx === questions.length - 1;

  container.dataset.score   = newScore;
  container.dataset.current = idx + 1;

  document.getElementById("quiz-feedback").innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px">
      <span style="font-size:13px; color:${isCorrect ? '#34d399' : '#f87171'}">
        ${isCorrect ? "✓ ¡Correcto!" : `✗ La respuesta correcta era: ${q.opciones[correct]}`}
      </span>
      <button onclick="${isLast ? `showResult(${newScore}, ${questions.length})` : `renderQuestion(document.getElementById('quiz'), JSON.parse(document.getElementById('quiz').dataset.questions), ${idx + 1})`}"
        style="background:var(--accent); border:none; border-radius:var(--radius-sm);
        padding:8px 18px; font-family:var(--sans); font-size:13px;
        font-weight:600; color:white; cursor:pointer; transition:opacity 0.18s">
        ${isLast ? "Ver resultado →" : "Siguiente →"}
      </button>
    </div>`;
}

// ── Mostrar resultado final ────────────────────────

function showResult(score, total) {
  const container = document.getElementById("quiz");
  const pct       = Math.round((score / total) * 100);
  const msg       = score === total ? "¡Perfecto! Dominaste el tema 🎉"
                  : score >= 2     ? "¡Bien! Estás en buen camino 👍"
                  : "Sigue repasando, tú puedes 💪";
  const color     = score === total ? "#34d399" : score >= 2 ? "#fbbf24" : "#f87171";

  container.innerHTML = `
    <div style="text-align:center; padding:16px 0">
      <div style="font-size:48px; margin-bottom:12px">
        ${score === total ? "🏆" : score >= 2 ? "⭐" : "📚"}
      </div>
      <div style="font-family:var(--serif); font-size:28px; font-style:italic;
        color:${color}; margin-bottom:8px">
        ${score} / ${total}
      </div>
      <div style="font-size:13px; color:var(--text2); margin-bottom:20px">${msg}</div>
      <div style="height:6px; background:var(--bg3); border-radius:3px; margin-bottom:20px">
        <div style="height:100%; width:${pct}%; background:${color};
          border-radius:3px; transition:width 0.6s ease"></div>
      </div>
      <button onclick="initQuiz(document.getElementById('quiz').dataset.topic)"
        style="background:var(--bg3); border:1px solid var(--border);
        border-radius:var(--radius-sm); padding:9px 20px;
        font-family:var(--sans); font-size:13px; color:var(--text2);
        cursor:pointer; transition:all 0.18s">
        🔄 Intentar de nuevo
      </button>
    </div>`;
}