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
function round2(n) { return Math.round(n * 100) / 100; }

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
      const c   = b * sol + rnd(-5, 5);
      const d   = rnd(-5, 5);
      // bx + d = c  → x = (c - d) / b
      const lhs = d, rhs = b * sol + d;
      return {
        enunciado: `Resuelve la ecuación: ${b}x ${signo(d)} = ${rhs}`,
        pasos: [
          { titulo: "Despejar el término con x", explicacion: `Pasamos ${d > 0 ? '+' : ''}${d} al otro lado cambiando de signo.`, formula: `${b}x = ${rhs} ${signo(-d)}` },
          { titulo: "Simplificar el lado derecho", explicacion: `${rhs} ${d >= 0 ? '−' : '+'} ${Math.abs(d)} = ${sol * b}`, formula: `${b}x = ${sol * b}` },
          { titulo: "Dividir entre el coeficiente de x", explicacion: `Dividimos ambos lados entre ${b}.`, formula: `x = ${sol * b} ÷ ${b} = ${sol}` },
          { titulo: "Verificación", explicacion: `Sustituimos x = ${sol} en la ecuación original.`, formula: `${b}·(${sol}) ${signo(d)} = ${b * sol + d} = ${rhs} ✓` },
        ],
        respuesta: `x = ${sol}`
      };
    },
    intermedio() {
      const sol = rnd(-8, 8);
      const a = rndNZ(1, 6), b = rnd(-10, 10);
      const c = rndNZ(1, 6), d = rnd(-10, 10);
      // ax + b = cx + d  → x = (d - b) / (a - c)
      const rhs = c * sol + d;
      const lhs_n = a * sol + b;
      if (a === c) return GENERATORS.ecuaciones.intermedio();
      const num = d - b, den = a - c;
      const xval = num / den;
      if (!Number.isInteger(xval)) return GENERATORS.ecuaciones.intermedio();
      return {
        enunciado: `Resuelve: ${a}x ${signo(b)} = ${c}x ${signo(d)}`,
        pasos: [
          { titulo: "Agrupar términos con x", explicacion: "Pasamos todos los términos con x al lado izquierdo.", formula: `${a}x − ${c}x = ${d} ${signo(-b)}` },
          { titulo: "Simplificar cada lado", explicacion: `${a}x − ${c}x = ${a - c}x. En el lado derecho: ${d} ${signo(-b)} = ${d - b}.`, formula: `${a - c}x = ${d - b}` },
          { titulo: "Despejar x", explicacion: `Dividimos entre ${a - c}.`, formula: `x = ${d - b} ÷ ${a - c} = ${xval}` },
          { titulo: "Verificación", explicacion: "Comprobamos con la ecuación original.", formula: `${a}·(${xval}) ${signo(b)} = ${a * xval + b}    |    ${c}·(${xval}) ${signo(d)} = ${c * xval + d} ✓` },
        ],
        respuesta: `x = ${xval}`
      };
    },
    avanzado() {
      // Ecuación cuadrática: ax² + bx + c = 0 con soluciones enteras
      const r1 = rnd(-6, 6), r2 = rnd(-6, 6);
      const A = 1, B = -(r1 + r2), C = r1 * r2;
      const disc = B * B - 4 * A * C;
      return {
        enunciado: `Resuelve la ecuación cuadrática: x² ${signo(B)}x ${signo(C)} = 0`,
        pasos: [
          { titulo: "Identificar coeficientes", explicacion: "Ecuación de la forma ax² + bx + c = 0.", formula: `a = 1,   b = ${B},   c = ${C}` },
          { titulo: "Calcular el discriminante", explicacion: "Δ = b² − 4ac", formula: `Δ = (${B})² − 4·(1)·(${C}) = ${B * B} − ${4 * C} = ${disc}` },
          { titulo: "Aplicar la fórmula general", explicacion: `x = (−b ± √Δ) / 2a`, formula: `x = (−(${B}) ± √${disc}) / 2\nx = (${-B} ± ${Math.sqrt(disc)}) / 2` },
          { titulo: "Calcular las dos soluciones", explicacion: "Tomamos una vez el signo + y otra el signo −.", formula: `x₁ = (${-B} + ${Math.sqrt(disc)}) / 2 = ${r1}\nx₂ = (${-B} − ${Math.sqrt(disc)}) / 2 = ${r2}` },
          { titulo: "Verificación por factorización", explicacion: "Podemos expresar la ecuación como producto de factores.", formula: `(x − ${r1})(x − ${r2}) = 0` },
        ],
        respuesta: `x₁ = ${r1},   x₂ = ${r2}`
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
        enunciado: `Suma los polinomios: P(x) = ${a}x + ${b}   y   Q(x) = ${c}x + ${d}`,
        pasos: [
          { titulo: "Identificar términos semejantes", explicacion: "Agrupamos los términos del mismo grado.", formula: `(${a}x + ${c}x) + (${b} + ${d})` },
          { titulo: "Sumar coeficientes de x", explicacion: `${a} + ${c} = ${r0}`, formula: `${r0}x` },
          { titulo: "Sumar términos independientes", explicacion: `${b} + ${d} = ${r1}`, formula: `${r1}` },
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
          { titulo: "Agrupar por grado", explicacion: "Sumamos coeficientes del mismo grado.", formula: `(${a}+${d})x² + (${b}+${e})x + (${c}+${f})` },
          { titulo: "Calcular cada grupo", explicacion: `Grado 2: ${a}+${d}=${r2} | Grado 1: ${b}+${e}=${r1} | Grado 0: ${c}+${f}=${r0}`, formula: `${r2}x² ${signo(r1)}x ${signo(r0)}` },
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
          { titulo: "Factor integrante", explicacion: "μ(x) = e^(∫P dx) = e^(∫${a} dx)", formula: `μ(x) = e^(${a}x)` },
          { titulo: "Multiplicar ambos lados por μ", explicacion: "", formula: `e^(${a}x)·dy/dx + ${a}·e^(${a}x)·y = ${b}·e^(${a}x)` },
          { titulo: "Reconocer la derivada del producto", explicacion: "El lado izquierdo es d/dx[y·e^(${a}x)]", formula: `d/dx[y·e^(${a}x)] = ${b}·e^(${a}x)` },
          { titulo: "Integrar ambos lados", explicacion: "", formula: `y·e^(${a}x) = (${b}/${a})·e^(${a}x) + C` },
          { titulo: "Solución general", explicacion: "Dividimos entre e^(${a}x).", formula: `y = ${b}/${a} + C·e^(−${a}x)` },
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
  }
};
