import { useState } from "react";
import { apiRequest } from "../services/api";

const SESSION_KEY = "mirage_session";

const copy = {
  es: {
    eyebrow: "EL ARTE DE PLANIFICAR",
    title: "Momentos que merecen ser recordados.",
    intro: "Cada gran celebración comienza con una idea. Nosotros te ayudamos a convertirla en una experiencia extraordinaria.",
    feature1: "Tus eventos, organizados en un solo lugar",
    feature2: "Planificación pensada para ti",
    feature3: "Ideas para dar vida a cada celebración",
    welcome: "Tu próximo gran momento empieza aquí.",
    subtitle: "Ingresa a tu espacio creativo.",
    registerTitle: "Crea tu cuenta",
    registerSubtitle: "Empieza a dar forma a tus mejores ideas.",
    name: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    namePlaceholder: "¿Cómo te llamas?",
    emailPlaceholder: "tu@correo.com",
    passwordPlaceholder: "Mínimo 8 caracteres",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    loading: "Un momento...",
    noAccount: "¿Aún no tienes cuenta?",
    hasAccount: "¿Ya tienes una cuenta?",
    createLink: "Crear cuenta",
    loginLink: "Iniciar sesión",
    language: "Idioma",
    footer: "Planifica con intención. Celebra sin límites.",
    missingName: "Escribe tu nombre.",
    shortPassword: "La contraseña debe tener al menos 8 caracteres.",
    exists: "Ya existe una cuenta local. Inicia sesión con ella.",
    incorrect: "Correo o contraseña incorrectos.",
    security: "Abre MIRAGE desde localhost para habilitar la seguridad.",
    failed: "No se pudo completar el acceso.",
  },
  en: {
    eyebrow: "THE ART OF PLANNING",
    title: "Moments worth remembering.",
    intro: "Every great celebration begins with an idea. We help you turn it into an extraordinary experience.",
    feature1: "All your events, organized in one place",
    feature2: "Planning designed around you",
    feature3: "Ideas that bring every celebration to life",
    welcome: "Your next great moment starts here.",
    subtitle: "Enter your creative space.",
    registerTitle: "Create your account",
    registerSubtitle: "Start bringing your best ideas to life.",
    name: "Full name",
    email: "Email address",
    password: "Password",
    namePlaceholder: "What is your name?",
    emailPlaceholder: "you@email.com",
    passwordPlaceholder: "At least 8 characters",
    login: "Sign in",
    register: "Create account",
    loading: "Please wait...",
    noAccount: "Don't have an account yet?",
    hasAccount: "Already have an account?",
    createLink: "Create account",
    loginLink: "Sign in",
    language: "Language",
    footer: "Plan with intention. Celebrate without limits.",
    missingName: "Please enter your name.",
    shortPassword: "Your password must contain at least 8 characters.",
    exists: "A local account already exists. Please sign in.",
    incorrect: "Incorrect email or password.",
    security: "Open MIRAGE from localhost to enable security.",
    failed: "We couldn't complete your request.",
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

  return (
    <main className="min-h-screen bg-[#faf7fa] text-[#332635]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#392b40] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 top-40 h-60 w-60 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[#9b779e]/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl">
              ✳
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[0.24em]">MIRAGE</p>
              <p className="text-[10px] tracking-[0.32em] text-white/60">EVENT PLANNER</p>
            </div>
          </div>

          <div className="relative my-16 max-w-xl">
            <p className="mb-6 text-xs font-semibold tracking-[0.28em] text-[#e5c6e3]">
              {t.eyebrow}
            </p>
            <h1 className="text-5xl font-light leading-[1.15] xl:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-white/70">
              {t.intro}
            </p>

            <div className="mt-10 space-y-4">
              {[t.feature1, t.feature2, t.feature3].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#e5c6e3]">
                    ✓
                  </span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs tracking-wide text-white/50">
            {t.footer}
          </p>
        </section>

        <section className={`flex min-h-screen flex-col px-5 py-6 transition-colors duration-300 sm:px-10 lg:px-14 xl:px-20 ${dark ? "bg-[#19151d] text-[#f5edf7]" : "bg-[#faf7fa] text-[#332635]"}`}>
          <header className="flex items-center justify-between lg:justify-end">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-xl text-[#89678e]">✳</span>
              <span className="font-semibold tracking-[0.2em]">MIRAGE</span>
            </div>

            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onThemeChange?.(!dark)}
              className={`rounded-full border px-3 py-2 text-sm shadow-sm ${dark ? "border-[#514454] bg-[#302634] text-white" : "border-[#e9dfe9] bg-white text-[#332635]"}`}
              aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
              title={dark ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {dark ? "☀️" : "🌙"} {dark ? "Claro" : "Oscuro"}
            </button>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm shadow-sm ${dark ? "border-[#514454] bg-[#302634] text-white" : "border-[#e9dfe9] bg-white text-[#332635]"}`}>
              <span aria-hidden="true">◎</span>
              <label htmlFor="auth-language" className="sr-only">
                {t.language}
              </label>
              <select
                id="auth-language"
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
                className={`cursor-pointer border-0 bg-transparent font-medium outline-none ${dark ? "text-white" : "text-[#332635]"}`}
                aria-label={t.language}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div className="mb-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efe5f0] text-3xl text-[#89678e]">
                ✦
              </div>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#89678e]">
                MIRAGE · YOUR CREATIVE SPACE
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {register ? t.registerTitle : t.welcome}
              </h2>
              <p className={`mt-3 text-sm leading-6 ${dark ? "text-[#c3b6c9]" : "text-[#817482]"}`}>
                {register ? t.registerSubtitle : t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {register && (
                <label className={`block text-sm font-medium ${dark ? "text-[#f5edf7]" : "text-[#332635]"}`}>
                  {t.name}
                  <input
                    className={`field mt-2 w-full !rounded-xl !px-4 !py-3.5 ${dark ? "!border-[#514454] !bg-[#302634] !text-white placeholder:!text-[#b7a9bd]" : "!border-[#e6dce7] !bg-white !text-[#332635]"}`}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder={t.namePlaceholder}
                    required
                  />
                </label>
              )}

              <label className={`block text-sm font-medium ${dark ? "text-[#f5edf7]" : "text-[#332635]"}`}>
                {t.email}
                <input
                  className={`field mt-2 w-full !rounded-xl !px-4 !py-3.5 ${dark ? "!border-[#514454] !bg-[#302634] !text-white placeholder:!text-[#b7a9bd]" : "!border-[#e6dce7] !bg-white !text-[#332635]"}`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                  required
                />
              </label>

              <label className={`block text-sm font-medium ${dark ? "text-[#f5edf7]" : "text-[#332635]"}`}>
                {t.password}
                <input
                  className={`field mt-2 w-full !rounded-xl !px-4 !py-3.5 ${dark ? "!border-[#514454] !bg-[#302634] !text-white placeholder:!text-[#b7a9bd]" : "!border-[#e6dce7] !bg-white !text-[#332635]"}`}
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
                  className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                >
                  {message}
                </p>
              )}

              <button
                className="w-full rounded-xl bg-[#89678e] px-5 py-3.5 font-semibold text-white shadow-md shadow-[#89678e]/20 transition hover:bg-[#76557b] disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={busy}
              >
                {busy ? t.loading : register ? t.register : t.login}
                {!busy && <span className="ml-2">→</span>}
              </button>
            </form>

            <div className={`mt-7 text-center text-sm ${dark ? "text-[#c3b6c9]" : "text-[#817482]"}`}>
              {register ? t.hasAccount : t.noAccount}{" "}
              <button
                type="button"
                className="font-semibold text-[#805784] underline-offset-4 hover:underline"
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

          <footer className={`pb-2 text-center text-xs ${dark ? "text-[#b7a9bd]" : "text-[#9a8d9c]"}`}>
            © {new Date().getFullYear()} MIRAGE Event Planner
          </footer>
        </section>
      </div>
    </main>
  );
}
