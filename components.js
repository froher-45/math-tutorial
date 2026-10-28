// =====================================================
//  components.js
//  Carga header, sidebar y subtemas dinámicos
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

// ── Menú móvil para la barra lateral ──────────────

function toggleMobileSidebar(forceState) {
  const sidebar = document.getElementById("menu-lateral");
  if (!sidebar) return;
  let backdrop = document.querySelector(".sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.addEventListener("click", () => toggleMobileSidebar(false));
    document.body.appendChild(backdrop);
  }
  const isOpen = typeof forceState === "boolean"
    ? sidebar.classList.toggle("open", forceState)
    : sidebar.classList.toggle("open");
  backdrop.classList.toggle("open", isOpen);
}

// ── Cargar componentes y navegación jerárquica ────

const PAGE_FILE_ALIAS = {
  ecuacionesDiferenciales: "diferenciales.html",
  integrales: "integral.html",
  tendencia_central: "estadistica.html"
};

let subtopicObserver = null;

function buildSidebarSubtopics(sidebar, activeLink) {
  // 1. Limpiar cualquier lista de subtemas previa para no contaminar entre temas
  sidebar.querySelectorAll(".sidebar-subtopics").forEach(el => el.remove());
  if (subtopicObserver) {
    subtopicObserver.disconnect();
    subtopicObserver = null;
  }

  if (!activeLink) return;

  // 2. Obtener secciones reales del contenido actual (desde .toc-list o h2[id])
  const tocAnchors = Array.from(document.querySelectorAll(".content .toc-list a[href^='#']"));
  const subtopics = [];
  const seenIds = new Set();

  if (tocAnchors.length > 0) {
    tocAnchors.forEach(a => {
      const rawHash = a.getAttribute("href") || "";
      const id = rawHash.replace(/^#/, "").trim();
      const targetEl = id ? document.getElementById(id) : null;
      if (id && targetEl && !seenIds.has(id)) {
        seenIds.add(id);
        subtopics.push({ id, label: (a.textContent || "").trim(), el: targetEl });
      }
    });
  } else {
    Array.from(document.querySelectorAll(".content h2[id]")).forEach(h2 => {
      const id = h2.id.trim();
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        subtopics.push({ id, label: (h2.textContent || "").trim(), el: h2 });
      }
    });
  }

  if (subtopics.length === 0) return;

  // 3. Crear contenedor jerárquico de subtemas debajo del tema activo
  const subContainer = document.createElement("div");
  subContainer.className = "sidebar-subtopics";
  subContainer.setAttribute("role", "navigation");
  subContainer.setAttribute("aria-label", "Subtemas de la lección");

  const subLinksMap = new Map();

  subtopics.forEach((sub, index) => {
    const subLink = document.createElement("a");
    subLink.className = "sidebar-sublink" + (index === 0 && !window.location.hash ? " active-sub" : "");
    subLink.href = `#${sub.id}`;
    subLink.textContent = sub.label;
    subLink.dataset.targetId = sub.id;

    subLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(sub.id);
      if (target) {
        history.replaceState(null, "", `#${sub.id}`);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSublink(sub.id);
        toggleMobileSidebar(false);
      }
    });

    subContainer.appendChild(subLink);
    subLinksMap.set(sub.id, subLink);
  });

  activeLink.insertAdjacentElement("afterend", subContainer);

  function setActiveSublink(activeId) {
    subLinksMap.forEach((link, id) => {
      link.classList.toggle("active-sub", id === activeId);
    });
  }

  // Si la URL ya trae un #hash válido, resaltarlo
  const currentHash = window.location.hash.replace(/^#/, "");
  if (currentHash && subLinksMap.has(currentHash)) {
    setActiveSublink(currentHash);
  }

  // 4. Sincronizar con los clics en el índice superior (.toc-list)
  tocAnchors.forEach(a => {
    a.addEventListener("click", () => {
      const id = (a.getAttribute("href") || "").replace(/^#/, "");
      if (subLinksMap.has(id)) setActiveSublink(id);
    });
  });

  // 5. Scroll-spy para resaltar automáticamente el subtema visible
  if ("IntersectionObserver" in window) {
    subtopicObserver = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSublink(visible[0].target.id);
        }
      },
      { rootMargin: "-65px 0px -65% 0px", threshold: 0 }
    );
    subtopics.forEach(sub => subtopicObserver.observe(sub.el));
  }
}

function syncHashScrollAfterMathJax() {
  if (!window.location.hash) return;
  const id = window.location.hash.replace(/^#/, "");
  const scrollToTarget = () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  };
  if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(scrollToTarget).catch(() => {});
  } else {
    window.addEventListener("load", () => {
      if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(scrollToTarget).catch(() => {});
      } else {
        scrollToTarget();
      }
    }, { once: true });
  }
}

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

      // Ocultar botón de menú móvil si la página no tiene sidebar (ej. acerca.html)
      const mobileBtn = document.getElementById("mobile-menu-btn");
      if (mobileBtn && !document.getElementById("menu-lateral")) {
        mobileBtn.style.display = "none";
      }

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

      let activeLink = null;
      sidebar.querySelectorAll("a").forEach(a => {
        const hrefFile = (a.getAttribute("href") || "").split("/").pop().split("#")[0];
        if (hrefFile === paginaActual || hrefFile === targetFile) {
          a.classList.add("active");
          activeLink = a;
        } else {
          a.classList.remove("active");
        }
      });

      // Insertar subtemas del tema activo en la barra lateral
      buildSidebarSubtopics(sidebar, activeLink);
      syncHashScrollAfterMathJax();
    })
    .catch(err => console.error("Error cargando sidebar.html:", err));
}