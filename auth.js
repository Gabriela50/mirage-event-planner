
/* =====================================
   MIRAGE - AUTENTICACION Y SESIONES
   Prototipo academico local
===================================== */

const MIRAGE_USER_KEY = "mirage_user";
const MIRAGE_SESSION_KEY = "mirage_session";
const MIRAGE_HISTORY_KEY = "mirage_history";

function getMirageUser() {
  try {
    return JSON.parse(localStorage.getItem(MIRAGE_USER_KEY)) || null;
  } catch {
    return null;
  }
}

function getMirageSession() {
  try {
    return JSON.parse(localStorage.getItem(MIRAGE_SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function recordMirageActivity(action) {
  const session = getMirageSession();
  if (!session) return;

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(MIRAGE_HISTORY_KEY)) || [];
  } catch {
    history = [];
  }

  history.unshift({
    email: session.email,
    action,
    date: new Date().toISOString()
  });

  localStorage.setItem(
    MIRAGE_HISTORY_KEY,
    JSON.stringify(history.slice(0, 100))
  );
}

function startMirageSession(user) {
  const session = {
    name: user.name,
    email: user.email,
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(MIRAGE_SESSION_KEY, JSON.stringify(session));
  recordMirageActivity("Inicio de sesión");
}

function logoutMirage() {
  recordMirageActivity("Cierre de sesión");
  localStorage.removeItem(MIRAGE_SESSION_KEY);
  window.location.reload();
}

/* La contraseña se guarda como hash, no como texto legible. */
async function hashMiragePassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    key,
    256
  );

  return Array.from(new Uint8Array(bits))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

/* =====================================
   FORMULARIO DE ACCESO
===================================== */

const authScreen = document.getElementById("authScreen");
const authForm = document.getElementById("authForm");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");
const authSwitch = document.getElementById("authSwitch");
const authSwitchText = document.getElementById("authSwitchText");

let mirageRegisterMode = false;

function setMirageAuthMode(registerMode) {
  mirageRegisterMode = registerMode;

  authTitle.textContent = registerMode
    ? "Crea tu cuenta"
    : "Bienvenida a MIRAGE";

  authDescription.textContent = registerMode
    ? "Comienza a organizar momentos extraordinarios."
    : "Organiza momentos extraordinarios.";

  authName.parentElement.style.display = registerMode ? "flex" : "none";
  authName.required = registerMode;

  authPassword.autocomplete = registerMode
    ? "new-password"
    : "current-password";

  authSubmit.textContent = registerMode
    ? "Crear cuenta"
    : "Iniciar sesión";

  authSwitchText.textContent = registerMode
    ? "¿Ya tienes cuenta?"
    : "¿Aún no tienes cuenta?";

  authSwitch.textContent = registerMode
    ? "Iniciar sesión"
    : "Crear cuenta";

  authMessage.textContent = "";
  authPassword.value = "";
}

authSwitch.addEventListener("click", () => {
  setMirageAuthMode(!mirageRegisterMode);
});

authForm.addEventListener("submit", async event => {
  event.preventDefault();
  authMessage.textContent = "";
  authSubmit.disabled = true;

  try {
    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value;

    if (!crypto.subtle) {
      throw new Error(
        "La seguridad del navegador no está disponible. Abre MIRAGE desde localhost."
      );
    }

    if (mirageRegisterMode) {
      const name = authName.value.trim();

      if (!name) {
        throw new Error("Escribe tu nombre.");
      }

      if (getMirageUser()) {
        throw new Error(
          "Ya existe una cuenta local. Inicia sesión con ella."
        );
      }

      const salt = crypto.randomUUID();
      const passwordHash = await hashMiragePassword(password, salt);

      const user = { name, email, salt, passwordHash };
      localStorage.setItem(MIRAGE_USER_KEY, JSON.stringify(user));

      startMirageSession(user);
      authScreen.style.display = "none";
      setMirageAuthMode(false);
      alert("¡Cuenta creada correctamente! Bienvenida a MIRAGE.");
    } else {
      const user = getMirageUser();

      if (
        !user ||
        user.email !== email
      ) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      const passwordHash = await hashMiragePassword(
        password,
        user.salt
      );

      if (passwordHash !== user.passwordHash) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      startMirageSession(user);
      authScreen.style.display = "none";
      setMirageAuthMode(false);
      recordMirageActivity("Acceso al panel principal");
    }
  } catch (error) {
    authMessage.textContent =
      error.message || "No se pudo completar el acceso.";
  } finally {
    authSubmit.disabled = false;
  }
});

/* Restaurar la sesión al recargar la página. */
const currentMirageSession = getMirageSession();

if (currentMirageSession) {
  authScreen.style.display = "none";
} else {
  setMirageAuthMode(false);
}
