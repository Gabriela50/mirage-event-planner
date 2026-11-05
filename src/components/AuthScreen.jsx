import { useState } from "react";
import { apiRequest } from "../services/api";

const SESSION_KEY = "mirage_session";

const copy = {
  es: {
    brand: "EVENT PLANNER",
    eyebrow: "EL ARTE DE CELEBRAR",
    title: "Hay momentos que merecen una historia extraordinaria.",
    description: "Desde una idea íntima hasta una gran celebración, cada detalle merece cobrar vida.",
    imageCaption: "CELEBRACIONES CON PERSONALIDAD",
    imageNote: "Tu historia. Tu momento. Tu evento.",
    welcome: "Bienvenida a MIRAGE",
    subtitle: "Tu próximo gran evento comienza con una idea.",
    registerTitle: "Crea tu cuenta",
    registerSubtitle: "Empieza a imaginar todo lo que puedes celebrar.",
    name: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    namePlaceholder: "Tu nombre",
    emailPlaceholder: "tu@correo.com",
    passwordPlaceholder: "Mínimo 8 caracteres",
    login: "Iniciar sesión",
    register: "Crear mi cuenta",
    loading: "Un momento...",
    noAccount: "¿Todavía no tienes una cuenta?",
    hasAccount: "¿Ya formas parte de MIRAGE?",
    createLink: "Regístrate",
    loginLink: "Inicia sesión",
    language: "Idioma",
    themeLight: "Modo claro",
    themeDark: "Modo oscuro",
    missingName: "Escribe tu nombre.",
    shortPassword: "La contraseña debe tener al menos 8 caracteres.",
    failed: "No se pudo completar el acceso.",
    footer: "Planifica con intención. Celebra sin límites.",
  },
  en: {
    brand: "EVENT PLANNER",
    eyebrow: "THE ART OF CELEBRATING",
    title: "Some moments deserve an extraordinary story.",
    description: "From intimate ideas to grand celebrations, every detail deserves to come to life.",
    imageCaption: "CELEBRATIONS WITH PERSONALITY",
    imageNote: "Your story. Your moment. Your event.",
    welcome: "Welcome to MIRAGE",
    subtitle: "Your next great event begins with an idea.",
    registerTitle: "Create your account",
    registerSubtitle: "Start imagining everything worth celebrating.",
    name: "Full name",
    email: "Email address",
    password: "Password",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@email.com",
    passwordPlaceholder: "At least 8 characters",
    login: "Sign in",
    register: "Create my account",
    loading: "Please wait...",
    noAccount: "Don't have an account yet?",
    hasAccount: "Already part of MIRAGE?",
    createLink: "Sign up",
    loginLink: "Sign in",
    language: "Language",
    themeLight: "Light mode",
    themeDark: "Dark mode",
    missingName: "Please enter your name.",
    shortPassword: "Your password must contain at least 8 characters.",
    failed: "We couldn't complete your request.",
    footer: "Plan with intention. Celebrate without limits.",
  },
};

export default function AuthScreen({
  onAuthenticated,
  language = "es",
  onLanguageChange,
  dark = false,
  onThemeChange,
}) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const t = copy[language] || copy.es;

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (register && !name.trim()) {
        throw new Error(t.missingName);
      }

      if (password.length < 8) {
        throw new Error(t.shortPassword);
      }

      const result = await apiRequest(
        register ? "/auth/register" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            ...(register ? { name: name.trim() } : {}),
            email: normalizedEmail,
            password,
          }),
        }
      );

      const session = {
        ...result.user,
        token: result.token,
        loginAt: new Date().toISOString(),
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      onAuthenticated(session);
    } catch (error) {
      setMessage(error.message || t.failed);
    } finally {
      setBusy(false);
    }
  }

  function changeLanguage(nextLanguage) {
    onLanguageChange?.(nextLanguage);
    localStorage.setItem("mirage_language", nextLanguage);
  }

  const fieldClass = `mt-2 w-full rounded-none border-0 border-b px-0 py-3 text-sm outline-none transition focus:border-[#8b394f] focus:ring-0 ${
    dark
      ? "border-[#55434a] bg-transparent text-[#f8f0eb] placeholder:text-[#a99ba0]"
      : "border-[#ded3cb] bg-transparent text-[#342a2b] placeholder:text-[#a69a93]"
  }`;

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#211b1c] text-[#f8f0eb]" : "bg-[#f7f3ed] text-[#342a2b]"
      }`}
    >
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <aside
          className="relative flex min-h-[270px] flex-col justify-between overflow-hidden bg-cover bg-center px-7 py-7 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:px-16 lg:py-12"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(35,20,23,.12) 0%, rgba(35,20,23,.18) 40%, rgba(35,20,23,.78) 100%), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85')",
          }}
        >
          <div className="relative z-10 flex items-center gap-3">
            <span className="font-serif text-4xl italic">M.</span>
            <div>
              <p className="text-lg font-semibold tracking-[0.24em]">MIRAGE</p>
              <p className="text-[9px] tracking-[0.32em] text-white/75">
                {t.brand}
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl py-10">
            <p className="mb-5 text-[10px] font-semibold tracking-[0.3em] text-[#f0d8cf]">
              {t.eyebrow}
            </p>
            <h1 className="font-serif text-4xl font-normal leading-[1.12] sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/85 sm:text-base">
              {t.description}
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-4 border-t border-white/35 pt-5">
            <div>
              <p className="text-[9px] tracking-[0.25em] text-white/70">
                {t.imageCaption}
              </p>
              <p className="mt-2 font-serif text-lg italic">
                {t.imageNote}
              </p>
            </div>
            <span className="font-serif text-3xl italic text-white/70">01</span>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col px-6 py-6 sm:px-12 lg:px-14 xl:px-20">
          <header className="flex items-center justify-between">
            <span className="font-serif text-2xl italic lg:hidden">MIRAGE.</span>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => onThemeChange?.(!dark)}
                className="text-xs tracking-wide opacity-75 transition hover:opacity-100"
                aria-label={dark ? t.themeLight : t.themeDark}
              >
                {dark ? "☀" : "☾"}
              </button>

              <label htmlFor="auth-language" className="sr-only">
                {t.language}
              </label>
              <select
                id="auth-language"
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
                className={`border-0 bg-transparent text-xs outline-none ${
                  dark ? "text-[#f8f0eb]" : "text-[#342a2b]"
                }`}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <p className="mb-5 text-[10px] font-semibold tracking-[0.28em] text-[#a15a67]">
              MIRAGE <span className="mx-2 opacity-50">/</span>
              {register ? "REGISTRO" : "BIENVENIDA"}
            </p>

            <h2 className="font-serif text-4xl font-normal leading-tight sm:text-5xl">
              {register ? t.registerTitle : t.welcome}
            </h2>

            <p className={`mt-4 text-sm leading-7 ${
              dark ? "text-[#c6b9b5]" : "text-[#817570]"
            }`}>
              {register ? t.registerSubtitle : t.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              {register && (
                <label className="block text-xs font-medium tracking-wide">
                  {t.name}
                  <input
                    className={fieldClass}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder={t.namePlaceholder}
                    required
                  />
                </label>
              )}

              <label className="block text-xs font-medium tracking-wide">
                {t.email}
                <input
                  className={fieldClass}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                  required
                />
              </label>

              <label className="block text-xs font-medium tracking-wide">
                {t.password}
                <input
                  className={fieldClass}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={register ? "new-password" : "current-password"}
                  minLength={8}
                  placeholder={t.passwordPlaceholder}
                  required
                />
              </label>

              {message && (
                <p
                  role="alert"
                  className="border border-red-300/50 bg-red-50/10 p-3 text-sm text-red-500"
                >
                  {message}
                </p>
              )}

              <button
                className="group flex w-full items-center justify-between bg-[#783746] px-6 py-4 text-xs font-semibold tracking-[0.16em] text-white transition hover:bg-[#63303d] disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={busy}
              >
                <span>
                  {busy ? t.loading : register ? t.register : t.login}
                </span>
                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>

            <div className={`mt-8 text-sm ${
              dark ? "text-[#c6b9b5]" : "text-[#817570]"
            }`}>
              {register ? t.hasAccount : t.noAccount}{" "}
              <button
                type="button"
                className="font-semibold text-[#a15a67] underline-offset-4 hover:underline"
                onClick={() => {
                  setRegister(!register);
                  setPassword("");
                  setMessage("");
                }}
              >
                {register ? t.loginLink : t.createLink}
              </button>
            </div>
          </div>

          <footer className={`border-t pt-5 text-center text-[10px] tracking-wide ${
            dark ? "border-[#55434a] text-[#aa9b9d]" : "border-[#e5dcd4] text-[#9b8e87]"
          }`}>
            © {new Date().getFullYear()} MIRAGE · {t.footer}
          </footer>
        </section>
      </div>
    </main>
  );
}
