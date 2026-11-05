const slides = [
  {
    title: "Momentos que merecen ser recordados",
    category: "BODAS · WEDDINGS",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1500&q=85",
  },
  {
    title: "Celebra cada instante",
    category: "CELEBRACIONES",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1500&q=85",
  },
  {
    title: "Ideas que se convierten en experiencias",
    category: "EVENTOS ESPECIALES",
    image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1500&q=85",
  },
  {
    title: "Cada detalle crea una historia",
    category: "EVENTOS CORPORATIVOS",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1500&q=85",
  },
];

export default function Showcase({ language }) {
  const english = language === "en";

  return (
    <section className="mirage-showcase">
      <div className="showcase-heading">
        <div>
          <span className="showcase-eyebrow">MIRAGE · EVENT PLANNER</span>
          <h2>
            {english
              ? "Every event begins with a vision."
              : "Todo gran evento comienza con una idea."}
          </h2>
          <p>
            {english
              ? "We turn meaningful moments into unforgettable experiences."
              : "Transformamos momentos especiales en experiencias inolvidables."}
          </p>
        </div>
        <span className="showcase-sparkle">✳</span>
      </div>

      <div className="showcase-window">
        <div className="showcase-track">
          {[...slides, ...slides].map((slide, index) => (
            <article className="showcase-slide" key={`${slide.category}-${index}`}>
              <img src={slide.image} alt={slide.category} />
              <div className="showcase-overlay">
                <span>{slide.category}</span>
                <h3>{slide.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="showcase-bottom">
        <span>{english ? "CREATED WITH PURPOSE" : "CREADO CON PROPÓSITO"}</span>
        <span>✦ ───────── ✦</span>
        <span>IDEAS · DETAILS · EXPERIENCES</span>
      </div>

      <section className="founders-section">
        <div className="founders-intro">
          <span className="showcase-eyebrow">
            {english ? "THE PEOPLE BEHIND MIRAGE" : "QUIÉNES ESTÁN DETRÁS DE MIRAGE"}
          </span>
          <h2>
            {english ? "A creative vision, two specialties." : "Dos talentos, una misma visión."}
          </h2>
          <p>
            {english
              ? "Technology and sound come together to create meaningful experiences."
              : "Tecnología y sonido unidos para crear experiencias memorables."}
          </p>
        </div>

        <article className="founders-group-card">
          <div className="founders-group-photo">
            <img
              src="/images/fundadores-mirage.jpg"
              alt="Álvaro Benítez y Gabriela Benítez, fundadores de MIRAGE"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div className="founders-photo-placeholder">
              <span>✦</span>
              <strong>MIRAGE</strong>
              <small>{english ? "OUR TEAM" : "NUESTRO EQUIPO"}</small>
            </div>
          </div>

          <div className="founders-group-info">
            <div className="founder-person">
              <span>{english ? "SOUND ENGINEER" : "INGENIERO DE SONIDO"}</span>
              <h3>Álvaro Benítez</h3>
            </div>
            <div className="founder-divider">✦</div>
            <div className="founder-person">
              <span>{english ? "SOFTWARE ENGINEER" : "INGENIERA DE SOFTWARE"}</span>
              <h3>Gabriela Benítez</h3>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}
