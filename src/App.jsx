import { useEffect, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import EventCard from "./components/events/EventCard";
import EventForm from "./components/events/EventForm";
import { translations } from "./i18n/translations";
import { getHistory, recordActivity } from "./services/storage";
import { apiRequest } from "./services/api";

const recommendations = [
  "Reserva una parte del presupuesto para imprevistos y confirma los proveedores con anticipación.",
  "Organiza las actividades con pequeños descansos para que los invitados disfruten cada momento.",
  "Usa iluminación cálida y una paleta de colores coherente para crear una atmósfera memorable.",
  "Confirma la asistencia de tus invitados con tiempo para ajustar el espacio y la comida."
];

export default function App() {
  const [language, setLanguageState] = useState(() => localStorage.getItem("mirage_language") || "es");
  const [dark, setDarkState] = useState(() => localStorage.getItem("mirage_theme") === "dark");

  const [session, setSession] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mirage_session") || "null");
      return saved?.token ? saved : null;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState("dashboard");
  const [events, setEvents] = useState([]);
  const [apiError, setApiError] = useState("");
  const [history, setHistory] = useState(getHistory);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [budgetEventId, setBudgetEventId] = useState("");
  const [budgetItems, setBudgetItems] = useState([]);
  const [budgetForm, setBudgetForm] = useState({
    description: "",
    category: "Decoración",
    amount: "",
  });
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);


  const t = translations[language] || translations.es;

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("mirage_language", language);
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("mirage_theme", dark ? "dark" : "light");
  }, [dark]);

  function setLanguage(value) {
    setLanguageState(value);
    record("Cambió el idioma a " + (value === "en" ? "English" : "Español"));
  }

  function setTheme(value) {
    setDarkState(value);
    record(value ? "Activó el modo oscuro" : "Activó el modo claro");
  }

  function record(action) {
    setHistory(recordActivity(action));
  }

  function logout() {
    record("Cerró sesión");
    localStorage.removeItem("mirage_session");
    setSession(null);
    setShowForm(false);
    setPage("dashboard");
  }

  async function createEvent(event) {
    setApiError("");

    const isEditing = Boolean(editingEvent);

    try {
      const result = await apiRequest(
        isEditing ? `/events/${editingEvent.id}` : "/events",
        {
          method: isEditing ? "PUT" : "POST",
          token: session.token,
          body: JSON.stringify({
            title: event.name,
            event_type: event.type,
            event_date: event.date || null,
            description: event.description || "",
            location: event.location || "",
            budget: Number(event.budget ?? 0),
          }),
        }
      );

      const savedEvent = {
        ...result.event,
        name: result.event.title,
        type: result.event.event_type,
        date: result.event.event_date,
      };

      if (isEditing) {
        setEvents(current =>
          current.map(item =>
            String(item.id) === String(savedEvent.id) ? savedEvent : item
          )
        );
        record(`Evento actualizado: ${savedEvent.name}`);
      } else {
        setEvents(current => [savedEvent, ...current]);
        record(`Evento creado: ${savedEvent.name}`);
      }

      setShowForm(false);
      setEditingEvent(null);
    } catch (error) {
      setApiError(error.message || "No se pudo guardar el evento.");
    }
  }

  function openCreateForm() {
    setApiError("");
    setEditingEvent(null);
    setShowForm(true);
  }

  function openEditForm(event) {
    setApiError("");
    setEditingEvent(event);
    setShowForm(true);
  }

  async function deleteEvent(event) {
    const isEnglish = language === "en";
    const confirmed = window.confirm(
      isEnglish
        ? `Are you sure you want to delete "${event.name || event.title}"?`
        : `¿Seguro que quieres eliminar "${event.name || event.title}"?`
    );

    if (!confirmed) return;

    setApiError("");

    try {
      await apiRequest(`/events/${event.id}`, {
        method: "DELETE",
        token: session.token,
      });

      setEvents(current =>
        current.filter(item => String(item.id) !== String(event.id))
      );
      record(`Evento eliminado: ${event.name || event.title}`);
    } catch (error) {
      setApiError(error.message || "No se pudo eliminar el evento.");
    }
  }

  useEffect(() => {
    if (!session?.token) {
      setEvents([]);
      return;
    }

    let active = true;

    apiRequest("/events", { token: session.token })
      .then(result => {
        if (!active) return;

        setEvents((result.events || []).map(event => ({
          ...event,
          name: event.title,
          type: event.event_type,
          date: event.event_date,
        })));
        setApiError("");
      })
      .catch(error => {
        if (active) {
          setApiError(error.message || "No se pudieron cargar los eventos.");
        }
      });

    return () => {
      active = false;
    };
  }, [session?.token]);

  useEffect(() => {
    if (!events.length) {
      setBudgetEventId("");
      setBudgetItems([]);
      return;
    }

    const exists = events.some(
      event => String(event.id) === String(budgetEventId)
    );

    if (!budgetEventId || !exists) {
      setBudgetEventId(String(events[0].id));
    }
  }, [events, budgetEventId]);

  useEffect(() => {
    if (page !== "budget" || !session?.token || !budgetEventId) return;

    let active = true;
    setBudgetLoading(true);
    setBudgetError("");

    apiRequest(`/budget/events/${budgetEventId}/items`, {
      token: session.token,
    })
      .then(result => {
        if (active) setBudgetItems(result.items || []);
      })
      .catch(error => {
        if (active) setBudgetError(error.message || "No se pudieron cargar los gastos.");
      })
      .finally(() => {
        if (active) setBudgetLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, session?.token, budgetEventId]);

  async function createBudgetItem(event) {
    event.preventDefault();

    if (!budgetEventId) {
      setBudgetError(language === "en" ? "Create an event first." : "Primero crea un evento.");
      return;
    }

    const description = budgetForm.description.trim();
    const amount = Number(budgetForm.amount);

    if (!description || !Number.isFinite(amount) || amount < 0) {
      setBudgetError(language === "en"
        ? "Enter a concept and a valid non-negative amount."
        : "Ingresa un concepto y un valor válido mayor o igual a cero.");
      return;
    }

    setBudgetSaving(true);
    setBudgetError("");

    try {
      const result = await apiRequest(`/budget/events/${budgetEventId}/items`, {
        method: "POST",
        token: session.token,
        body: JSON.stringify({
          description,
          category: budgetForm.category,
          amount,
        }),
      });

      setBudgetItems(current => [result.item, ...current]);
      setBudgetForm({ description: "", category: "Decoración", amount: "" });
      record(language === "en" ? "Added a budget expense" : "Registró un gasto del presupuesto");
    } catch (error) {
      setBudgetError(error.message || "No se pudo registrar el gasto.");
    } finally {
      setBudgetSaving(false);
    }
  }

  async function deleteBudgetItem(item) {
    const confirmed = window.confirm(
      language === "en"
        ? `Delete expense "${item.description}"?`
        : `¿Eliminar el gasto "${item.description}"?`
    );

    if (!confirmed) return;

    setBudgetError("");

    try {
      await apiRequest(
        `/budget/events/${budgetEventId}/items/${item.id}`,
        { method: "DELETE", token: session.token }
      );

      setBudgetItems(current =>
        current.filter(existing => String(existing.id) !== String(item.id))
      );
      record(language === "en" ? "Deleted a budget expense" : "Eliminó un gasto del presupuesto");
    } catch (error) {
      setBudgetError(error.message || "No se pudo eliminar el gasto.");
    }
  }

  function formatCOP(value) {
    return new Intl.NumberFormat(language === "en" ? "en-US" : "es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function generateRecommendation() {
    const next = recommendations[Math.floor(Math.random() * recommendations.length)];
    setRecommendation(next);
    record("Consultó las recomendaciones de MIRAGE");
  }

  function navigate(nextPage) {
    setPage(nextPage);
    record("Abrió la sección: " + (translations[language][nextPage] || nextPage));
  }

  function renderContent() {
    if (page === "history") {
      return (
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{t.history}</h2>
            <button className="secondary-button" onClick={() => setHistory(getHistory())}>{t.refresh}</button>
          </div>
          <div className="surface p-5">
            {history.length === 0 ? <p className="muted">{t.emptyHistory}</p> :
              <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
                {history.map(item => (
                  <article key={item.id} className="flex flex-wrap justify-between gap-2 py-4">
                    <span>{item.action}</span>
                    <time className="muted text-sm">
                      {new Date(item.date).toLocaleString(language === "en" ? "en-US" : "es-CO")}
                    </time>
                  </article>
                ))}
              </div>}
          </div>
        </section>
      );
    }

    if (page === "budget") {
      const selectedEvent = events.find(
        event => String(event.id) === String(budgetEventId)
      );
      const planned = Number(selectedEvent?.budget || 0);
      const spent = budgetItems.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );
      const remaining = planned - spent;

      const labels = language === "en"
        ? {
            title: "Budget management",
            subtitle: "Track expenses and see how much budget remains.",
            event: "Choose an event",
            planned: "Planned budget",
            spent: "Total expenses",
            remaining: "Remaining",
            description: "Expense concept",
            category: "Category",
            amount: "Amount (COP)",
            add: "Add expense",
            saving: "Saving...",
            empty: "No expenses registered for this event yet.",
            loading: "Loading expenses...",
            noEvents: "Create an event first to manage its budget.",
            delete: "Delete",
          }
        : {
            title: "Gestión del presupuesto",
            subtitle: "Controla los gastos y consulta cuánto dinero queda.",
            event: "Selecciona un evento",
            planned: "Presupuesto planeado",
            spent: "Total de gastos",
            remaining: "Dinero disponible",
            description: "Concepto del gasto",
            category: "Categoría",
            amount: "Valor (COP)",
            add: "Agregar gasto",
            saving: "Guardando...",
            empty: "Todavía no hay gastos registrados para este evento.",
            loading: "Cargando gastos...",
            noEvents: "Primero crea un evento para gestionar su presupuesto.",
            delete: "Eliminar",
          };

      const categories = language === "en"
        ? ["Decoration", "Food", "Venue", "Music", "Transport", "Other"]
        : ["Decoración", "Comida", "Lugar", "Música", "Transporte", "Otro"];

      return (
        <section className="space-y-6">
          <header>
            <p className="muted text-xs uppercase tracking-[.2em]">MIRAGE ✦</p>
            <h2 className="mt-2 text-2xl font-semibold">{labels.title}</h2>
            <p className="muted mt-2">{labels.subtitle}</p>
          </header>

          {budgetError && (
            <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
              {budgetError}
            </p>
          )}

          {events.length === 0 ? (
            <div className="surface p-6">
              <p className="muted">{labels.noEvents}</p>
              <button className="primary-button mt-4" onClick={openCreateForm}>
                + {t.create}
              </button>
            </div>
          ) : (
            <>
              <div className="surface p-5">
                <label className="mb-2 block text-sm font-medium" htmlFor="budget-event">
                  {labels.event}
                </label>
                <select
                  id="budget-event"
                  className="w-full rounded-xl border p-3"
                  style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--line)" }}
                  value={budgetEventId}
                  onChange={event => setBudgetEventId(event.target.value)}
                >
                  {events.map(event => (
                    <option key={event.id} value={String(event.id)}>
                      {event.name || event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="surface stat-card">
                  <p className="muted text-sm">{labels.planned}</p>
                  <p className="mt-3 break-words text-xl font-semibold">{formatCOP(planned)}</p>
                </div>
                <div className="surface stat-card">
                  <p className="muted text-sm">{labels.spent}</p>
                  <p className="mt-3 break-words text-xl font-semibold">{formatCOP(spent)}</p>
                </div>
                <div className="surface stat-card">
                  <p className="muted text-sm">{labels.remaining}</p>
                  <p className="mt-3 break-words text-xl font-semibold">{formatCOP(remaining)}</p>
                  {remaining < 0 && (
                    <p className="mt-2 text-sm text-rose-600">
                      {language === "en" ? "Over budget" : "Presupuesto excedido"}
                    </p>
                  )}
                </div>
              </div>

              <form className="surface space-y-4 p-5" onSubmit={createBudgetItem}>
                <h3 className="text-lg font-semibold">
                  {language === "en" ? "Register an expense" : "Registrar un gasto"}
                </h3>

                <div>
                  <label className="mb-2 block text-sm font-medium" htmlFor="budget-description">
                    {labels.description}
                  </label>
                  <input
                    id="budget-description"
                    className="w-full rounded-xl border p-3"
                    style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--line)" }}
                    maxLength={180}
                    required
                    value={budgetForm.description}
                    onChange={event => setBudgetForm(current => ({ ...current, description: event.target.value }))}
                    placeholder={language === "en" ? "e.g. Floral arrangements" : "Ej. Arreglos florales"}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium" htmlFor="budget-category">
                      {labels.category}
                    </label>
                    <select
                      id="budget-category"
                      className="w-full rounded-xl border p-3"
                      style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--line)" }}
                      value={budgetForm.category}
                      onChange={event => setBudgetForm(current => ({ ...current, category: event.target.value }))}
                    >
                      {categories.map((category, index) => (
                        <option
                          key={category}
                          value={language === "en"
                            ? ["Decoración", "Comida", "Lugar", "Música", "Transporte", "Otro"][index]
                            : category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium" htmlFor="budget-amount">
                      {labels.amount}
                    </label>
                    <input
                      id="budget-amount"
                      type="number"
                      min="0"
                      max="9999999999.99"
                      step="0.01"
                      required
                      className="w-full rounded-xl border p-3"
                      style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--line)" }}
                      value={budgetForm.amount}
                      onChange={event => setBudgetForm(current => ({ ...current, amount: event.target.value }))}
                      placeholder="150000"
                    />
                  </div>
                </div>

                <button className="primary-button" type="submit" disabled={budgetSaving}>
                  {budgetSaving ? labels.saving : labels.add}
                </button>
              </form>

              <section className="surface p-5">
                <h3 className="text-lg font-semibold">
                  {language === "en" ? "Registered expenses" : "Gastos registrados"}
                </h3>

                {budgetLoading ? (
                  <p className="muted mt-4">{labels.loading}</p>
                ) : budgetItems.length === 0 ? (
                  <p className="muted mt-4">{labels.empty}</p>
                ) : (
                  <div className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
                    {budgetItems.map(item => (
                      <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                          <p className="font-medium break-words">{item.description}</p>
                          <p className="muted mt-1 text-sm">
                            {item.category} · {item.created_at
                              ? new Date(item.created_at).toLocaleDateString(language === "en" ? "en-US" : "es-CO")
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{formatCOP(item.amount)}</span>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => deleteBudgetItem(item)}
                          >
                            {labels.delete}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      );
    }

    if (page === "guests") {
      return <section className="surface p-6">
        <h2 className="text-2xl font-semibold">{t.guests}</h2>
        <p className="muted mt-3">{t.guestsInfo}</p>
      </section>;
    }

    if (page === "assistant") {
      return <section className="surface p-6">
        <p className="muted text-xs uppercase tracking-[.2em]">MIRAGE ✦</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.aiTitle}</h2>
        <p className="muted mt-3">{t.aiInfo}</p>
        <button className="primary-button mt-5" onClick={generateRecommendation}>{t.getIdea}</button>
        {recommendation && <p className="mt-5 rounded-xl p-4" style={{ background: "var(--accent-soft)" }}>{recommendation}</p>}
      </section>;
    }

    return (
      <>
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="surface stat-card">
            <p className="muted text-sm">{t.total}</p>
            <p className="mt-3 text-3xl font-semibold">{events.length}</p>
          </div>

          <div className="surface stat-card">
            <p className="muted text-sm">
              {language === "en" ? "Total planned budget" : "Presupuesto total"}
            </p>
            <p className="mt-3 break-words text-2xl font-semibold">
              {new Intl.NumberFormat(language === "en" ? "en-US" : "es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(
                events.reduce((sum, event) => sum + Number(event.budget || 0), 0)
              )}
            </p>
          </div>

          <div className="surface stat-card">
            <p className="muted text-sm">{t.recent}</p>
            <p className="mt-3 text-3xl font-semibold">{history.length}</p>
          </div>
        </section>

        {apiError && (
          <p role="alert" className="mb-5 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
            {apiError}
          </p>
        )}

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="muted text-xs uppercase tracking-[.2em]">MIRAGE ✦</p>
              <h2 className="mt-2 text-2xl font-semibold">{t.upcoming}</h2>
            </div>
            <button className="primary-button" onClick={openCreateForm}>+ {t.create}</button>
          </div>

          {events.length === 0 ? (
            <div className="surface p-8 text-center">
              <div className="brand-mark">✦</div>
              <p className="muted mt-3">{t.empty}</p>
              <button className="primary-button mt-5" onClick={openCreateForm}>{t.create}</button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {events.map(event => <EventCard key={event.id} event={event} t={t} onEdit={openEditForm} onDelete={deleteEvent} />)}
            </div>
          )}
        </section>
      </>
    );
  }

  if (!session) {
    return <AuthScreen
      language={language}
      onLanguageChange={setLanguageState}
      onAuthenticated={setSession}
      dark={dark}
      onThemeChange={setTheme}
    />;
  }

  return (
    <div className={`app-shell ${dark ? "dark" : ""}`}>
      <Sidebar t={t} page={page} onNavigate={navigate} />
      <div className="main-area">
        <Topbar t={t} language={language} setLanguage={setLanguage} dark={dark} setDark={setTheme} onLogout={logout} />
        <main className="page-content">
          {renderContent()}
        </main>
      </div>
      {showForm && <EventForm t={t} event={editingEvent} onSave={createEvent} onClose={() => { setShowForm(false); setEditingEvent(null); }} />}
    </div>
  );
}
