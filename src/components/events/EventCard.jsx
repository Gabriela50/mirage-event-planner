export default function EventCard({ event, t, onEdit, onDelete }) {
  const isEnglish = document.documentElement.lang === "en";

  const label = (spanish, english) => isEnglish ? english : spanish;

  const rawDate = event.date || event.event_date;
  const formattedDate = rawDate
    ? new Date(`${String(rawDate).slice(0, 10)}T12:00:00`).toLocaleDateString(
        isEnglish ? "en-US" : "es-CO",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : label("Fecha pendiente", "Date pending");

  const budget = Number(event.budget || 0).toLocaleString(
    isEnglish ? "en-US" : "es-CO"
  );

  return (
    <article className="surface event-card overflow-hidden">
      <div className="event-banner flex items-center justify-between px-5">
        <span aria-hidden="true">✦</span>
        <span className="text-xs">{event.type || event.event_type || "MIRAGE"}</span>
      </div>

      <div className="p-5">
        <h3 className="break-words text-lg font-semibold">
          {event.name || event.title}
        </h3>

        <div className="mt-4 flex flex-col gap-3 text-sm">
          <p className="muted">
            <span aria-hidden="true">▦ </span>
            {formattedDate}
          </p>

          {(event.location || "").trim() && (
            <p className="muted break-words">
              <span aria-hidden="true">⌖ </span>
              {event.location}
            </p>
          )}

          <p className="break-words">
            <span className="muted">
              {label("Presupuesto:", "Budget:")}
            </span>{" "}
            <strong>${budget} COP</strong>
          </p>

          {(event.description || "").trim() && (
            <p className="muted whitespace-pre-wrap break-words">
              {event.description}
            </p>
          )}
        </div>

        <span
          className="mt-4 inline-flex rounded-full px-3 py-1 text-xs"
          style={{ color: "var(--accent)", background: "var(--accent-soft)" }}
        >
          {t.planning}
        </span>

        <div
          className="mt-5 flex flex-wrap gap-2"
          style={{ borderTop: "1px solid var(--line)", paddingTop: "1rem" }}
        >
          <button type="button" className="secondary-button" onClick={() => onEdit(event)}>
            {label("Editar", "Edit")}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => onDelete(event)}
          >
            {label("Eliminar", "Delete")}
          </button>
        </div>
      </div>
    </article>
  );
}
