const items = [
  ["dashboard", "◫"],
  ["events", "◇"],
  ["guests", "♧"],
  ["budget", "◷"],
  ["assistant", "✦"],
  ["history", "↻"]
];

export default function Sidebar({ t, page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="mb-10 px-2">
        <div className="brand-mark">M</div>
        <div className="brand-name font-semibold tracking-[.22em]">{t.brand}</div>
        <div className="brand-name muted mt-1 text-[10px] tracking-[.2em]">{t.subtitle}</div>
      </div>

      <nav className="flex flex-col gap-2" aria-label="Main navigation">
        {items.map(([key, icon]) => (
          <button
            key={key}
            type="button"
            className={`nav-item ${page === key ? "active" : ""}`}
            onClick={() => onNavigate(key)}
            aria-current={page === key ? "page" : undefined}
            title={t[key]}
          >
            <span className="text-xl" aria-hidden="true">{icon}</span>
            <span className="nav-label text-sm">{t[key]}</span>
          </button>
        ))}
      </nav>

      <p className="sidebar-note muted mt-12 px-2 text-xs">Designed for meaningful moments ✦</p>
    </aside>
  );
}
