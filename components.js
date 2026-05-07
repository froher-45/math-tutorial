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
}

function applyTheme() {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }
}

applyTheme();

// ── Cargar componentes ────────────────────────────

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
        .replace(/INDEX_URL/g,  `${base}index.html`)
        .replace(/ACERCA_URL/g, `${base}acerca.html`);

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
      sidebar.innerHTML = html;
      if (activePage) {
        sidebar.querySelectorAll("a").forEach(a => {
          if ((a.getAttribute("href") || "") === activePage + ".html")
            a.classList.add("active");
        });
      }
    })
    .catch(err => console.error("Error cargando sidebar.html:", err));
}