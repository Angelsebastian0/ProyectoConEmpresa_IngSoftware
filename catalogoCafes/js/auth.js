// js/auth.js (REEMPLAZAR por completo con este archivo)
// Base API
const API = "http://localhost:3000";

// helpers con manejo de errores
async function apiPost(path, body) {
  try {
    const resp = await fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("API error:", resp.status, data);
      return { error: data.error || `HTTP ${resp.status}` };
    }
    console.log("API success:", path, data);
    return data;
  } catch (err) {
    console.error("Network error:", err);
    return { error: "Error de red (no se pudo conectar al servidor)" };
  }
}

async function apiGet(path) {
  try {
    const resp = await fetch(API + path);
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("API GET error:", resp.status, data);
      return { error: data.error || `HTTP ${resp.status}` };
    }
    console.log("API GET success:", path, data);
    return data;
  } catch (err) {
    console.error("Network error GET:", err);
    return { error: "Error de red (no se pudo conectar al servidor)" };
  }
}

// session/local
function saveSessionLocally(user) {
  sessionStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("carrito_key", `carrito_user_${user.id}`);
}

function clearLocalSession() {
  sessionStorage.removeItem("user");
  localStorage.removeItem("carrito_key");
}

// UI
function updateUIForSession(user) {
  const btnLogout = document.getElementById("btn-logout");
  const loginBtn = document.getElementById("btn-open-auth");
  const inventarioLink = document.querySelector('a[href="inventario.html"]') || document.getElementById("link-inventario");
  const nombreDisplay = document.getElementById("user-name-display");

  if (user) {
    if (btnLogout) btnLogout.classList.remove("hidden");
    if (loginBtn) loginBtn.classList.add("hidden");
    if (inventarioLink) {
      if (user.rol === "admin") inventarioLink.classList.remove("hidden");
      else inventarioLink.classList.add("hidden");
    }
    if (nombreDisplay) { nombreDisplay.textContent = user.nombre; nombreDisplay.classList.remove("hidden"); }
  } else {
    if (btnLogout) btnLogout.classList.add("hidden");
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (inventarioLink) inventarioLink.classList.add("hidden");
    if (nombreDisplay) { nombreDisplay.textContent = ""; nombreDisplay.classList.add("hidden"); }
  }
}

// init
async function initAuth() {
  const local = sessionStorage.getItem("user");
  if (local) {
    updateUIForSession(JSON.parse(local));
    return;
  }
  const res = await apiGet("/session");
  if (res && res.session) {
    saveSessionLocally(res.session);
    updateUIForSession(res.session);
  } else {
    updateUIForSession(null);
  }
}

/* ---------- MANEJO FORMS ---------- */

// REGISTER
async function handleRegister(e) {
  e.preventDefault();
  const nombre = document.getElementById("reg-nombre")?.value?.trim();
  const correo = document.getElementById("reg-correo")?.value?.trim();
  const clave = document.getElementById("reg-clave")?.value?.trim();

  console.log("Register attempt:", { nombre, correo, clave: !!clave });

  if (!nombre || !correo || !clave) {
    alert("Completa todos los campos del registro.");
    return;
  }

  const res = await apiPost("/register", { nombre, correo, clave });
  if (res.error) {
    alert("Registro fallido: " + res.error);
    return;
  }

  alert("Registro exitoso: " + (res.mensaje || "Usuario creado"));
  // opcional: limpiar formulario
  const form = document.getElementById("panel-register");
  if (form) form.reset();
  // mostrar login
  document.getElementById("tab-login")?.click();
}

// LOGIN
async function handleLogin(e) {
  e.preventDefault();
  const correo = document.getElementById("log-correo")?.value?.trim();
  const clave = document.getElementById("log-clave")?.value?.trim();

  console.log("Login attempt:", { correo, clave: !!clave });

  if (!correo || !clave) { alert("Completa correo y contraseña."); return; }

  const res = await apiPost("/login", { correo, clave });
  if (res.error) {
    alert("Inicio de sesión fallido: " + res.error);
    return;
  }

  if (!res.usuario) {
    // algunos servidores retornan user en otra propiedad
    const usuario = res.usuario || res.usuario;
    console.warn("Respuesta sin usuario:", res);
  }

  // guardar y actualizar UI
  saveSessionLocally(res.usuario);
  updateUIForSession(res.usuario);

  // cerrar modal
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.add("hidden");

  alert("Ingreso correcto. Bienvenido " + res.usuario.nombre);
  window.location.reload();
}

// LOGOUT
async function handleLogout() {
  const res = await apiPost("/logout", {});
  console.log("Logout response:", res);
  clearLocalSession();
  updateUIForSession(null);
  window.location.reload();
}

/* ---------- WIRING UI ---------- */
function wireAuthUI() {
  // Note: same IDs as en index.html corregido
  const formReg = document.getElementById("panel-register");
  const formLog = document.getElementById("panel-login");
  const btnLogout = document.getElementById("btn-logout");
  const btnOpenAuth = document.getElementById("btn-open-auth");
  const btnOpenAuth2 = document.getElementById("btn-open-auth-2");
  const modal = document.getElementById("auth-modal");
  const closeModal = document.getElementById("auth-close");
  const tLogin = document.getElementById("tab-login");
  const tReg = document.getElementById("tab-register");

  if (formReg) formReg.addEventListener("submit", handleRegister);
  if (formLog) formLog.addEventListener("submit", handleLogin);
  if (btnLogout) btnLogout.addEventListener("click", handleLogout);
  if (btnOpenAuth) btnOpenAuth.addEventListener("click", () => modal.classList.remove("hidden"));
  if (btnOpenAuth2) btnOpenAuth2.addEventListener("click", () => modal.classList.remove("hidden"));
  if (closeModal) closeModal.addEventListener("click", () => modal.classList.add("hidden"));

  if (tLogin && tReg) {
    tLogin.addEventListener("click", () => {
      document.getElementById("panel-login").classList.remove("hidden");
      document.getElementById("panel-register").classList.add("hidden");
      tLogin.classList.add("active");
      tReg.classList.remove("active");
    });
    tReg.addEventListener("click", () => {
      document.getElementById("panel-register").classList.remove("hidden");
      document.getElementById("panel-login").classList.add("hidden");
      tReg.classList.add("active");
      tLogin.classList.remove("active");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wireAuthUI();
  initAuth();
});
