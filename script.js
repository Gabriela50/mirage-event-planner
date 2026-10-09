const modal = document.getElementById("eventModal");


/* =========================
   MODAL NUEVO EVENTO
========================= */

function openEventModal() {

    modal.classList.add("show");

}


function closeEventModal() {

    modal.classList.remove("show");

}


/* Cerrar modal al hacer clic afuera */

modal.addEventListener("click", function(event) {

    if (event.target === modal) {
        closeEventModal();
    }

});


/* =========================
   CREAR EVENTO
========================= */

function createEvent(event) {

    event.preventDefault();

    const name = document.getElementById("eventName").value;

    const type = document.getElementById("eventType").value;

    const date = document.getElementById("eventDate").value;


    if (!name || !date) {

        alert("Completa la información del evento.");

        return;

    }


    const formattedDate = new Date(date).toLocaleDateString(
        "es-CO",
        {
            day: "numeric",
            month: "long"
        }
    );


    alert(
        `✦ Evento creado correctamente\n\n` +
        `${name}\n` +
        `${type}\n` +
        `${formattedDate}\n\n` +
        `MIRAGE comenzará a preparar recomendaciones para tu evento.`
    );


    // Guardar el evento creado en el historial
    if (typeof recordMirageActivity === "function") {
        recordMirageActivity(`Evento creado: ${name}`);
    }

    closeEventModal();


    document.getElementById("eventName").value = "";

    document.getElementById("eventDate").value = "";

}


/* =========================
   MIRAGE AI
========================= */

const insights = [

    "Para tu próximo evento recomendamos reservar aproximadamente un 20% del presupuesto para decoración y ambientación.",

    "MIRAGE recomienda confirmar a los invitados pendientes al menos 7 días antes del evento.",

    "Para mejorar la experiencia, puedes distribuir las actividades dejando pequeños espacios de descanso entre ellas.",

    "Una combinación de iluminación cálida y decoración minimalista puede crear una atmósfera elegante sin aumentar demasiado el presupuesto.",

    "Puedes organizar las mesas según los intereses de tus invitados para facilitar la interacción durante el evento."

];


function generateInsight() {
    const container = document.getElementById("aiInsight");

    if (!container) return;

    const randomIndex = Math.floor(
        Math.random() * insights.length
    );

    // Registrar la consulta en el historial
    if (typeof recordMirageActivity === "function") {
        recordMirageActivity("Consulta al asistente MIRAGE AI");
    }

    container.innerHTML = `
        <strong>✦ MIRAGE AI recomienda:</strong><br><br>
        ${insights[randomIndex]}
    `;
}


/* =========================
   NAVEGACIÓN SIDEBAR
========================= */

const navigationLinks =
    document.querySelectorAll(".sidebar-nav a");


navigationLinks.forEach(link => {

    link.addEventListener("click", function() {

        navigationLinks.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});


/* =========================
   ANIMACIÓN DE STATS
========================= */

const statNumbers =
    document.querySelectorAll(".stat-card strong");


statNumbers.forEach(number => {

    number.addEventListener("mouseenter", function() {

        this.style.color = "#a66c76";

    });


    number.addEventListener("mouseleave", function() {

        this.style.color = "";

    });

});

/* =====================================
   MIRAGE — IDIOMA Y APARIENCIA
===================================== */


(function () {
  const languageSelect = document.getElementById("mirageLanguage");
  const themeButton = document.getElementById("mirageThemeToggle");
  const themeIcon = document.getElementById("mirageThemeIcon");
  const themeText = document.getElementById("mirageThemeText");

  if (!languageSelect || !themeButton) {
    console.error("MIRAGE: no se encontraron los controles de idioma y tema.");
    return;
  }

  const words = {
    es: {
      dashboard: "Panel principal", events: "Eventos",
      guests: "Invitados", budget: "Presupuesto",
      assistant: "Asistente IA", greeting: "Buenos días, Gabriela ✦",
      myEvents: "Mis eventos", budgetTitle: "Control de presupuesto",
      create: "Crear nuevo evento", newEvent: "Nuevo evento",
      active: "EVENTOS ACTIVOS", attendees: "INVITADOS",
      used: "Presupuesto utilizado", finance: "FINANZAS",
      planning: "PLANIFICACIÓN", workspace: "ESPACIO DE TRABAJO",
      login: "Iniciar sesión", register: "Crear cuenta",
      loginTitle: "Bienvenida a MIRAGE",
      registerTitle: "Crea tu cuenta",
      loginDescription: "Organiza momentos extraordinarios.",
      registerDescription: "Comienza a organizar momentos extraordinarios.",
      name: "Nombre", email: "Correo electrónico",
      password: "Contraseña", dark: "Modo oscuro", light: "Modo claro"
    },
    en: {
      dashboard: "Dashboard", events: "Events",
      guests: "Guests", budget: "Budget",
      assistant: "AI Assistant", greeting: "Good morning, Gabriela ✦",
      myEvents: "My events", budgetTitle: "Budget control",
      create: "Create new event", newEvent: "New event",
      active: "ACTIVE EVENTS", attendees: "ATTENDEES",
      used: "Budget used", finance: "FINANCE",
      planning: "PLANNING", workspace: "WORKSPACE",
      login: "Sign in", register: "Create account",
      loginTitle: "Welcome to MIRAGE",
      registerTitle: "Create your account",
      loginDescription: "Organize extraordinary moments.",
      registerDescription: "Start organizing extraordinary moments.",
      name: "Name", email: "Email address",
      password: "Password", dark: "Dark mode", light: "Light mode"
    }
  };

  function setText(selector, es, en) {
    document.querySelectorAll(selector).forEach(el => {
      if (!el.dataset.mirageEs) el.dataset.mirageEs = es;
      if (!el.dataset.mirageEn) el.dataset.mirageEn = en;
      el.textContent = languageSelect.value === "en"
        ? el.dataset.mirageEn : el.dataset.mirageEs;
    });
  }

  function applyLanguage() {
    const lang = languageSelect.value === "en" ? "en" : "es";
    const t = words[lang];
    document.documentElement.lang = lang;
    localStorage.setItem("mirage_language", lang);

    const nav = [
      ['a[href="#dashboard"]', t.dashboard],
      ['a[href="#events"]', t.events],
      ['a[href="#guests"]', t.guests],
      ['a[href="#budget"]', t.budget],
      ['a[href="#assistant"]', t.assistant]
    ];
    nav.forEach(([selector, label]) => {
      const el = document.querySelector(selector);
      if (el) {
        if (!el.dataset.mirageLabelEs) {
          el.dataset.mirageLabelEs = el.textContent.trim();
        }
        const icon = el.querySelector("span");
        el.textContent = "";
        if (icon) el.appendChild(icon);
        el.append(" " + label);
      }
    });

    setText(".topbar h1", words.es.greeting, words.en.greeting);
    setText(".small-label", "MIRAGE WORKSPACE", "MIRAGE WORKSPACE");

    const headings = document.querySelectorAll("h2");
    headings.forEach(el => {
      const text = el.textContent.trim();
      if (text === "Mis eventos" || el.dataset.mirageHeading === "myEvents") {
        el.dataset.mirageHeading = "myEvents";
        el.textContent = t.myEvents;
      } else if (text === "Control de presupuesto" || el.dataset.mirageHeading === "budgetTitle") {
        el.dataset.mirageHeading = "budgetTitle";
        el.textContent = t.budgetTitle;
      } else if (text === "Crear nuevo evento" || text === "Create new event" || el.dataset.mirageHeading === "create") {
        el.dataset.mirageHeading = "create";
        el.textContent = t.create;
      }
    });

    document.querySelectorAll(".new-event-btn").forEach(el => {
      el.textContent = t.newEvent + " ✦";
    });

    document.querySelectorAll(".stat-card span").forEach(el => {
      const key = el.textContent.trim();
      const map = {
        "EVENTOS ACTIVOS": t.active, "ACTIVE EVENTS": t.active,
        "INVITADOS": t.attendees, "ATTENDEES": t.attendees,
        "PRESUPUESTO": t.budget.toUpperCase(),
        "IA INSIGHTS": lang === "en" ? "AI INSIGHTS" : "IA INSIGHTS"
      };
      if (map[key]) el.textContent = map[key];
    });

    const authTitle = document.getElementById("authTitle");
    const authDescription = document.getElementById("authDescription");
    const authSubmit = document.getElementById("authSubmit");
    const authSwitch = document.getElementById("authSwitch");
    const authSwitchText = document.getElementById("authSwitchText");
    const authName = document.getElementById("authName");

    if (authTitle && authSubmit) {
      const registering = !!(authName && authName.required);
      authTitle.textContent = registering ? t.registerTitle : t.loginTitle;
      if (authDescription) authDescription.textContent =
        registering ? t.registerDescription : t.loginDescription;
      authSubmit.textContent = registering ? t.register : t.login;
      if (authSwitchText) authSwitchText.textContent =
        lang === "en"
          ? (registering ? "Already have an account?" : "Don't have an account?")
          : (registering ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?");
      if (authSwitch) authSwitch.textContent = registering ? t.login : t.register;
      if (authName) authName.placeholder = lang === "en" ? "Your name" : "Tu nombre";
      const email = document.getElementById("authEmail");
      const password = document.getElementById("authPassword");
      if (email) email.placeholder = lang === "en" ? "you@email.com" : "tu@correo.com";
      if (password) password.placeholder = lang === "en" ? "At least 8 characters" : "Mínimo 8 caracteres";
    }

    applyTheme(localStorage.getItem("mirage_theme") || "light");
  }

  function applyTheme(theme) {
    const dark = theme === "dark";
    document.body.classList.toggle("dark-mode", dark);
    localStorage.setItem("mirage_theme", dark ? "dark" : "light");
    if (themeIcon) themeIcon.textContent = dark ? "☀" : "☾";
    const lang = languageSelect.value === "en" ? "en" : "es";
    if (themeText) themeText.textContent = dark ? words[lang].light : words[lang].dark;
    themeButton.setAttribute("aria-label", dark ? words[lang].light : words[lang].dark);
  }

  languageSelect.value = localStorage.getItem("mirage_language") || "es";
  languageSelect.addEventListener("change", applyLanguage);
  themeButton.addEventListener("click", function () {
    applyTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
  });

  const authSwitch = document.getElementById("authSwitch");
  if (authSwitch) {
    authSwitch.addEventListener("click", () => {
      window.setTimeout(applyLanguage, 0);
    });
  }

  applyLanguage();
})();

/* MIRAGE - Vista y navegación del historial */
(function initializeMirageHistoryView() {
  const section = document.getElementById("history");
  const list = document.getElementById("mirageHistoryList");
  const refreshButton = document.getElementById("refreshHistory");

  if (!section || !list) return;

  function renderHistory() {
    let records = [];
    try {
      records = JSON.parse(localStorage.getItem("mirage_history")) || [];
    } catch (error) {
      records = [];
    }

    list.replaceChildren();

    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "Todavía no hay actividades registradas. Inicia sesión y usa MIRAGE para comenzar.";
      list.appendChild(empty);
      return;
    }

    records.forEach(record => {
      const entry = document.createElement("article");
      entry.className = "history-entry";

      const icon = document.createElement("div");
      icon.className = "history-entry-icon";
      icon.textContent = record.action && record.action.includes("Evento creado") ? "◈" :
        record.action && record.action.includes("IA") ? "✦" : "◷";

      const details = document.createElement("div");
      details.className = "history-entry-details";

      const title = document.createElement("strong");
      title.textContent = record.action || "Actividad";

      const date = document.createElement("time");
      if (record.date && !Number.isNaN(Date.parse(record.date))) {
        date.dateTime = record.date;
        date.textContent = new Date(record.date).toLocaleString(
          document.documentElement.lang === "en" ? "en-US" : "es-CO",
          { dateStyle: "medium", timeStyle: "short" }
        );
      } else {
        date.textContent = "Fecha no disponible";
      }

      details.append(title, date);
      entry.append(icon, details);
      list.appendChild(entry);
    });
  }

  function showHistory(event) {
    if (event) event.preventDefault();
    section.classList.add("history-visible");
    const dashboard = document.getElementById("dashboard");
    if (dashboard) dashboard.style.display = "none";
    document.querySelectorAll(".content-section, .panel, .budget-section").forEach(el => {
      el.style.display = "none";
    });
    document.querySelectorAll(".sidebar-nav a").forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#history");
    });
    renderHistory();
  }

  const historyLink = document.querySelector('.sidebar-nav a[href="#history"]');
  if (historyLink) historyLink.addEventListener("click", showHistory);
  if (refreshButton) refreshButton.addEventListener("click", renderHistory);

  document.querySelectorAll('.sidebar-nav a:not([href="#history"])').forEach(link => {
    link.addEventListener("click", () => {
      section.classList.remove("history-visible");
      const dashboard = document.getElementById("dashboard");
      if (dashboard) dashboard.style.display = "";
      document.querySelectorAll(".content-section, .panel, .budget-section").forEach(el => {
        el.style.display = "";
      });
    });
  });
})();
