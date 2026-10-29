// =====================================================
//  ejercicios.js
//  Generadores de ejercicios con procedimiento paso a paso
//  100% JavaScript puro, sin IA, sin internet
// =====================================================

// ── Utilidades ────────────────────────────────────────

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rndNZ(min, max) { // no cero
  let n;
  do { n = rnd(min, max); } while (n === 0);
  return n;
}
function frac(n, d) { // simplifica fracción
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function mcm(a, b) { return (a * b) / gcd(a, b); }
function signo(n) { return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`; }
function fmtFrac(n, d) {
  if (d === 1) return `${n}`;
  if (n < 0 && d < 0) return fmtFrac(-n, -d);
  if (d < 0) return fmtFrac(-n, -d);
  return `${n}/${d}`;
}
function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function round4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

// ══════════════════════════════════════════════════════
//  StatsEngine — Motor de Cálculo y Validación Estadística
// ══════════════════════════════════════════════════════
const StatsEngine = {
  cleanNumber(val, decimals = 4) {
    if (val === null || val === undefined || !Number.isFinite(val)) return null;
    const factor = Math.pow(10, decimals);
    const rounded = Math.round((val + Number.EPSILON) * factor) / factor;
    return Object.is(rounded, -0) ? 0 : rounded;
  },

  calcQuantile(sorted, p) {
    const n = sorted.length;
    if (n === 0) return null;
    if (n === 1) return sorted[0];
    const pos = p * (n + 1);
    if (pos <= 1) return sorted[0];
    if (pos >= n) return sorted[n - 1];
    const lowerIdx = Math.floor(pos) - 1;
    const fracPart = pos - Math.floor(pos);
    return sorted[lowerIdx] + fracPart * (sorted[lowerIdx + 1] - sorted[lowerIdx]);
  },

  analyzeDataset(rawArray) {
    if (!Array.isArray(rawArray)) {
      return { valid: false, error: "La entrada no es un arreglo válido." };
    }
    const nums = rawArray.map(v => Number(v)).filter(v => Number.isFinite(v));
    if (nums.length === 0) {
      return { valid: false, error: "El conjunto de datos está vacío o no contiene valores numéricos válidos." };
    }

    const n = nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Mediana
    const median = (n % 2 === 1)
      ? sorted[(n - 1) / 2]
      : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

    // Tabla de frecuencias
    const freqMap = new Map();
    sorted.forEach(x => freqMap.set(x, (freqMap.get(x) || 0) + 1));
    let cumF = 0;
    const freqTable = [];
    for (const [x, f] of freqMap.entries()) {
      cumF += f;
      const h = f / n;
      freqTable.push({
        x,
        f,
        h,
        pct: h * 100,
        F: cumF,
        H: cumF / n
      });
    }

    // Moda (unimodal, bimodal, multimodal, amodal)
    const maxFreq = Math.max(...freqTable.map(r => r.f));
    let modes = [];
    let modeType = "Amodal";
    let modeLabel = "Sin moda";

    if (n === 1) {
      modes = [sorted[0]];
      modeType = "Unimodal";
      modeLabel = `${sorted[0]}`;
    } else if (maxFreq === 1) {
      modes = [];
      modeType = "Amodal";
      modeLabel = "Sin moda";
    } else if (freqTable.length > 1 && freqTable.every(r => r.f === maxFreq)) {
      modes = [];
      modeType = "Amodal";
      modeLabel = "Frecuencia uniforme";
    } else {
      modes = freqTable.filter(r => r.f === maxFreq).map(r => r.x);
      modeType = modes.length === 1 ? "Unimodal" : (modes.length === 2 ? "Bimodal" : "Multimodal");
      modeLabel = modes.join(", ");
    }

    // Media Geométrica (solo definida para datos estrictamente positivos)
    const allPositive = sorted.every(x => x > 0);
    const geometricMean = allPositive
      ? Math.exp(sorted.reduce((acc, x) => acc + Math.log(x), 0) / n)
      : null;

    // Desviaciones respecto a la media
    const absDevs = sorted.map(x => Math.abs(x - mean));
    const sumAbsDevs = absDevs.reduce((acc, v) => acc + v, 0);
    const meanDeviation = sumAbsDevs / n;

    const sqDevs = sorted.map(x => Math.pow(x - mean, 2));
    const sumSqDevs = sqDevs.reduce((acc, v) => acc + v, 0);

    // Varianza y Desviación Estándar Poblacional (÷ N) y Muestral (÷ (n - 1))
    const popVariance = sumSqDevs / n;
    const popStdDev = Math.sqrt(popVariance);
    const sampleVariance = n > 1 ? sumSqDevs / (n - 1) : null;
    const sampleStdDev = n > 1 ? Math.sqrt(sampleVariance) : null;

    const cvPop = mean !== 0 ? (popStdDev / Math.abs(mean)) * 100 : null;
    const cvSample = (n > 1 && mean !== 0) ? (sampleStdDev / Math.abs(mean)) * 100 : null;

    // Cuartiles y Rango Intercuartílico
    const q1 = this.calcQuantile(sorted, 0.25);
    const q2 = median;
    const q3 = this.calcQuantile(sorted, 0.75);
    const iqr = (q3 !== null && q1 !== null) ? (q3 - q1) : null;

    return {
      valid: true,
      n,
      raw: nums,
      sorted,
      sum: this.cleanNumber(sum, 6),
      mean: this.cleanNumber(mean, 6),
      median: this.cleanNumber(median, 6),
      modes,
      maxFreq,
      modeType,
      modeLabel,
      geometricMean: geometricMean !== null ? this.cleanNumber(geometricMean, 6) : null,
      min,
      max,
      range: this.cleanNumber(range, 6),
      freqTable,
      absDevs: absDevs.map(d => this.cleanNumber(d, 6)),
      sumAbsDevs: this.cleanNumber(sumAbsDevs, 6),
      meanDeviation: this.cleanNumber(meanDeviation, 6),
      sqDevs: sqDevs.map(d => this.cleanNumber(d, 6)),
      sumSqDevs: this.cleanNumber(sumSqDevs, 6),
      popVariance: this.cleanNumber(popVariance, 6),
      popStdDev: this.cleanNumber(popStdDev, 6),
      sampleVariance: sampleVariance !== null ? this.cleanNumber(sampleVariance, 6) : null,
      sampleStdDev: sampleStdDev !== null ? this.cleanNumber(sampleStdDev, 6) : null,
      cvPop: cvPop !== null ? this.cleanNumber(cvPop, 4) : null,
      cvSample: cvSample !== null ? this.cleanNumber(cvSample, 4) : null,
      q1: this.cleanNumber(q1, 6),
      q2: this.cleanNumber(q2, 6),
      q3: this.cleanNumber(q3, 6),
      iqr: this.cleanNumber(iqr, 6)
    };
  },

  calcWeightedMean(values, weights) {
    if (!Array.isArray(values) || !Array.isArray(weights) || values.length === 0 || values.length !== weights.length) {
      return { valid: false, error: "Los valores y los pesos deben tener la misma cantidad de elementos." };
    }
    const vNums = values.map(Number);
    const wNums = weights.map(Number);
    if (vNums.some(v => !Number.isFinite(v)) || wNums.some(w => !Number.isFinite(w) || w < 0)) {
      return { valid: false, error: "Valores o pesos inválidos (los pesos no pueden ser negativos)." };
    }
    const sumWeights = wNums.reduce((a, b) => a + b, 0);
    if (sumWeights <= 0) {
      return { valid: false, error: "La suma de los pesos debe ser estrictamente mayor que cero." };
    }
    const products = vNums.map((v, i) => this.cleanNumber(v * wNums[i], 6));
    const sumProducts = this.cleanNumber(products.reduce((a, b) => a + b, 0), 6);
    const weightedMean = this.cleanNumber(sumProducts / sumWeights, 6);
    return {
      valid: true,
      values: vNums,
      weights: wNums,
      products,
      sumProducts,
      sumWeights: this.cleanNumber(sumWeights, 6),
      weightedMean
    };
  },

  // Extrae valores numéricos (incluyendo fracciones a/b y decimales con coma o punto) de una cadena
  extractNumbers(str) {
    if (str === null || str === undefined) return [];
    let s = String(str).trim();
    if (!s) return [];
    // Si hay comas usadas como separador decimal (ej. "4,5" y no lista "4, 5, 6"), normalizar:
    // Reemplaza patrones dígito,dígito sin espacio cuando hay un solo número o cuando se usa punto y coma
    s = s.replace(/(\d),(\d)/g, "$1.$2");
    // Buscar fracciones a/b o números decimales/enteros
    const tokens = s.match(/[+-]?\d+(?:\.\d+)?(?:\s*\/\s*[+-]?\d+(?:\.\d+)?)?/g) || [];
    const results = [];
    for (const tok of tokens) {
      if (tok.includes("/")) {
        const [num, den] = tok.split("/").map(t => parseFloat(t.trim()));
        if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
          results.push(num / den);
        }
      } else {
        const val = parseFloat(tok);
        if (Number.isFinite(val)) results.push(val);
      }
    }
    return results;
  },

  // Valida la respuesta del estudiante contra la respuesta esperada del ejercicio
  validateAnswer(userRaw, exerciseData, tolerance = 0.05) {
    const input = String(userRaw || "").trim();
    if (!input) {
      return { valid: false, isEmpty: true, message: "Ingresa una respuesta antes de comprobar." };
    }
    const expectedStr = String(exerciseData.respuesta || "").trim();

    // 1. Comparación textual normalizada (sin espacios, signos equivalentes)
    const normText = (txt) => txt
      .toLowerCase()
      .replace(/,/g, ".")
      .replace(/−/g, "-")
      .replace(/≈/g, "=")
      .replace(/\s+/g, "");

    if (normText(input) === normText(expectedStr)) {
      return { valid: true, message: "¡Correcto! Tu respuesta coincide exactamente." };
    }

    // Si la respuesta esperada tiene "x = valor" o similar, comparar también la parte derecha del "="
    if (expectedStr.includes("=")) {
      const rhsParts = expectedStr.split(",").map(part => {
        const eqIdx = part.lastIndexOf("=");
        return eqIdx >= 0 ? part.slice(eqIdx + 1).trim() : part.trim();
      });
      if (rhsParts.length === 1 && normText(input) === normText(rhsParts[0])) {
        return { valid: true, message: "¡Correcto! El resultado es exacto." };
      }
    }

    // 2. Comparación numérica con tolerancia de redondeo
    const expectedNums = Array.isArray(exerciseData. numericAnswers)
      ? exerciseData.numericAnswers
      : this.extractNumbers(
          expectedStr.includes("=")
            ? expectedStr.split(",").map(p => p.includes("=") ? p.slice(p.lastIndexOf("=") + 1) : (p.includes("≈") ? p.slice(p.lastIndexOf("≈") + 1) : p)).join(" ")
            : expectedStr
        );

    const userNums = this.extractNumbers(input);

    if (expectedNums.length > 0 && userNums.length > 0) {
      // Verificar si todos los números esperados están presentes dentro de la tolerancia
      if (userNums.length === expectedNums.length) {
        const allMatch = expectedNums.every((expVal, idx) => Math.abs(userNums[idx] - expVal) <= tolerance);
        if (allMatch) {
          return { valid: true, message: "¡Correcto! Tu resultado numérico es válido." };
        }
      }
      // Si solo ingresó el resultado principal (el primer o último número clave)
      if (userNums.length === 1 && expectedNums.length === 1) {
        if (Math.abs(userNums[0] - expectedNums[0]) <= tolerance) {
          return { valid: true, message: "¡Correcto! Tu resultado numérico es válido." };
        }
      }
    }

    return {
      valid: false,
      message: `Respuesta incorrecta. Se esperaba: ${expectedStr}`
    };
  }
};

// ── Tabla de temas ────────────────────────────────────

const GENERATORS = {

  // ══════════════════════════════════════════════════
  //  ARITMÉTICA
  // ══════════════════════════════════════════════════
  aritmetica: {
    basico() {
      const a = rnd(2, 20), b = rnd(2, 20), c = rnd(2, 10);
      const res = a * b + c;
      return {
        enunciado: `Calcula: ${a} × ${b} + ${c}`,
        pasos: [
          { titulo: "Jerarquía de operaciones", explicacion: "Según la jerarquía, la multiplicación se realiza antes que la suma.", formula: `${a} × ${b} + ${c}` },
          { titulo: "Multiplicación primero", explicacion: `Multiplicamos ${a} × ${b}.`, formula: `${a} × ${b} = ${a * b}` },
          { titulo: "Suma final", explicacion: `Sumamos el resultado al número restante.`, formula: `${a * b} + ${c} = ${res}` },
        ],
        respuesta: `${res}`
      };
    },
    intermedio() {
      const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 9);
      const res = a * b - c * d;
      return {
        enunciado: `Calcula: ${a} × ${b} − ${c} × ${d}`,
        pasos: [
          { titulo: "Jerarquía de operaciones", explicacion: "Las multiplicaciones se resuelven antes que las restas.", formula: `${a} × ${b} − ${c} × ${d}` },
          { titulo: "Primera multiplicación", explicacion: `${a} × ${b}`, formula: `${a} × ${b} = ${a * b}` },
          { titulo: "Segunda multiplicación", explicacion: `${c} × ${d}`, formula: `${c} × ${d} = ${c * d}` },
          { titulo: "Resta final", explicacion: "Restamos los dos resultados.", formula: `${a * b} − ${c * d} = ${res}` },
        ],
        respuesta: `${res}`
      };
    },
    avanzado() {
      const n1 = rnd(1, 9), d1 = rnd(2, 9);
      const n2 = rnd(1, 9), d2 = rnd(2, 9);
      const denCom = mcm(d1, d2);
      const num1 = n1 * (denCom / d1);
      const num2 = n2 * (denCom / d2);
      const numRes = num1 + num2;
      const [nf, df] = frac(numRes, denCom);
      return {
        enunciado: `Suma las fracciones: ${n1}/${d1} + ${n2}/${d2}`,
        pasos: [
          { titulo: "Identificar denominadores", explicacion: `Los denominadores son ${d1} y ${d2}. Hay que encontrar el mínimo común múltiplo (MCM).`, formula: `MCM(${d1}, ${d2})` },
          { titulo: "Calcular el MCM", explicacion: `El MCM de ${d1} y ${d2} es ${denCom}. Ese será el denominador común.`, formula: `MCM = ${denCom}` },
          { titulo: "Convertir fracciones", explicacion: "Multiplicamos numerador y denominador de cada fracción para obtener el denominador común.", formula: `${n1}/${d1} = ${num1}/${denCom}    |    ${n2}/${d2} = ${num2}/${denCom}` },
          { titulo: "Sumar numeradores", explicacion: "Con el mismo denominador, sumamos los numeradores.", formula: `${num1}/${denCom} + ${num2}/${denCom} = ${numRes}/${denCom}` },
          { titulo: "Simplificar", explicacion: df === 1 ? "El resultado es un número entero." : `Simplificamos dividiendo entre ${gcd(numRes, denCom)}.`, formula: `${fmtFrac(nf, df)}` },
        ],
        respuesta: fmtFrac(nf, df)
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  ÁLGEBRA — productos notables / factorización
  // ══════════════════════════════════════════════════
  algebra: {
    basico() {
      const a = rndNZ(-9, 9), b = rndNZ(-9, 9);
      // (x + a)(x + b)
      const c = a + b, d = a * b;
      return {
        enunciado: `Expande el producto: (x ${signo(a)})(x ${signo(b)})`,
        pasos: [
          { titulo: "Reconocer la forma", explicacion: "Es un producto de dos binomios de la forma (x + a)(x + b).", formula: `(x ${signo(a)})(x ${signo(b)})` },
          { titulo: "Aplicar FOIL", explicacion: "Multiplicamos: Primeros × Primeros, Externos, Internos, Últimos.", formula: `x·x  +  x·(${b})  +  (${a})·x  +  (${a})·(${b})` },
          { titulo: "Simplificar términos semejantes", explicacion: `Sumamos los términos en x: ${b}x + ${a}x = ${c}x. Y el término independiente: ${a}·${b} = ${d}.`, formula: `x² ${signo(c)}x ${signo(d)}` },
        ],
        respuesta: `x² ${signo(c)}x ${signo(d)}`
      };
    },
    intermedio() {
      const a = rndNZ(1, 8);
      // Diferencia de cuadrados: (x+a)(x-a) = x²-a²
      return {
        enunciado: `Expande usando diferencia de cuadrados: (x + ${a})(x − ${a})`,
        pasos: [
          { titulo: "Reconocer la forma", explicacion: "Este es el producto notable conocido como diferencia de cuadrados: (a + b)(a − b) = a² − b².", formula: `(x + ${a})(x − ${a}) = x² − (${a})²` },
          { titulo: "Elevar al cuadrado el segundo término", explicacion: `Calculamos (${a})² = ${a * a}.`, formula: `(${a})² = ${a * a}` },
          { titulo: "Escribir el resultado", explicacion: "Sustituimos en la fórmula.", formula: `x² − ${a * a}` },
        ],
        respuesta: `x² − ${a * a}`
      };
    },
    avanzado() {
      const a = rndNZ(1, 6), b = rndNZ(1, 6);
      // (ax + b)² = a²x² + 2abx + b²
      const a2 = a * a, b2 = b * b, ab2 = 2 * a * b;
      return {
        enunciado: `Expande el cuadrado del binomio: (${a}x + ${b})²`,
        pasos: [
          { titulo: "Fórmula del cuadrado del binomio", explicacion: "(p + q)² = p² + 2pq + q²", formula: `(${a}x + ${b})² = (${a}x)² + 2·(${a}x)·${b} + (${b})²` },
          { titulo: "Calcular cada término", explicacion: `Primer término: (${a}x)² = ${a2}x²\nSegundo término: 2·${a}·${b}·x = ${ab2}x\nTercer término: ${b}² = ${b2}`, formula: `${a2}x²  +  ${ab2}x  +  ${b2}` },
          { titulo: "Resultado final", explicacion: "Escribimos el trinomio completo.", formula: `${a2}x² + ${ab2}x + ${b2}` },
        ],
        respuesta: `${a2}x² + ${ab2}x + ${b2}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  ECUACIONES
  // ══════════════════════════════════════════════════
  ecuaciones: {
    basico() {
      const sol = rnd(-10, 10);
      const b   = rndNZ(1, 8);
      const d   = rndNZ(-8, 8);
      // bx + d = rhs  → x = (rhs - d) / b
      const rhs = b * sol + d;
      return {
        enunciado: `Resuelve la ecuación: ${b}x ${signo(d)} = ${rhs}`,
        pasos: [
          { titulo: "Despejar el término con x", explicacion: `Pasamos ${d > 0 ? '+' : '−'}${Math.abs(d)} al otro lado cambiando de signo.`, formula: `${b}x = ${rhs} ${signo(-d)}` },
          { titulo: "Simplificar el lado derecho", explicacion: `${rhs} ${d >= 0 ? '−' : '+'} ${Math.abs(d)} = ${sol * b}`, formula: `${b}x = ${sol * b}` },
          { titulo: "Dividir entre el coeficiente de x", explicacion: `Dividimos ambos lados entre ${b}.`, formula: `x = ${sol * b} ÷ ${b} = ${sol}` },
          { titulo: "Verificación", explicacion: `Sustituimos x = ${sol} en la ecuación original.`, formula: `${b}·(${sol}) ${signo(d)} = ${b * sol + d} = ${rhs} ✓` },
        ],
        respuesta: `x = ${sol}`
      };
    },
    intermedio() {
      const xval = rnd(-8, 8);
      const a = rndNZ(2, 7);
      let c = rndNZ(1, 6);
      if (a === c) c = a - 1;
      const b = rndNZ(-10, 10);
      // ax + b = cx + d  →  (a - c)x = d - b  →  d = (a - c)*xval + b
      const d = (a - c) * xval + b;
      return {
        enunciado: `Resuelve: ${a}x ${signo(b)} = ${c}x ${signo(d)}`,
        pasos: [
          { titulo: "Agrupar términos con x", explicacion: "Pasamos todos los términos con x al lado izquierdo y las constantes al derecho.", formula: `${a}x − ${c}x = ${d} ${signo(-b)}` },
          { titulo: "Simplificar cada lado", explicacion: `${a}x − ${c}x = ${a - c}x. En el lado derecho: ${d} ${signo(-b)} = ${d - b}.`, formula: `${a - c}x = ${d - b}` },
          { titulo: "Despejar x", explicacion: `Dividimos ambos lados entre ${a - c}.`, formula: `x = ${d - b} ÷ ${a - c} = ${xval}` },
          { titulo: "Verificación", explicacion: "Comprobamos sustituyendo en la ecuación original.", formula: `${a}·(${xval}) ${signo(b)} = ${a * xval + b}    |    ${c}·(${xval}) ${signo(d)} = ${c * xval + d} ✓` },
        ],
        respuesta: `x = ${xval}`
      };
    },
    avanzado() {
      // Ecuación cuadrática: ax² + bx + c = 0 con soluciones enteras
      const r1 = rndNZ(-6, 6), r2 = rndNZ(-6, 6);
      const A = 1, B = -(r1 + r2), C = r1 * r2;
      const disc = B * B - 4 * A * C;
      const termB = B === 0 ? "" : ` ${signo(B)}x`;
      return {
        enunciado: `Resuelve la ecuación cuadrática: x²${termB} ${signo(C)} = 0`,
        pasos: [
          { titulo: "Identificar coeficientes", explicacion: "Ecuación de la forma ax² + bx + c = 0.", formula: `a = 1,   b = ${B},   c = ${C}` },
          { titulo: "Calcular el discriminante", explicacion: "Δ = b² − 4ac", formula: `Δ = (${B})² − 4·(1)·(${C}) = ${B * B} − (${4 * C}) = ${disc}` },
          { titulo: "Aplicar la fórmula general", explicacion: `x = (−b ± √Δ) / 2a`, formula: `x = (−(${B}) ± √${disc}) / 2\nx = (${-B} ± ${Math.sqrt(disc)}) / 2` },
          { titulo: "Calcular las dos soluciones", explicacion: "Tomamos una vez el signo + y otra el signo −.", formula: `x₁ = (${-B} + ${Math.sqrt(disc)}) / 2 = ${Math.max(r1, r2)}\nx₂ = (${-B} − ${Math.sqrt(disc)}) / 2 = ${Math.min(r1, r2)}` },
          { titulo: "Verificación por factorización", explicacion: "Podemos expresar la ecuación como producto de factores.", formula: `(x ${signo(-r1)})(x ${signo(-r2)}) = 0` },
        ],
        respuesta: r1 === r2 ? `x = ${r1} (raíz doble)` : `x₁ = ${Math.max(r1, r2)},   x₂ = ${Math.min(r1, r2)}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  POLINOMIOS
  // ══════════════════════════════════════════════════
  polinomios: {
    basico() {
      const a = rndNZ(-5,5), b = rndNZ(-5,5), c = rndNZ(-5,5), d = rndNZ(-5,5);
      const r0 = a+c, r1 = b+d;
      return {
        enunciado: `Suma los polinomios: P(x) = ${a}x ${signo(b)}   y   Q(x) = ${c}x ${signo(d)}`,
        pasos: [
          { titulo: "Identificar términos semejantes", explicacion: "Agrupamos los términos del mismo grado.", formula: `(${a}x ${signo(c)}x) + (${b} ${signo(d)})` },
          { titulo: "Sumar coeficientes de x", explicacion: `${a} + (${c}) = ${r0}`, formula: `${r0}x` },
          { titulo: "Sumar términos independientes", explicacion: `${b} + (${d}) = ${r1}`, formula: `${r1}` },
          { titulo: "Resultado", explicacion: "Escribimos el polinomio resultante.", formula: `P(x) + Q(x) = ${r0}x ${signo(r1)}` },
        ],
        respuesta: `${r0}x ${signo(r1)}`
      };
    },
    intermedio() {
      const a = rndNZ(-4,4), b = rndNZ(-6,6), c = rndNZ(-6,6);
      const d = rndNZ(-4,4), e = rndNZ(-6,6), f = rndNZ(-6,6);
      const r2 = a+d, r1 = b+e, r0 = c+f;
      return {
        enunciado: `Suma: P(x) = ${a}x² ${signo(b)}x ${signo(c)}   y   Q(x) = ${d}x² ${signo(e)}x ${signo(f)}`,
        pasos: [
          { titulo: "Agrupar por grado", explicacion: "Sumamos coeficientes del mismo grado.", formula: `(${a} ${signo(d)})x² + (${b} ${signo(e)})x + (${c} ${signo(f)})` },
          { titulo: "Calcular cada grupo", explicacion: `Grado 2: ${a}+(${d})=${r2} | Grado 1: ${b}+(${e})=${r1} | Grado 0: ${c}+(${f})=${r0}`, formula: `${r2}x² ${signo(r1)}x ${signo(r0)}` },
        ],
        respuesta: `${r2}x² ${signo(r1)}x ${signo(r0)}`
      };
    },
    avanzado() {
      const a = rndNZ(1,4), b = rndNZ(-5,5);
      const val = rnd(-3,3);
      const res = a * val * val + b * val;
      return {
        enunciado: `Evalúa P(x) = ${a}x² ${signo(b)}x en x = ${val}`,
        pasos: [
          { titulo: "Sustituir x = " + val, explicacion: "Reemplazamos x por el valor dado en el polinomio.", formula: `P(${val}) = ${a}·(${val})² ${signo(b)}·(${val})` },
          { titulo: "Calcular la potencia", explicacion: `(${val})² = ${val * val}`, formula: `${a}·${val * val} ${signo(b)}·${val}` },
          { titulo: "Multiplicaciones", explicacion: `${a}·${val*val} = ${a*val*val}   y   ${b}·${val} = ${b*val}`, formula: `${a*val*val} ${signo(b*val)}` },
          { titulo: "Resultado final", explicacion: "Sumamos los términos.", formula: `P(${val}) = ${res}` },
        ],
        respuesta: `P(${val}) = ${res}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  FUNCIONES
  // ══════════════════════════════════════════════════
  funciones: {
    basico() {
      const a = rndNZ(-5,5), b = rnd(-8,8), val = rnd(-5,5);
      const res = a * val + b;
      return {
        enunciado: `Dada f(x) = ${a}x ${signo(b)}, calcula f(${val})`,
        pasos: [
          { titulo: "Sustituir el valor", explicacion: `Reemplazamos x por ${val} en la función.`, formula: `f(${val}) = ${a}·(${val}) ${signo(b)}` },
          { titulo: "Multiplicar", explicacion: `${a} × ${val} = ${a*val}`, formula: `f(${val}) = ${a*val} ${signo(b)}` },
          { titulo: "Sumar", explicacion: `${a*val} + (${b}) = ${res}`, formula: `f(${val}) = ${res}` },
        ],
        respuesta: `f(${val}) = ${res}`
      };
    },
    intermedio() {
      const a = rndNZ(-3,3), b = rnd(-5,5), c = rnd(-5,5);
      const val = rnd(-4,4);
      const res = a*val*val + b*val + c;
      return {
        enunciado: `Dada f(x) = ${a}x² ${signo(b)}x ${signo(c)}, calcula f(${val})`,
        pasos: [
          { titulo: "Sustituir", explicacion: `x = ${val}`, formula: `f(${val}) = ${a}·(${val})² ${signo(b)}·(${val}) ${signo(c)}` },
          { titulo: "Calcular potencia", explicacion: `(${val})² = ${val*val}`, formula: `${a}·${val*val} ${signo(b*val)} ${signo(c)}` },
          { titulo: "Multiplicaciones", explicacion: `${a}·${val*val} = ${a*val*val}`, formula: `${a*val*val} ${signo(b*val)} ${signo(c)}` },
          { titulo: "Suma final", explicacion: "Sumamos todos los términos.", formula: `f(${val}) = ${res}` },
        ],
        respuesta: `f(${val}) = ${res}`
      };
    },
    avanzado() {
      // Composición de funciones
      const a = rndNZ(1,4), b = rnd(-5,5), c = rndNZ(1,4), d = rnd(-5,5);
      const val = rnd(-3,3);
      const gval = c*val + d;
      const fgval = a*gval + b;
      return {
        enunciado: `Dadas f(x) = ${a}x ${signo(b)} y g(x) = ${c}x ${signo(d)}, calcula f(g(${val}))`,
        pasos: [
          { titulo: "Calcular g(x) primero", explicacion: `Evaluamos g(${val}) sustituyendo x = ${val}.`, formula: `g(${val}) = ${c}·(${val}) ${signo(d)} = ${c*val} ${signo(d)} = ${gval}` },
          { titulo: "Usar el resultado en f", explicacion: `Ahora calculamos f(g(${val})) = f(${gval}).`, formula: `f(${gval}) = ${a}·(${gval}) ${signo(b)}` },
          { titulo: "Calcular f(g(x))", explicacion: `${a} × ${gval} = ${a*gval}`, formula: `f(${gval}) = ${a*gval} ${signo(b)} = ${fgval}` },
        ],
        respuesta: `f(g(${val})) = ${fgval}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  TRIGONOMETRÍA
  // ══════════════════════════════════════════════════
  trigonometria: {
    basico() {
      const angulos = [0,30,45,60,90];
      const ang = angulos[rnd(0,4)];
      const vals = {
        0:  { sin:'0', cos:'1', tan:'0' },
        30: { sin:'1/2', cos:'√3/2', tan:'1/√3 = √3/3' },
        45: { sin:'√2/2', cos:'√2/2', tan:'1' },
        60: { sin:'√3/2', cos:'1/2', tan:'√3' },
        90: { sin:'1', cos:'0', tan:'indefinido' },
      };
      const v = vals[ang];
      return {
        enunciado: `Calcula sen(${ang}°), cos(${ang}°) y tan(${ang}°)`,
        pasos: [
          { titulo: "Triángulo de referencia", explicacion: `Para ${ang}° usamos el triángulo de referencia del círculo unitario.`, formula: `Ángulo = ${ang}°` },
          { titulo: "Seno", explicacion: "El seno es la razón entre el cateto opuesto y la hipotenusa.", formula: `sen(${ang}°) = ${v.sin}` },
          { titulo: "Coseno", explicacion: "El coseno es la razón entre el cateto adyacente y la hipotenusa.", formula: `cos(${ang}°) = ${v.cos}` },
          { titulo: "Tangente", explicacion: "La tangente es sen/cos.", formula: `tan(${ang}°) = ${v.tan}` },
        ],
        respuesta: `sen=${v.sin}, cos=${v.cos}, tan=${v.tan}`
      };
    },
    intermedio() {
      const ang = [30,45,60][rnd(0,2)];
      const sines   = { 30: 0.5, 45: Math.SQRT2/2, 60: Math.sqrt(3)/2 };
      const cosines = { 30: Math.sqrt(3)/2, 45: Math.SQRT2/2, 60: 0.5 };
      const s = sines[ang], c = cosines[ang];
      const sin2 = round2(s*s), cos2 = round2(c*c);
      return {
        enunciado: `Verifica la identidad pitagórica para θ = ${ang}°: sen²(θ) + cos²(θ) = 1`,
        pasos: [
          { titulo: "Valores del ángulo", explicacion: `Tomamos los valores exactos de ${ang}°.`, formula: `sen(${ang}°) = ${ang===45?'√2/2':ang===30?'1/2':'√3/2'}    cos(${ang}°) = ${ang===45?'√2/2':ang===60?'1/2':'√3/2'}` },
          { titulo: "Elevar al cuadrado", explicacion: "Calculamos el cuadrado de cada valor.", formula: `sen²(${ang}°) = ${sin2}    cos²(${ang}°) = ${cos2}` },
          { titulo: "Sumar", explicacion: "Sumamos ambos cuadrados.", formula: `${sin2} + ${cos2} = ${round2(sin2+cos2)}` },
          { titulo: "Conclusión", explicacion: "La identidad se cumple.", formula: `sen²(${ang}°) + cos²(${ang}°) = 1 ✓` },
        ],
        respuesta: `Identidad verificada: ${sin2} + ${cos2} = 1`
      };
    },
    avanzado() {
      const A = [30,45,60][rnd(0,2)];
      const B = [30,45,60][rnd(0,2)];
      const sinA = { 30:'1/2', 45:'√2/2', 60:'√3/2' }[A];
      const cosA = { 30:'√3/2', 45:'√2/2', 60:'1/2' }[A];
      const sinB = { 30:'1/2', 45:'√2/2', 60:'√3/2' }[B];
      const cosB = { 30:'√3/2', 45:'√2/2', 60:'1/2' }[B];
      const sum = A + B;
      const sinSum = round2(Math.sin((sum)*Math.PI/180));
      return {
        enunciado: `Usa la fórmula de adición para calcular sen(${A}° + ${B}°)`,
        pasos: [
          { titulo: "Fórmula de adición del seno", explicacion: "sen(A + B) = sen(A)·cos(B) + cos(A)·sen(B)", formula: `sen(${A}° + ${B}°) = sen(${A}°)·cos(${B}°) + cos(${A}°)·sen(${B}°)` },
          { titulo: "Sustituir valores", explicacion: `Sustituimos los valores conocidos.`, formula: `= (${sinA})·(${cosB}) + (${cosA})·(${sinB})` },
          { titulo: "Calcular productos y sumar", explicacion: "Multiplicamos y sumamos.", formula: `= sen(${sum}°) ≈ ${sinSum}` },
        ],
        respuesta: `sen(${sum}°) ≈ ${sinSum}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  LOGARITMOS
  // ══════════════════════════════════════════════════
  logaritmos: {
    basico() {
      const bases = [2,3,5,10];
      const base = bases[rnd(0,3)];
      const exp  = rnd(1,5);
      const arg  = Math.pow(base, exp);
      return {
        enunciado: `Calcula: log base ${base} de ${arg}   →   log_${base}(${arg})`,
        pasos: [
          { titulo: "Definición de logaritmo", explicacion: `log_b(x) = y  significa que  b^y = x`, formula: `log_${base}(${arg}) = y  ⟺  ${base}^y = ${arg}` },
          { titulo: "Encontrar el exponente", explicacion: `¿A qué potencia hay que elevar ${base} para obtener ${arg}?`, formula: `${base}^${exp} = ${arg}` },
          { titulo: "Resultado", explicacion: `El exponente es ${exp}.`, formula: `log_${base}(${arg}) = ${exp}` },
        ],
        respuesta: `log_${base}(${arg}) = ${exp}`
      };
    },
    intermedio() {
      const a = rnd(2,5), b = rnd(2,5);
      const logA = Math.log10(a), logB = Math.log10(b);
      return {
        enunciado: `Simplifica usando propiedades: log(${a}) + log(${b})`,
        pasos: [
          { titulo: "Propiedad del producto", explicacion: "log(a) + log(b) = log(a × b)", formula: `log(${a}) + log(${b}) = log(${a} × ${b})` },
          { titulo: "Multiplicar argumentos", explicacion: `${a} × ${b} = ${a*b}`, formula: `log(${a*b})` },
          { titulo: "Valor aproximado", explicacion: `Si es log base 10:`, formula: `log₁₀(${a*b}) ≈ ${round2(Math.log10(a*b))}` },
        ],
        respuesta: `log(${a*b}) ≈ ${round2(Math.log10(a*b))}`
      };
    },
    avanzado() {
      const base = [2,3,10][rnd(0,2)];
      const exp = rnd(2,5);
      const arg = Math.pow(base, exp);
      return {
        enunciado: `Resuelve la ecuación logarítmica: log_${base}(x) = ${exp}`,
        pasos: [
          { titulo: "Definición", explicacion: "Convertimos la ecuación logarítmica a forma exponencial.", formula: `log_${base}(x) = ${exp}  ⟺  ${base}^${exp} = x` },
          { titulo: "Calcular la potencia", explicacion: `Elevamos ${base} a la ${exp}.`, formula: `${base}^${exp} = ${arg}` },
          { titulo: "Solución", explicacion: "El valor de x es:", formula: `x = ${arg}` },
          { titulo: "Verificación", explicacion: "Comprobamos sustituyendo en la ecuación original.", formula: `log_${base}(${arg}) = ${exp} ✓` },
        ],
        respuesta: `x = ${arg}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  EXPONENCIALES
  // ══════════════════════════════════════════════════
  exponenciales: {
    basico() {
      const A = rnd(1, 10), k = rndNZ(1, 4), t = rnd(1, 5);
      const res = round2(A * Math.exp(k * t));
      return {
        enunciado: `Dada N(t) = ${A}·e^(${k}t), calcula N(${t})`,
        pasos: [
          { titulo: "Sustituir el valor de t", explicacion: `Reemplazamos t = ${t} en la función.`, formula: `N(${t}) = ${A}·e^(${k}·${t})` },
          { titulo: "Calcular el exponente", explicacion: `${k} × ${t} = ${k * t}`, formula: `N(${t}) = ${A}·e^(${k * t})` },
          { titulo: `Evaluar e^(${k * t})`, explicacion: `e^(${k * t}) ≈ ${round2(Math.exp(k * t))}`, formula: `N(${t}) = ${A} × ${round2(Math.exp(k * t))}` },
          { titulo: "Resultado final", explicacion: "Multiplicamos.", formula: `N(${t}) ≈ ${res}` },
        ],
        respuesta: `N(${t}) ≈ ${res}`
      };
    },
    intermedio() {
      const N0 = rnd(100, 500), k = round2(rnd(1, 5) * 0.1);
      const thalf = round2(Math.log(2) / k);
      return {
        enunciado: `Una sustancia tiene N₀ = ${N0} y tasa de decaimiento k = ${k}. Halla la vida media t½.`,
        pasos: [
          { titulo: "Modelo de decaimiento", explicacion: "La función de decaimiento es N(t) = N₀·e^(−kt).", formula: `N(t) = ${N0}·e^(−${k}t)` },
          { titulo: "Condición de vida media", explicacion: "En t = t½, la cantidad es la mitad del valor inicial.", formula: `N(t½) = ${N0}/2 = ${N0 / 2}` },
          { titulo: "Plantear la ecuación", explicacion: "Sustituimos la condición.", formula: `${N0}/2 = ${N0}·e^(−${k}·t½)` },
          { titulo: "Cancelar N₀ y aplicar logaritmo", explicacion: "Dividimos entre N₀ y aplicamos ln.", formula: `1/2 = e^(−${k}·t½)  →  ln(1/2) = −${k}·t½` },
          { titulo: "Despejar t½", explicacion: "Usamos ln(1/2) = −ln(2) ≈ −0.693.", formula: `t½ = ln(2) / ${k} = 0.693 / ${k} ≈ ${thalf}` },
        ],
        respuesta: `t½ ≈ ${thalf} unidades de tiempo`
      };
    },
    avanzado() {
      const P = rnd(500, 2000), r = round2(rnd(1, 8) * 0.01), t = rnd(5, 20);
      const A = round2(P * Math.exp(r * t));
      return {
        enunciado: `Se invierte $${P} a una tasa continua del ${round2(r * 100)}% anual. ¿Cuánto habrá en ${t} años?`,
        pasos: [
          { titulo: "Modelo de interés compuesto continuo", explicacion: "A(t) = P·e^(rt), donde P es el capital inicial y r la tasa.", formula: `A(t) = ${P}·e^(${r}·t)` },
          { titulo: `Sustituir t = ${t}`, explicacion: `Evaluamos en t = ${t} años.`, formula: `A(${t}) = ${P}·e^(${r}·${t})` },
          { titulo: "Calcular el exponente", explicacion: `${r} × ${t} = ${round2(r * t)}`, formula: `A(${t}) = ${P}·e^(${round2(r * t)})` },
          { titulo: "Evaluar la exponencial", explicacion: `e^(${round2(r * t)}) ≈ ${round2(Math.exp(r * t))}`, formula: `A(${t}) = ${P} × ${round2(Math.exp(r * t))}` },
          { titulo: "Resultado", explicacion: "Multiplicamos para obtener el monto final.", formula: `A(${t}) ≈ $${A}` },
        ],
        respuesta: `A(${t}) ≈ $${A}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  LÍMITES
  // ══════════════════════════════════════════════════
  limites: {
    basico() {
      const a = rndNZ(-5,5), b = rnd(-8,8), val = rnd(-5,5);
      const res = a*val + b;
      return {
        enunciado: `Calcula: lím(x→${val}) de [${a}x ${signo(b)}]`,
        pasos: [
          { titulo: "Verificar tipo de límite", explicacion: "La función es un polinomio, por lo que el límite se puede calcular por sustitución directa.", formula: `f(x) = ${a}x ${signo(b)}   es continua en x = ${val}` },
          { titulo: "Sustitución directa", explicacion: `Reemplazamos x = ${val}.`, formula: `lím = ${a}·(${val}) ${signo(b)}` },
          { titulo: "Calcular", explicacion: `${a}·${val} = ${a*val}`, formula: `lím = ${a*val} ${signo(b)} = ${res}` },
        ],
        respuesta: `${res}`
      };
    },
    intermedio() {
      const a = rndNZ(-4,4);
      // lím x→a de (x²-a²)/(x-a) = 2a
      return {
        enunciado: `Calcula: lím(x→${a}) de [(x² − ${a*a}) / (x − ${a})]`,
        pasos: [
          { titulo: "Verificar sustitución directa", explicacion: `Si sustituimos x = ${a} directamente: numerador = 0, denominador = 0. Forma indeterminada 0/0.`, formula: `(${a}² − ${a*a}) / (${a} − ${a}) = 0/0  → indeterminado` },
          { titulo: "Factorizar el numerador", explicacion: "Usamos diferencia de cuadrados: x² − a² = (x−a)(x+a).", formula: `x² − ${a*a} = (x − ${a})(x + ${a})` },
          { titulo: "Simplificar", explicacion: `Cancelamos el factor (x − ${a}) que aparece en numerador y denominador.`, formula: `[(x − ${a})(x + ${a})] / (x − ${a}) = x + ${a}   (x ≠ ${a})` },
          { titulo: "Calcular el límite", explicacion: `Ahora sí podemos sustituir x = ${a}.`, formula: `lím(x→${a}) de (x + ${a}) = ${a} + ${a} = ${2*a}` },
        ],
        respuesta: `${2*a}`
      };
    },
    avanzado() {
      return {
        enunciado: `Calcula: lím(x→∞) de [(3x² + 2x − 1) / (5x² − 4x + 3)]`,
        pasos: [
          { titulo: "Identificar el tipo", explicacion: "Cuando x→∞ en un cociente de polinomios, comparamos los grados del numerador y denominador.", formula: `Grado numerador = 2,   Grado denominador = 2` },
          { titulo: "Dividir entre x²", explicacion: "Dividimos numerador y denominador entre x² (la potencia más alta).", formula: `[3 + 2/x − 1/x²] / [5 − 4/x + 3/x²]` },
          { titulo: "Aplicar límite", explicacion: "Cuando x→∞, los términos con x en el denominador tienden a 0.", formula: `2/x → 0,   1/x² → 0,   4/x → 0,   3/x² → 0` },
          { titulo: "Simplificar", explicacion: "Solo quedan los coeficientes del término de mayor grado.", formula: `[3 + 0 − 0] / [5 − 0 + 0] = 3/5` },
        ],
        respuesta: `3/5`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  DERIVADAS
  // ══════════════════════════════════════════════════
  derivadas: {
    basico() {
      const n = rnd(2,7), a = rndNZ(1,6);
      return {
        enunciado: `Calcula la derivada de f(x) = ${a}x^${n}`,
        pasos: [
          { titulo: "Regla de la potencia", explicacion: "La regla de la potencia establece que d/dx[xⁿ] = n·xⁿ⁻¹", formula: `d/dx[xⁿ] = n·xⁿ⁻¹` },
          { titulo: "Aplicar la regla", explicacion: `Bajamos el exponente ${n} como coeficiente y reducimos el exponente en 1.`, formula: `d/dx[${a}x^${n}] = ${a}·${n}·x^(${n}−1)` },
          { titulo: "Simplificar", explicacion: `${a} × ${n} = ${a*n}`, formula: `f'(x) = ${a*n}x^${n-1}` },
        ],
        respuesta: `f'(x) = ${a*n}x^${n-1}`
      };
    },
    intermedio() {
      const a = rndNZ(1,5), b = rndNZ(-5,5), c = rnd(-8,8);
      return {
        enunciado: `Calcula la derivada de f(x) = ${a}x² ${signo(b)}x ${signo(c)}`,
        pasos: [
          { titulo: "Regla de la suma", explicacion: "La derivada de una suma es la suma de las derivadas.", formula: `f'(x) = d/dx[${a}x²] + d/dx[${b}x] + d/dx[${c}]` },
          { titulo: "Derivar cada término", explicacion: `• d/dx[${a}x²] = ${2*a}x\n• d/dx[${b}x] = ${b}\n• d/dx[${c}] = 0  (constante)`, formula: `f'(x) = ${2*a}x ${signo(b)} + 0` },
          { titulo: "Resultado", explicacion: "Simplificamos.", formula: `f'(x) = ${2*a}x ${signo(b)}` },
        ],
        respuesta: `f'(x) = ${2*a}x ${signo(b)}`
      };
    },
    avanzado() {
      const a = rndNZ(1,5), b = rndNZ(-5,5);
      const c = rndNZ(1,5), d = rndNZ(-5,5);
      // Regla del producto: (ax+b)(cx+d)
      // f'= a(cx+d) + (ax+b)c = acx+ad + acx+bc = 2ac·x + ad+bc
      const coefX2 = 2*a*c, coefX = a*d + b*c, cte = 0;
      return {
        enunciado: `Usando la regla del producto, deriva f(x) = (${a}x ${signo(b)})(${c}x ${signo(d)})`,
        pasos: [
          { titulo: "Regla del producto", explicacion: "Si f = u·v, entonces f' = u'·v + u·v'", formula: `u = ${a}x ${signo(b)}    v = ${c}x ${signo(d)}` },
          { titulo: "Derivar cada factor", explicacion: `u' = d/dx[${a}x ${signo(b)}] = ${a}\nv' = d/dx[${c}x ${signo(d)}] = ${c}`, formula: `u' = ${a}    v' = ${c}` },
          { titulo: "Aplicar la regla", explicacion: "f'(x) = u'·v + u·v'", formula: `f'(x) = ${a}·(${c}x ${signo(d)}) + (${a}x ${signo(b)})·${c}` },
          { titulo: "Expandir", explicacion: "Distribuimos la multiplicación.", formula: `f'(x) = ${a*c}x ${signo(a*d)} + ${a*c}x ${signo(b*c)}` },
          { titulo: "Simplificar términos semejantes", explicacion: `${a*c}x + ${a*c}x = ${2*a*c}x. Constantes: ${a*d} + ${b*c} = ${a*d+b*c}.`, formula: `f'(x) = ${2*a*c}x ${signo(a*d+b*c)}` },
        ],
        respuesta: `f'(x) = ${2*a*c}x ${signo(a*d+b*c)}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  INTEGRALES
  // ══════════════════════════════════════════════════
  integrales: {
    basico() {
      const n = rnd(1,6), a = rndNZ(1,5);
      return {
        enunciado: `Calcula la integral indefinida: ∫ ${a}x^${n} dx`,
        pasos: [
          { titulo: "Regla de la potencia para integrales", explicacion: "∫ xⁿ dx = xⁿ⁺¹/(n+1) + C", formula: `∫ xⁿ dx = xⁿ⁺¹/(n+1) + C` },
          { titulo: "Aplicar al coeficiente", explicacion: `El coeficiente ${a} sale de la integral.`, formula: `${a} · ∫ x^${n} dx` },
          { titulo: "Integrar", explicacion: `Aumentamos el exponente en 1: ${n}+1 = ${n+1}. Dividimos entre el nuevo exponente.`, formula: `${a} · x^${n+1} / ${n+1} + C` },
          { titulo: "Simplificar", explicacion: `${a}/${n+1}${Number.isInteger(a/(n+1)) ? ' = '+(a/(n+1)) : ''}`, formula: `∫ ${a}x^${n} dx = ${a}/${n+1} · x^${n+1} + C` },
        ],
        respuesta: `(${a}/${n+1})x^${n+1} + C`
      };
    },
    intermedio() {
      const a = rndNZ(1,5), b = rnd(-5,5), n = rnd(2,5);
      const lo = rnd(0,3), hi = lo + rnd(1,4);
      // ∫_lo^hi (ax^n + b) dx = a·x^(n+1)/(n+1) + bx evaluado en hi-lo
      const F = (x) => a*Math.pow(x,n+1)/(n+1) + b*x;
      const res = round2(F(hi) - F(lo));
      return {
        enunciado: `Calcula la integral definida: ∫ de ${lo} a ${hi} de [${a}x^${n} ${signo(b)}] dx`,
        pasos: [
          { titulo: "Encontrar la antiderivada", explicacion: `Integramos término a término.`, formula: `F(x) = ${a}/${n+1}·x^${n+1} ${signo(b)}·x` },
          { titulo: "Evaluar en el límite superior x = " + hi, explicacion: "", formula: `F(${hi}) = ${a}/${n+1}·(${hi})^${n+1} ${signo(b)}·${hi} = ${round2(F(hi))}` },
          { titulo: "Evaluar en el límite inferior x = " + lo, explicacion: "", formula: `F(${lo}) = ${round2(F(lo))}` },
          { titulo: "Restar F(hi) − F(lo)", explicacion: "Teorema fundamental del cálculo.", formula: `${round2(F(hi))} − (${round2(F(lo))}) = ${res}` },
        ],
        respuesta: `${res}`
      };
    },
    avanzado() {
      // Sustitución u = ax + b
      const a = rnd(2,5), b = rnd(1,5), n = rnd(2,4);
      return {
        enunciado: `Calcula mediante sustitución: ∫ (${a}x ${signo(b)})^${n} dx`,
        pasos: [
          { titulo: "Elegir la sustitución", explicacion: `Hacemos u = ${a}x ${signo(b)}`, formula: `u = ${a}x ${signo(b)}` },
          { titulo: "Calcular du", explicacion: `Derivamos u respecto a x.`, formula: `du/dx = ${a}   →   dx = du/${a}` },
          { titulo: "Sustituir en la integral", explicacion: "Reemplazamos en la integral.", formula: `∫ u^${n} · du/${a} = (1/${a}) ∫ u^${n} du` },
          { titulo: "Integrar en u", explicacion: "Aplicamos la regla de la potencia.", formula: `(1/${a}) · u^${n+1}/${n+1} + C` },
          { titulo: "Regresar a x", explicacion: `Sustituimos u = ${a}x ${signo(b)} de vuelta.`, formula: `= (1/${a*(n+1)})·(${a}x ${signo(b)})^${n+1} + C` },
        ],
        respuesta: `(1/${a*(n+1)})·(${a}x ${signo(b)})^${n+1} + C`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  SERIES Y SUCESIONES
  // ══════════════════════════════════════════════════
  series: {
    basico() {
      const a1 = rnd(1,10), d = rndNZ(1,5), n = rnd(5,10);
      const an = a1 + (n-1)*d;
      const S = n*(a1+an)/2;
      return {
        enunciado: `Halla la suma de los primeros ${n} términos de la sucesión aritmética: a₁ = ${a1}, d = ${d}`,
        pasos: [
          { titulo: "Hallar el término n-ésimo", explicacion: "aₙ = a₁ + (n−1)·d", formula: `a_${n} = ${a1} + (${n}−1)·${d} = ${a1} + ${(n-1)*d} = ${an}` },
          { titulo: "Fórmula de la suma aritmética", explicacion: "Sₙ = n·(a₁ + aₙ)/2", formula: `S_${n} = ${n}·(${a1} + ${an})/2` },
          { titulo: "Calcular", explicacion: `${n}·${a1+an}/2`, formula: `S_${n} = ${n*( a1+an)}/2 = ${S}` },
        ],
        respuesta: `S_${n} = ${S}`
      };
    },
    intermedio() {
      const a1 = rnd(1,5), r = [2,3,4][rnd(0,2)], n = rnd(4,7);
      const Sn = round2(a1*(Math.pow(r,n)-1)/(r-1));
      return {
        enunciado: `Halla la suma de los primeros ${n} términos de la serie geométrica: a₁ = ${a1}, r = ${r}`,
        pasos: [
          { titulo: "Fórmula de la suma geométrica", explicacion: "Sₙ = a₁·(rⁿ − 1)/(r − 1)", formula: `S_${n} = ${a1}·(${r}^${n} − 1)/(${r} − 1)` },
          { titulo: "Calcular rⁿ", explicacion: `${r}^${n} = ${Math.pow(r,n)}`, formula: `${r}^${n} = ${Math.pow(r,n)}` },
          { titulo: "Sustituir", explicacion: "", formula: `S_${n} = ${a1}·(${Math.pow(r,n)} − 1)/(${r-1}) = ${a1}·${Math.pow(r,n)-1}/${r-1}` },
          { titulo: "Resultado", explicacion: "", formula: `S_${n} = ${Sn}` },
        ],
        respuesta: `S_${n} = ${Sn}`
      };
    },
    avanzado() {
      const a1 = rnd(1,5), r_num = 1, r_den = [2,3,4][rnd(0,2)];
      return {
        enunciado: `Calcula la suma de la serie geométrica infinita: a₁ = ${a1}, r = 1/${r_den}`,
        pasos: [
          { titulo: "Condición de convergencia", explicacion: "Una serie geométrica infinita converge si |r| < 1.", formula: `|r| = |1/${r_den}| = 1/${r_den} < 1  ✓  Converge` },
          { titulo: "Fórmula de la suma infinita", explicacion: "S∞ = a₁/(1 − r)", formula: `S∞ = ${a1} / (1 − 1/${r_den})` },
          { titulo: "Simplificar el denominador", explicacion: `1 − 1/${r_den} = ${r_den-1}/${r_den}`, formula: `S∞ = ${a1} / (${r_den-1}/${r_den})` },
          { titulo: "Dividir fracciones", explicacion: "Dividir entre una fracción es multiplicar por su recíproco.", formula: `S∞ = ${a1} × ${r_den}/${r_den-1} = ${a1*r_den}/${r_den-1}` },
        ],
        respuesta: `S∞ = ${a1*r_den}/${r_den-1} ≈ ${round2(a1*r_den/(r_den-1))}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  ECUACIONES DIFERENCIALES
  // ══════════════════════════════════════════════════
  edo: {
    basico() {
      const k = rndNZ(-4,4);
      return {
        enunciado: `Resuelve la ecuación diferencial: dy/dx = ${k}y`,
        pasos: [
          { titulo: "Identificar el tipo", explicacion: "Es una ecuación diferencial de variables separables (también lineal de primer orden).", formula: `dy/dx = ${k}y` },
          { titulo: "Separar variables", explicacion: "Dividimos y pasamos todo en términos de y a un lado y todo en términos de x al otro.", formula: `dy/y = ${k} dx` },
          { titulo: "Integrar ambos lados", explicacion: "Integramos cada lado.", formula: `∫ dy/y = ∫ ${k} dx\nln|y| = ${k}x + C₁` },
          { titulo: "Despejar y", explicacion: "Aplicamos exponencial en ambos lados.", formula: `|y| = e^(${k}x + C₁) = e^(C₁)·e^(${k}x)` },
          { titulo: "Solución general", explicacion: "Donde C es una constante arbitraria.", formula: `y = C·e^(${k}x)` },
        ],
        respuesta: `y = C·e^(${k}x)`
      };
    },
    intermedio() {
      const a = rndNZ(1,4), b = rnd(1,6);
      return {
        enunciado: `Resuelve: dy/dx + ${a}y = ${b}`,
        pasos: [
          { titulo: "Identificar la forma", explicacion: "Es una ecuación lineal de primer orden: dy/dx + P(x)y = Q(x)", formula: `P(x) = ${a},   Q(x) = ${b}` },
          { titulo: "Factor integrante", explicacion: `μ(x) = e^(∫P dx) = e^(∫${a} dx)`, formula: `μ(x) = e^(${a}x)` },
          { titulo: "Multiplicar ambos lados por μ", explicacion: "", formula: `e^(${a}x)·dy/dx + ${a}·e^(${a}x)·y = ${b}·e^(${a}x)` },
          { titulo: "Reconocer la derivada del producto", explicacion: `El lado izquierdo es d/dx[y·e^(${a}x)]`, formula: `d/dx[y·e^(${a}x)] = ${b}·e^(${a}x)` },
          { titulo: "Integrar ambos lados", explicacion: "", formula: `y·e^(${a}x) = (${b}/${a})·e^(${a}x) + C` },
          { titulo: "Solución general", explicacion: `Dividimos entre e^(${a}x).`, formula: `y = ${b}/${a} + C·e^(−${a}x)` },
        ],
        respuesta: `y = ${b}/${a} + C·e^(−${a}x)`
      };
    },
    avanzado() {
      const a = rnd(1,4), b = rnd(1,4);
      // y'' - (a+b)y' + ab·y = 0, raíces r1=a, r2=b
      const sum = a+b, prod = a*b;
      return {
        enunciado: `Resuelve la EDO de segundo orden: y'' − ${sum}y' + ${prod}y = 0`,
        pasos: [
          { titulo: "Ecuación característica", explicacion: "Proponemos y = e^(rx) y sustituimos.", formula: `r² − ${sum}r + ${prod} = 0` },
          { titulo: "Resolver la ecuación cuadrática", explicacion: "Usamos la fórmula general.", formula: `r = [${sum} ± √(${sum}² − 4·${prod})] / 2\nr = [${sum} ± √(${sum*sum-4*prod})] / 2` },
          { titulo: "Calcular las raíces", explicacion: a===b ? "Raíz doble." : "Dos raíces reales distintas.", formula: a===b ? `r₁ = r₂ = ${a}` : `r₁ = ${a},   r₂ = ${b}` },
          { titulo: "Solución general", explicacion: a===b ? "Para raíz doble la solución es:" : "Como las raíces son reales y distintas:", formula: a===b ? `y = (C₁ + C₂x)·e^(${a}x)` : `y = C₁·e^(${a}x) + C₂·e^(${b}x)` },
        ],
        respuesta: a===b ? `y = (C₁ + C₂x)·e^(${a}x)` : `y = C₁·e^(${a}x) + C₂·e^(${b}x)`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  TRANSFORMADA DE LAPLACE
  // ══════════════════════════════════════════════════
  laplace: {
    basico() {
      const a = rndNZ(1,6);
      return {
        enunciado: `Calcula la Transformada de Laplace de f(t) = e^(${a}t)`,
        pasos: [
          { titulo: "Definición de la Transformada de Laplace", explicacion: "L{f(t)} = ∫₀^∞ e^(−st)·f(t) dt", formula: `L{e^(${a}t)} = ∫₀^∞ e^(−st)·e^(${a}t) dt` },
          { titulo: "Combinar exponenciales", explicacion: "Usamos la propiedad e^A · e^B = e^(A+B).", formula: `= ∫₀^∞ e^((${a}−s)t) dt` },
          { titulo: "Evaluar la integral", explicacion: `Esta integral converge si s > ${a}.`, formula: `= [e^((${a}−s)t) / (${a}−s)]₀^∞` },
          { titulo: "Aplicar límites", explicacion: `Cuando t→∞ y s>${a}: e^((${a}−s)·∞) → 0. En t=0: e⁰ = 1.`, formula: `= 0 − 1/(${a}−s) = 1/(s−${a})` },
          { titulo: "Resultado", explicacion: `Válido para s > ${a}.`, formula: `L{e^(${a}t)} = 1/(s − ${a})` },
        ],
        respuesta: `F(s) = 1/(s − ${a}),  s > ${a}`
      };
    },
    intermedio() {
      const n = rnd(1,4);
      const fact = [1,1,2,6,24][n];
      return {
        enunciado: `Calcula la Transformada de Laplace de f(t) = t^${n}`,
        pasos: [
          { titulo: "Fórmula conocida", explicacion: `Existe una fórmula directa para potencias de t.`, formula: `L{tⁿ} = n! / s^(n+1)` },
          { titulo: `Calcular ${n}!`, explicacion: `El factorial de ${n}.`, formula: `${n}! = ${fact}` },
          { titulo: "Sustituir en la fórmula", explicacion: `n = ${n}, n! = ${fact}, potencia = s^${n+1}`, formula: `L{t^${n}} = ${fact} / s^${n+1}` },
          { titulo: "Condición de convergencia", explicacion: "La transformada existe para s > 0.", formula: `F(s) = ${fact}/s^${n+1},   s > 0` },
        ],
        respuesta: `F(s) = ${fact}/s^${n+1}`
      };
    },
    avanzado() {
      const a = rndNZ(1,5), b = rndNZ(1,5);
      return {
        enunciado: `Calcula: L{e^(${a}t)·sen(${b}t)}  usando el primer teorema de traslación`,
        pasos: [
          { titulo: "Primer teorema de traslación (desplazamiento en s)", explicacion: "Si L{f(t)} = F(s), entonces L{e^(at)·f(t)} = F(s − a)", formula: `L{e^(${a}t)·f(t)} = F(s − ${a})` },
          { titulo: "Identificar f(t)", explicacion: `En este caso f(t) = sen(${b}t)`, formula: `f(t) = sen(${b}t)` },
          { titulo: "Transformada de f(t)", explicacion: `Usamos la fórmula conocida: L{sen(bt)} = b/(s² + b²)`, formula: `L{sen(${b}t)} = ${b}/(s² + ${b*b})` },
          { titulo: "Aplicar el teorema de traslación", explicacion: `Reemplazamos s por (s − ${a}) en F(s).`, formula: `L{e^(${a}t)·sen(${b}t)} = ${b}/((s−${a})² + ${b*b})` },
          { titulo: "Condición de convergencia", explicacion: `Válido para s > ${a}`, formula: `F(s) = ${b}/((s−${a})² + ${b*b}),   s > ${a}` },
        ],
        respuesta: `F(s) = ${b}/((s−${a})² + ${b*b})`
      };
    }
  },
  // ══════════════════════════════════════════════════
  //  TRANSFORMADA DE FOURIER
  // ══════════════════════════════════════════════════
  fourier_series: {
    basico() {
      const a = rnd(1, 6);
      return {
        enunciado: `Calcula la Transformada de Fourier de f(t) = e^(−${a}|t|)`,
        pasos: [
          { titulo: "Separar la integral en dos partes", explicacion: "Por definición F(ω) = ∫₋∞^∞ f(t)·e^(−jωt) dt. Como |t| cambia de signo, separamos.", formula: `F(ω) = ∫₋∞^0 e^(${a}t)·e^(−jωt) dt  +  ∫₀^∞ e^(−${a}t)·e^(−jωt) dt` },
          { titulo: "Resolver cada integral", explicacion: `La primera converge si ${a} > Re(jω), la segunda si ${a} > 0.`, formula: `I₁ = 1/(${a} − jω)     I₂ = 1/(${a} + jω)` },
          { titulo: "Sumar los resultados", explicacion: "Sumamos las dos fracciones con denominadores conjugados.", formula: `F(ω) = 1/(${a}−jω) + 1/(${a}+jω) = 2${a}/(${a}² + ω²)` },
          { titulo: "Resultado final", explicacion: `La transformada es una función real y par.`, formula: `F(ω) = ${2*a} / (${a*a} + ω²)` },
        ],
        respuesta: `F(ω) = ${2*a} / (${a*a} + ω²)`
      };
    },
    intermedio() {
      const a = rnd(1, 5), t0 = rnd(1, 4);
      return {
        enunciado: `Usa la propiedad de desplazamiento temporal: si F{f(t)} = F(ω), ¿cuánto vale F{f(t − ${t0})}?`,
        pasos: [
          { titulo: "Propiedad de desplazamiento temporal", explicacion: "Un retardo en el tiempo equivale a multiplicar en frecuencia por un exponencial complejo.", formula: `F{f(t − t₀)} = e^(−jωt₀) · F(ω)` },
          { titulo: `Sustituir t₀ = ${t0}`, explicacion: `Reemplazamos el valor del retardo.`, formula: `F{f(t − ${t0})} = e^(−jω·${t0}) · F(ω)` },
          { titulo: "Interpretar el resultado", explicacion: `El módulo |F(ω)| no cambia; solo se modifica la fase en −${t0}ω radianes.`, formula: `|F{f(t−${t0})}| = |F(ω)|   (misma amplitud)\n∠ = ∠F(ω) − ${t0}ω   (fase desplazada)` },
          { titulo: "Conclusión", explicacion: "El desplazamiento temporal no afecta el espectro de amplitud.", formula: `F{f(t − ${t0})} = e^(−j${t0}ω) · F(ω)` },
        ],
        respuesta: `F{f(t − ${t0})} = e^(−j${t0}ω) · F(ω)`
      };
    },
    avanzado() {
      const a = rnd(1, 5), b = rnd(1, 5);
      return {
        enunciado: `Aplica el teorema de convolución: calcula F{f(t) * g(t)} si F(ω) = 1/(${a}+jω) y G(ω) = 1/(${b}+jω)`,
        pasos: [
          { titulo: "Teorema de convolución", explicacion: "La Transformada de Fourier de una convolución es el producto de las transformadas individuales.", formula: `F{f(t) * g(t)} = F(ω) · G(ω)` },
          { titulo: "Sustituir las transformadas", explicacion: "Multiplicamos F(ω) por G(ω).", formula: `F(ω)·G(ω) = 1/(${a}+jω) · 1/(${b}+jω)` },
          { titulo: "Escribir el producto", explicacion: "El resultado es una fracción de segundo orden.", formula: `H(ω) = 1 / [(${a}+jω)(${b}+jω)]` },
          { titulo: "Expandir el denominador", explicacion: `(${a}+jω)(${b}+jω) = ${a*b} + (${a+b})jω + (jω)² = ${a*b} + (${a+b})jω − ω²`, formula: `H(ω) = 1 / (${a*b} + ${a+b}·jω − ω²)` },
          { titulo: "Interpretación", explicacion: `Corresponde a un sistema de segundo orden con dos polos en s = −${a} y s = −${b}.`, formula: `Polos: jω = −${a}  y  jω = −${b}` },
        ],
        respuesta: `H(ω) = 1 / [(${a}+jω)(${b}+jω)]`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  ESTADÍSTICA I: MEDIA, MEDIANA, MODA Y FRECUENCIAS
  // ══════════════════════════════════════════════════
  estadistica: {
    basico() {
      // Media, Mediana y Moda con un conjunto impar de 7 datos y moda única
      const moda = rnd(4, 12);
      const d1 = Math.max(1, moda - rnd(2, 4));
      const d2 = moda - 1;
      const d3 = moda + 1;
      const d4 = moda + rnd(2, 4);
      const d5 = moda + rnd(5, 7);
      const base = [d1, d2, moda, moda, d3, d4, d5];
      const desordenados = [...base].sort(() => Math.random() - 0.5);
      const stats = StatsEngine.analyzeDataset(desordenados);
      const media = round2(stats.mean);
      const mediana = stats.median;
      const modaVal = stats.modes[0];

      return {
        enunciado: `Calcula la media aritmética (x̄), la mediana (Me) y la moda (Mo) del siguiente conjunto de datos (n = ${stats.n}): ${desordenados.join(", ")}`,
        numericAnswers: [media, mediana, modaVal],
        pasos: [
          {
            titulo: "1. Datos iniciales y ordenamiento",
            explicacion: `Contamos con n = ${stats.n} observaciones. Las ordenamos de menor a mayor para localizar la posición central y contar repeticiones.`,
            formula: stats.sorted.join(", ")
          },
          {
            titulo: "2. Fórmulas a utilizar",
            explicacion: "Para un conjunto con n impar, aplicamos las definiciones de tendencia central:",
            formula: `x̄ = (Σ xᵢ) / n   |   Posición Me = (n + 1) / 2   |   Mo = dato con mayor fᵢ`
          },
          {
            titulo: "3. Cálculo de la Media Aritmética (x̄)",
            explicacion: `Sumamos los ${stats.n} valores y dividimos entre n = ${stats.n}.`,
            formula: `x̄ = (${stats.sorted.join(" + ")}) / ${stats.n} = ${stats.sum} / ${stats.n} ≈ ${media}`
          },
          {
            titulo: "4. Determinación de la Mediana (Me) y la Moda (Mo)",
            explicacion: `Posición central: (${stats.n} + 1)/2 = 4.º dato ordenado. El único valor que se repite ${stats.maxFreq} veces es ${modaVal}.`,
            formula: `${stats.sorted.slice(0, 3).join(", ")}, [${mediana}], ${stats.sorted.slice(4).join(", ")}  →  Me = ${mediana}   |   Mo = ${modaVal} (f = ${stats.maxFreq})`
          },
          {
            titulo: "5. Interpretación del resultado",
            explicacion: `El centro de gravedad de los datos es ${media}, el 50% de las observaciones es menor o igual a ${mediana} y el valor más frecuente es ${modaVal}.`,
            formula: `x̄ = ${media},   Me = ${mediana},   Mo = ${modaVal}`
          }
        ],
        respuesta: `x̄ = ${media}, Me = ${mediana}, Mo = ${modaVal}`
      };
    },

    intermedio() {
      // Conjunto con número PAR de datos (n = 8) para evaluar el promedio de los dos valores centrales en la mediana
      const moda = rnd(3, 10);
      const c1 = Math.max(1, moda - rnd(2, 3));
      const c2 = moda;
      const c3 = moda + rnd(1, 2);
      const c4 = c3 + rnd(1, 2);
      const c5 = c4 + rnd(2, 4);
      // 8 datos: [c1, moda, moda, moda, c3, c3, c4, c5] -> moda aparece 3 veces, c3 aparece 2 veces
      const base = [c1, c2, c2, c2, c3, c3, c4, c5];
      const desordenados = [...base].sort(() => Math.random() - 0.5);
      const stats = StatsEngine.analyzeDataset(desordenados);
      const media = round2(stats.mean);
      const mediana = round2(stats.median);
      const modaVal = stats.modes[0];
      const m1 = stats.sorted[3];
      const m2 = stats.sorted[4];

      return {
        enunciado: `Dado el conjunto de n = 8 datos: ${desordenados.join(", ")}, calcula la media (x̄), la mediana (Me) y la moda (Mo).`,
        numericAnswers: [media, mediana, modaVal],
        pasos: [
          {
            titulo: "1. Ordenar el conjunto de datos (n = 8)",
            explicacion: "Ordenamos los 8 valores de menor a mayor para identificar los dos datos centrales (posiciones 4 y 5).",
            formula: stats.sorted.join(", ")
          },
          {
            titulo: "2. Calcular la Media Aritmética (x̄)",
            explicacion: "Sumamos todos los datos y dividimos entre n = 8.",
            formula: `x̄ = (${stats.sorted.join(" + ")}) / 8 = ${stats.sum} / 8 = ${media}`
          },
          {
            titulo: "3. Calcular la Mediana (Me) para n par",
            explicacion: `Como n = 8 es par, promediamos los datos en las posiciones n/2 = 4 y n/2 + 1 = 5 (que son ${m1} y ${m2}).`,
            formula: `Me = (${m1} + ${m2}) / 2 = ${m1 + m2} / 2 = ${mediana}`
          },
          {
            titulo: "4. Identificar la Moda (Mo) e interpretar",
            explicacion: `El valor ${modaVal} tiene la mayor frecuencia absoluta (fᵢ = ${stats.maxFreq}), por lo que la distribución es unimodal.`,
            formula: `Mo = ${modaVal} (se repite ${stats.maxFreq} veces)`
          }
        ],
        respuesta: `x̄ = ${media}, Me = ${mediana}, Mo = ${modaVal}`
      };
    },

    avanzado() {
      // Conjunto de 9 datos con un dato aberrante (extremo) para analizar media, mediana y moda (Ejemplos 1.18 y 1.19 del libro)
      const moda = rnd(18, 25);
      const d1 = moda - 3;
      const d2 = moda - 2;
      const d3 = moda - 1;
      const d4 = moda + 1;
      const d5 = moda + 2;
      const d6 = moda + 4;
      const aberrante = moda + rnd(40, 65);
      const base = [d1, d2, d3, moda, moda, d4, d5, d6, aberrante];
      const desordenados = [...base].sort(() => Math.random() - 0.5);
      const stats = StatsEngine.analyzeDataset(desordenados);
      const media = round2(stats.mean);
      const mediana = round2(stats.median);
      const modaVal = stats.modes[0];

      return {
        enunciado: `En un estudio se registraron n = 9 mediciones (incluyendo un dato aberrante): ${desordenados.join(", ")}. Calcula la media muestral (x̄), la mediana (x̃) y la moda (M).`,
        numericAnswers: [media, mediana, modaVal],
        pasos: [
          {
            titulo: "1. Ordenar los datos en forma no decreciente",
            explicacion: "Ordenamos los n = 9 valores de menor a mayor para ubicar el dato central y las repeticiones.",
            formula: stats.sorted.join(" ≤ ")
          },
          {
            titulo: "2. Calcular la Media Muestral (x̄)",
            explicacion: `Sumamos las 9 observaciones y dividimos entre n = 9. Nota cómo el valor aberrante (${aberrante}) eleva el promedio.`,
            formula: `x̄ = (${stats.sorted.join(" + ")}) / 9 = ${stats.sum} / 9 ≈ ${media}`
          },
          {
            titulo: "3. Calcular la Mediana (x̃)",
            explicacion: "Como n = 9 es impar, la mediana ocupa la posición (9 + 1) / 2 = 5, siendo insensible al valor extremo.",
            formula: `x̃ = x̃₅ = ${mediana}`
          },
          {
            titulo: "4. Determinar la Moda (M)",
            explicacion: `El valor que se presenta con mayor frecuencia (2 veces) es ${modaVal}.`,
            formula: `M = ${modaVal}`
          }
        ],
        respuesta: `x̄ = ${media}, x̃ = ${mediana}, M = ${modaVal}`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  ESTADÍSTICA II: MEDIA GEOMÉTRICA Y PONDERADA
  // ══════════════════════════════════════════════════
  medias_especiales: {
    basico() {
      // Media Ponderada (x̄_w)
      const c1 = rnd(6, 10), c2 = rnd(6, 10), c3 = rnd(5, 10);
      const w1 = 20, w2 = 30, w3 = 50;
      const res = StatsEngine.calcWeightedMean([c1, c2, c3], [w1, w2, w3]);
      const mp = round2(res.weightedMean);
      const mediaSimple = round2((c1 + c2 + c3) / 3);

      return {
        enunciado: `Calcula la Media Ponderada (x̄_w) de un curso donde Tareas (${w1}%) = ${c1}, Proyecto (${w2}%) = ${c2} y Examen Final (${w3}%) = ${c3}.`,
        numericAnswers: [mp],
        pasos: [
          {
            titulo: "1. Identificar valores (xᵢ) y pesos (wᵢ)",
            explicacion: "Cada rubro aporta una ponderación distinta a la calificación final.",
            formula: `x₁ = ${c1} (w₁ = ${w1}),   x₂ = ${c2} (w₂ = ${w2}),   x₃ = ${c3} (w₃ = ${w3})`
          },
          {
            titulo: "2. Fórmula de la Media Ponderada",
            explicacion: "Multiplicamos cada dato por su peso y dividimos entre la suma total de los pesos.",
            formula: `x̄_w = (w₁·x₁ + w₂·x₂ + w₃·x₃) / (w₁ + w₂ + w₃)`
          },
          {
            titulo: "3. Calcular los productos parciales wᵢ·xᵢ",
            explicacion: "Multiplicamos cada calificación por su porcentaje asignado.",
            formula: `${w1}×${c1} = ${res.products[0]}   |   ${w2}×${c2} = ${res.products[1]}   |   ${w3}×${c3} = ${res.products[2]}`
          },
          {
            titulo: "4. Sumar y dividir entre Σwᵢ",
            explicacion: `La suma de pesos es ${res.sumWeights}. Observa que la media simple sería ${mediaSimple}, pero el examen final tiene el 50% de peso.`,
            formula: `x̄_w = (${res.products.join(" + ")}) / ${res.sumWeights} = ${res.sumProducts} / ${res.sumWeights} = ${mp}`
          }
        ],
        respuesta: `x̄_w = ${mp}`
      };
    },

    intermedio() {
      // Media Geométrica (G) de 3 datos positivos
      const a = rnd(2, 8), b = rnd(2, 8), c = rnd(2, 8);
      const stats = StatsEngine.analyzeDataset([a, b, c]);
      const prod = a * b * c;
      const geom = round2(stats.geometricMean);
      const aritm = round2(stats.mean);

      return {
        enunciado: `Calcula la Media Geométrica (G) de los n = 3 valores positivos: ${a}, ${b}, ${c} y verifica que G ≤ x̄.`,
        numericAnswers: [geom],
        pasos: [
          {
            titulo: "1. Verificar positividad y fórmula",
            explicacion: "Todos los datos son estrictamente positivos (xᵢ > 0). Para n = 3 aplicamos la raíz cúbica del producto.",
            formula: `G = ³√(x₁ · x₂ · x₃)`
          },
          {
            titulo: "2. Multiplicar los datos",
            explicacion: `Calculamos el producto de los 3 factores.`,
            formula: `Producto = ${a} × ${b} × ${c} = ${prod}`
          },
          {
            titulo: "3. Extraer la raíz n-ésima (n = 3)",
            explicacion: `Elevamos ${prod} a la potencia 1/3.`,
            formula: `G = (${prod})^(1/3) ≈ ${geom}`
          },
          {
            titulo: "4. Comparación con la Media Aritmética (desigualdad AM-GM)",
            explicacion: `La media aritmética es x̄ ≈ ${aritm}. Se comprueba la propiedad matemática fundamental G ≤ x̄.`,
            formula: `G = ${geom}  ≤  x̄ = ${aritm} ✓`
          }
        ],
        respuesta: `G = ${geom}`
      };
    },

    avanzado() {
      // Crecimiento compuesto mediante Media Geométrica de factores de capitalización
      const r1 = rnd(4, 12), r2 = rnd(5, 18), r3 = rnd(2, 10);
      const f1 = round4(1 + r1 / 100);
      const f2 = round4(1 + r2 / 100);
      const f3 = round4(1 + r3 / 100);
      const stats = StatsEngine.analyzeDataset([f1, f2, f3]);
      const gFactor = round4(stats.geometricMean);
      const tasaMedia = round2((stats.geometricMean - 1) * 100);

      return {
        enunciado: `Una inversión registra rendimientos anuales sucesivos de +${r1}%, +${r2}% y +${r3}%. Calcula el factor geométrico promedio (G) y la tasa de crecimiento anual compuesta.`,
        numericAnswers: [tasaMedia],
        pasos: [
          {
            titulo: "1. Convertir porcentajes a factores de crecimiento (1 + rᵢ)",
            explicacion: "Para promediar tasas compuestas nunca se suman directamente los porcentajes; se convierten en factores multiplicativos.",
            formula: `f₁ = 1 + ${r1}/100 = ${f1}  |  f₂ = 1 + ${r2}/100 = ${f2}  |  f₃ = 1 + ${r3}/100 = ${f3}`
          },
          {
            titulo: "2. Aplicar la Media Geométrica a los factores",
            explicacion: "Multiplicamos los 3 factores y extraemos la raíz cúbica.",
            formula: `G = ³√(${f1} × ${f2} × ${f3}) = ³√(${round4(f1 * f2 * f3)}) ≈ ${gFactor}`
          },
          {
            titulo: "3. Obtener la tasa anual equivalente",
            explicacion: "Restamos 1 al factor geométrico y multiplicamos por 100 para expresarlo en porcentaje.",
            formula: `r̄_G = (${gFactor} − 1) × 100 ≈ ${tasaMedia}%`
          }
        ],
        respuesta: `${tasaMedia}%`
      };
    }
  },

  // ══════════════════════════════════════════════════
  //  ESTADÍSTICA III: DISPERSIÓN, VARIANZA Y DESVIACIÓN ESTÁNDAR
  // ══════════════════════════════════════════════════
  dispersion: {
    basico() {
      // Rango (R) y Desviación Media (DM) con media entera exacta (5 datos)
      const media = rnd(6, 15);
      const k1 = rnd(1, 3), k2 = rnd(3, 6);
      const base = [media - k2, media - k1, media, media + k1, media + k2];
      const desordenados = [...base].sort(() => Math.random() - 0.5);
      const stats = StatsEngine.analyzeDataset(desordenados);
      const dm = round2(stats.meanDeviation);

      return {
        enunciado: `Calcula el Rango (R) y la Desviación Media (DM) del siguiente conjunto de datos: ${desordenados.join(", ")}`,
        numericAnswers: [stats.range, dm],
        pasos: [
          {
            titulo: "1. Ordenar los datos y calcular el Rango (R)",
            explicacion: "Ordenamos de menor a mayor y restamos el mínimo al máximo.",
            formula: `Ordenados: ${stats.sorted.join(", ")}   →   R = ${stats.max} − ${stats.min} = ${stats.range}`
          },
          {
            titulo: "2. Calcular la Media Aritmética (x̄)",
            explicacion: `Sumamos los n = ${stats.n} datos y dividimos entre ${stats.n}.`,
            formula: `x̄ = (${stats.sorted.join(" + ")}) / ${stats.n} = ${stats.sum} / ${stats.n} = ${stats.mean}`
          },
          {
            titulo: "3. Calcular las desviaciones absolutas |xᵢ − x̄|",
            explicacion: `Calculamos la distancia absoluta de cada dato respecto a la media (${stats.mean}).`,
            formula: stats.sorted.map((x, idx) => `|${x} − ${stats.mean}| = ${stats.absDevs[idx]}`).join("   |   ")
          },
          {
            titulo: "4. Obtener la Desviación Media (DM)",
            explicacion: "Sumamos las desviaciones absolutas y dividimos entre n.",
            formula: `DM = (${stats.absDevs.join(" + ")}) / ${stats.n} = ${stats.sumAbsDevs} / ${stats.n} = ${dm}`
          }
        ],
        respuesta: `R = ${stats.range}, DM = ${dm}`
      };
    },

    intermedio() {
      // Varianza Poblacional (σ²) y Desviación Estándar Poblacional (σ) (dividiendo entre N)
      const media = rnd(5, 14);
      const k1 = rnd(1, 3), k2 = rnd(2, 4);
      const base = [media - k2, media - k1, media, media + k1, media + k2];
      const desordenados = [...base].sort(() => Math.random() - 0.5);
      const stats = StatsEngine.analyzeDataset(desordenados);
      const varianza = round2(stats.popVariance);
      const desvEst = round2(stats.popStdDev);

      return {
        enunciado: `Considerando los siguientes datos como una población completa (N = ${stats.n}): ${desordenados.join(", ")}, calcula la Varianza Poblacional (σ²) y la Desviación Estándar Poblacional (σ).`,
        numericAnswers: [varianza, desvEst],
        pasos: [
          {
            titulo: "1. Calcular la Media Poblacional (μ)",
            explicacion: `Sumamos los N = ${stats.n} valores y dividimos entre ${stats.n}.`,
            formula: `μ = (${stats.sorted.join(" + ")}) / ${stats.n} = ${stats.sum} / ${stats.n} = ${stats.mean}`
          },
          {
            titulo: "2. Calcular las desviaciones al cuadrado (xᵢ − μ)²",
            explicacion: `Restamos la media (${stats.mean}) a cada dato y elevamos al cuadrado.`,
            formula: stats.sorted.map((x, idx) => `(${x} − ${stats.mean})² = ${stats.sqDevs[idx]}`).join("  |  ")
          },
          {
            titulo: "3. Calcular la Varianza Poblacional (σ² = Σ(xᵢ − μ)² / N)",
            explicacion: `Al tratarse de una población completa, dividimos la suma de cuadrados (${stats.sumSqDevs}) entre N = ${stats.n}.`,
            formula: `σ² = (${stats.sqDevs.join(" + ")}) / ${stats.n} = ${stats.sumSqDevs} / ${stats.n} = ${varianza}`
          },
          {
            titulo: "4. Calcular la Desviación Estándar Poblacional (σ = √σ²)",
            explicacion: "Extraemos la raíz cuadrada para regresar a la escala original de los datos.",
            formula: `σ = √(${varianza}) ≈ ${desvEst}`
          }
        ],
        respuesta: `σ² = ${varianza}, σ = ${desvEst}`
      };
    },

    avanzado() {
      // Varianza Muestral (s²) y Desviación Estándar Muestral (s) usando Corrección de Bessel (n - 1)
      const media = rnd(6, 14);
      const k1 = rnd(1, 3), k2 = rnd(2, 5);
      const base = [media - k2, media - k1, media, media + k1, media + k2];
      const desordenados = [...base].sort(() => Math.random() - 0.5);
      const stats = StatsEngine.analyzeDataset(desordenados);
      const s2 = round2(stats.sampleVariance);
      const s = round2(stats.sampleStdDev);

      return {
        enunciado: `Se extrae una muestra aleatoria de n = ${stats.n} observaciones: ${desordenados.join(", ")}. Calcula la Varianza Muestral (s²) y la Desviación Estándar Muestral (s) aplicando la corrección de Bessel (n − 1).`,
        numericAnswers: [s2, s],
        pasos: [
          {
            titulo: "1. Calcular la Media Muestral (x̄)",
            explicacion: `Promediamos las n = ${stats.n} observaciones de la muestra.`,
            formula: `x̄ = (${stats.sorted.join(" + ")}) / ${stats.n} = ${stats.sum} / ${stats.n} = ${stats.mean}`
          },
          {
            titulo: "2. Suma de cuadrados de las desviaciones SS = Σ(xᵢ − x̄)²",
            explicacion: "Elevamos al cuadrado cada desviación respecto a la media muestral y sumamos.",
            formula: `SS = ${stats.sqDevs.join(" + ")} = ${stats.sumSqDevs}`
          },
          {
            titulo: "3. Varianza Muestral (s² = SS / (n − 1))",
            explicacion: `Como es una muestra, dividimos entre los grados de libertad n − 1 = ${stats.n} − 1 = ${stats.n - 1} (corrección de Bessel).`,
            formula: `s² = ${stats.sumSqDevs} / (${stats.n} − 1) = ${stats.sumSqDevs} / ${stats.n - 1} = ${s2}`
          },
          {
            titulo: "4. Desviación Estándar Muestral (s = √s²)",
            explicacion: `Extraemos la raíz cuadrada de la varianza muestral. Así regresamos a las unidades originales de la muestra.`,
            formula: `s = √(${s2}) ≈ ${s}`
          }
        ],
        respuesta: `s² = ${s2}, s = ${s}`
      };
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { GENERATORS, StatsEngine, rnd, rndNZ, frac, gcd, mcm, signo, fmtFrac, round2, round4 };
}


