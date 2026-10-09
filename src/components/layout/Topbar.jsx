export default function Topbar({ t, language, setLanguage, dark, setDark, onLogout }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 sm:px-8"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
      <div>
        <p className="muted text-xs uppercase tracking-[.2em]">{t.overview}</p>
        <h1 className="mt-1 text-lg font-semibold">{t.greeting}</h1>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="mirage-language">{t.language}</label>
        <select id="mirage-language" className="field !w-auto !py-2 text-sm"
          value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
        <button className="secondary-button text-sm" type="button" onClick={() => setDark(!dark)}>
          {dark ? "☀" : "☾"} <span className="hidden sm:inline">{dark ? t.themeLight : t.themeDark}</span>
        </button>
      </div>
    </header>
  );
}
