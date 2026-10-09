import { useState } from "react";

export default function EventForm({ t, onSave, onClose, event = null }) {
  const isEditing = Boolean(event);
  const isEnglish = document.documentElement.lang === "en";

  const [name, setName] = useState(event?.name || event?.title || "");
  const [type, setType] = useState(event?.type || event?.event_type || "Celebración");
  const [date, setDate] = useState(
    event?.date ? String(event.date).slice(0, 10) :
    event?.event_date ? String(event.event_date).slice(0, 10) : ""
  );
  const [location, setLocation] = useState(event?.location || "");
  const [description, setDescription] = useState(event?.description || "");
  const [budget, setBudget] = useState(String(event?.budget ?? 0));
  const [error, setError] = useState("");

  const label = (spanish, english) => isEnglish ? english : spanish;

  function submit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !date) {
      setError(t.required || label("El nombre y la fecha son obligatorios.", "Name and date are required."));
      return;
    }

    if (name.trim().length > 160) {
      setError(label("El nombre no puede superar 160 caracteres.", "Name cannot exceed 160 characters."));
      return;
    }

    const numericBudget = Number(budget);

    if (!Number.isFinite(numericBudget) || numericBudget < 0 || budget.trim() === "") {
      setError(label("Ingresa un presupuesto válido, igual o mayor que cero.", "Enter a valid budget of zero or more."));
      return;
    }

    onSave({
      id: event?.id || Date.now(),
      name: name.trim(),
      type,
      date,
      location: location.trim(),
      description: description.trim(),
      budget: numericBudget,
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-form-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="muted text-xs uppercase tracking-[.2em]">MIRAGE ✦</p>
            <h2 id="event-form-title" className="mt-2 text-xl font-semibold">
              {isEditing
                ? label("Editar evento", "Edit event")
                : t.create}
            </h2>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            aria-label={t.close || label("Cerrar", "Close")}
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="text-sm">
            {t.name || label("Nombre del evento", "Event name")}
            <input
              className="field mt-2"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={160}
              autoFocus
              required
            />
          </label>

          <label className="text-sm">
            {t.type || label("Tipo de evento", "Event type")}
            <select
              className="field mt-2"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="Celebración">{t.celebration || label("Celebración", "Celebration")}</option>
              <option value="Boda">{t.wedding || label("Boda", "Wedding")}</option>
              <option value="Conferencia">{t.conference || label("Conferencia", "Conference")}</option>
              <option value="Fiesta">{t.party || label("Fiesta", "Party")}</option>
              <option value="Evento universitario">{t.university || label("Evento universitario", "University event")}</option>
            </select>
          </label>

          <label className="text-sm">
            {t.date || label("Fecha", "Date")}
            <input
              className="field mt-2"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            {label("Ubicación", "Location")}
            <input
              className="field mt-2"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={label("Ej. Pasto, Nariño", "e.g. Pasto, Colombia")}
              maxLength={200}
            />
          </label>

          <label className="text-sm">
            {label("Presupuesto (COP)", "Budget (COP)")}
            <input
              className="field mt-2"
              type="number"
              min="0"
              step="1000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            {label("Descripción", "Description")}
            <textarea
              className="field mt-2"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={label("¿Qué estás planeando?", "What are you planning?")}
              maxLength={2000}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="secondary-button" onClick={onClose}>
              {t.cancel || label("Cancelar", "Cancel")}
            </button>
            <button type="submit" className="primary-button">
              {isEditing
                ? label("Guardar cambios", "Save changes")
                : t.save}
              {" "}✦
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
