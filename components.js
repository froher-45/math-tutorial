// =====================================================
//  components.js
//  Carga header.html y sidebar.html en la página
//  Uso: loadComponents("funciones")
// =====================================================

// ── Modo claro/oscuro ─────────────────────────────

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-mode");
  const icon    = document.querySelector("#theme-btn .material-symbols-rounded");
  if (icon) icon.textContent = isLight ? "dark_mode" : "light_mode";
  localStorage.setItem("theme", isLight ? "light" : "dark");
  window.dispatchEvent(new CustomEvent("themechange"));
}

function applyTheme() {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");

    const icon = document.querySelector("#theme-btn .material-symbols-rounded");
    if (icon) icon.textContent = "dark_mode";
  }
}

applyTheme();

// ── Cargar componentes ────────────────────────────

const PAGE_FILE_ALIAS = {
  ecuacionesDiferenciales: "diferenciales.html",
  integrales: "integral.html"
};

function loadComponents(activePage) {
  const enTutorial = window.location.pathname.includes("/tutoriales/");
  const base       = enTutorial ? "../" : "";

  // Cargar header
  fetch(`${base}utilidades/header.html`)
    .then(r => r.text())
    .then(html => {
      const header = document.querySelector("header");
      if (!header) return;
      header.innerHTML = html
        .replace(/INDEX_URL/g,     `${base}index.html`)
        .replace(/GENERADOR_URL/g, `${base}generador.html`)
        .replace(/ACERCA_URL/g,    `${base}acerca.html`);

      // Actualizar ícono según tema actual
      const icon = document.querySelector("#theme-btn .material-symbols-rounded");
      if (icon && document.body.classList.contains("light-mode")) {
        icon.textContent = "dark_mode";
      }
    })
    .catch(err => console.error("Error cargando header.html:", err));

  // Cargar sidebar
  const sidebar = document.getElementById("menu-lateral");
  if (!sidebar) return;

  fetch(`${base}utilidades/sidebar.html`)
    .then(r => r.text())
    .then(html => {
      // Ajustar rutas relativas si estamos en la raíz (ej. generador.html)
      sidebar.innerHTML = enTutorial ? html : html.replace(/\.\.\//g, "");

      const paginaActual = window.location.pathname.split("/").pop() || "index.html";
      const targetFile = PAGE_FILE_ALIAS[activePage] || (activePage ? `${activePage}.html` : paginaActual);

      sidebar.querySelectorAll("a").forEach(a => {
        const hrefFile = (a.getAttribute("href") || "").split("/").pop();
        if (hrefFile === paginaActual || hrefFile === targetFile) {
          a.classList.add("active");
        } else {
          a.classList.remove("active");
        }
      });
    })
    .catch(err => console.error("Error cargando sidebar.html:", err));
}