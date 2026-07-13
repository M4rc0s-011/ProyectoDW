

"use strict";

async function iniciarSesion(email, password) {
  const res = await fetch("/api/session/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  window.location.href = "index.html";
}

async function cerrarSesion() {
  await fetch("/api/session/logout", { method: "POST" });
  window.location.href = "login.html";
}

async function protegerPagina() {
  const res = await fetch("/api/session/me");
  if (!res.ok) { window.location.href = "login.html"; return false; }
  return true;
}

function inicializarLogin() {
  const form = document.getElementById("login-form");
  if (!form) return; // no estamos en login.html
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const aviso = document.getElementById("login-error");
    try {
      await iniciarSesion(email, password);
    } catch (err) {
      aviso.textContent = err.message;
      aviso.classList.remove("d-none");
    }
  });
}

function inicializarLogout() {
  const btn = document.getElementById("btn-logout");
  if (!btn) return; // esta pagina no tiene el boton
  btn.addEventListener("click", cerrarSesion);
}

async function obtenerRegistros() {
 const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:4000/api/registros", {
     headers: { "Authorization": "Bearer " + token }
      });
      const data = await res.json();
       if (!res.ok) throw new Error(data.message);
       return data.data; // arreglo de usuarios
}
async function guardarRegistro(registro) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:4000/api/registros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(registro)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al guardar registro");
    }

    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}
async function eliminarRegistro(id) {
  if (!confirm("Seguro que quieres eliminar este registro?")) return;
  const res = await fetch("/api/registros/" + id, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  await inicializarDashboard(); // repinta la tabla y los contadores
}
async function obtenerRegistro(id) {
  const res = await fetch("/api/registros/" + id);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
}
async function actualizarRegistro(id, registro) {
  const res = await fetch("/api/registros/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registro)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const PATRON_CEDULA = /^\d{3}-?\d{7}-?\d{1}$/;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_TELEFONO = /^(809|829|849)-?\d{3}-?\d{4}$/;

const REGLAS = {
  nombre:    { requerido: true,  min: 2, patron: SOLO_LETRAS,    msgPatron: "Solo se permiten letras." },
  apellido:  { requerido: true,  min: 2, patron: SOLO_LETRAS,    msgPatron: "Solo se permiten letras." },
  cedula:    { requerido: true,          patron: PATRON_CEDULA,  msgPatron: "Formato invalido. Usa 000-0000000-0." },
  email:     { requerido: true,          patron: PATRON_EMAIL,   msgPatron: "Correo electronico invalido." },
  telefono:  { requerido: false,         patron: PATRON_TELEFONO,msgPatron: "Telefono invalido (809/829/849-000-0000)." },
  estado:    { requerido: true },
  categoria: { requerido: true }
};

function mostrarError(campo, mensaje) {
  campo.classList.add("input-error");
  campo.classList.remove("input-valido");

  const idError = "error-" + campo.id;
  let aviso = document.getElementById(idError);

  if (!aviso) {
    aviso = document.createElement("small");
    aviso.className = "error-msg";
    aviso.id = idError;
    campo.insertAdjacentElement("afterend", aviso);
  }
  aviso.textContent = mensaje;
}

function marcarValido(campo) {
  campo.classList.remove("input-error");
  campo.classList.add("input-valido");

  const aviso = document.getElementById("error-" + campo.id);
  if (aviso) aviso.remove();
}

function limpiarEstado(campo) {
  campo.classList.remove("input-error", "input-valido");
  const aviso = document.getElementById("error-" + campo.id);
  if (aviso) aviso.remove();
}


function validarCampo(campo) {
  const regla = REGLAS[campo.id];
  if (!regla) return true; // campo sin reglas: siempre valido

  const valor = campo.value.trim();

  // Campo vacio
  if (valor === "") {
    if (regla.requerido) {
      mostrarError(campo, "Este campo es obligatorio.");
      return false;
    }
    limpiarEstado(campo); // opcional y vacio: neutro
    return true;
  }

  // Longitud minima
  if (regla.min && valor.length < regla.min) {
    mostrarError(campo, "Minimo " + regla.min + " caracteres.");
    return false;
  }

  // Patron (formato)
  if (regla.patron && !regla.patron.test(valor)) {
    mostrarError(campo, regla.msgPatron);
    return false;
  }

  marcarValido(campo);
  return true;
}

/* Validacion especial de la casilla de consentimiento */
function validarConsentimiento(checkbox) {
  if (!checkbox.checked) {
    mostrarError(checkbox, "Debes aceptar los terminos para continuar.");
    return false;
  }
  const aviso = document.getElementById("error-" + checkbox.id);
  if (aviso) aviso.remove();
  checkbox.classList.remove("input-error");
  return true;
}

/* Valida que la fecha de nacimiento sea de una persona mayor de 18 anios */
function validarEdad(campoFecha) {
  const valor = campoFecha.value;
  if (valor === "") return true; // es opcional: vacio se permite

  const nacimiento = new Date(valor);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  if (edad < 18) {
    mostrarError(campoFecha, "Debes ser mayor de 18 anios.");
    return false;
  }
  marcarValido(campoFecha);
  return true;
}

function mostrarMensajeGlobal(texto, tipo) {
  const caja = document.getElementById("form-mensaje");
  if (!caja) return;

  caja.innerHTML = texto;                 // contenido dinamico
  caja.className = "form-mensaje " + tipo; // 'exito' u 'error'
  caja.hidden = false;
  caja.scrollIntoView({ behavior: "smooth", block: "center" });
}


function inicializarFormulario() {
  const formulario = document.getElementById("registroForm");
  if (!formulario) return; // no estamos en registro.html

  const idEdicion = new URLSearchParams(window.location.search).get("id");
  if (idEdicion) {
  obtenerRegistro(idEdicion).then((reg) => {
    document.getElementById("nombre").value = reg.nombre || "";
    document.getElementById("apellido").value = reg.apellido || "";
    document.getElementById("cedula").value = reg.cedula || "";
    document.getElementById("email").value = reg.email || "";
    document.getElementById("telefono").value = reg.telefono || "";
    document.getElementById("categoria").value = reg.categoria || "";
    document.getElementById("estado").value = reg.estado || "";
    });
  }
  // Campos que tienen reglas de validacion
  const camposValidables = Object.keys(REGLAS)
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  // Validacion en tiempo real: al salir del campo y mientras se escribe
  camposValidables.forEach((campo) => {
    campo.addEventListener("blur", () => validarCampo(campo));
    campo.addEventListener("input", () => {
      // Solo re-valida en vivo si ya estaba marcado con error,
      // para limpiar el aviso en cuanto se corrige.
      if (campo.classList.contains("input-error")) validarCampo(campo);
    });
    campo.addEventListener("change", () => validarCampo(campo)); // selects
  });

  // Casilla de consentimiento
  const consentimiento = document.getElementById("consentimiento");
  if (consentimiento) {
    consentimiento.addEventListener("change", () => validarConsentimiento(consentimiento));
  }

  // Contador de caracteres de Observaciones (antes era script inline)
  const observaciones = document.getElementById("observaciones");
  const contador = document.getElementById("contador");
  if (observaciones && contador) {
    const actualizarContador = () => {
      contador.textContent = 500 - observaciones.value.length;
    };
    observaciones.addEventListener("input", actualizarContador);
    actualizarContador();
  }

  // Envio del formulario
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // nunca recargar la pagina

    // Valida todos los campos y junta el resultado
    let todoValido = true;
    camposValidables.forEach((campo) => {
      if (!validarCampo(campo)) todoValido = false;
    });
    if (consentimiento && !validarConsentimiento(consentimiento)) todoValido = false;

    const fechaNac = document.getElementById("fecha_nacimiento");
    if (fechaNac && !validarEdad(fechaNac)) todoValido = false;
    if (!todoValido) {
      mostrarMensajeGlobal("Revisa los campos marcados en rojo antes de continuar.", "error");
      const primerError = formulario.querySelector(".input-error");
      if (primerError) primerError.focus();
      return;
    }
    const nuevoRegistro = {
      
      nombre: document.getElementById("nombre").value.trim(),
      apellido: document.getElementById("apellido").value.trim(),
      cedula: document.getElementById("cedula").value.trim(),
      email: document.getElementById("email").value.trim(),
      categoria: document.getElementById("categoria").value,
      estado: document.getElementById("estado").value,
      fecha: formatearFecha(new Date())
    };
  if (idEdicion) {
  await actualizarRegistro(idEdicion, nuevoRegistro);
  } else {
  await guardarRegistro(nuevoRegistro);
  }
    mostrarMensajeGlobal(
    "Registro guardado correctamente.",
    "exito"
  );

    // Limpiar formulario y estados visuales
    formulario.reset();
    camposValidables.forEach(limpiarEstado);
    if (contador) contador.textContent = "500";
  });

  // Boton "Limpiar": tambien borra los avisos de error
  formulario.addEventListener("reset", () => {
    camposValidables.forEach(limpiarEstado);
    const banner = document.getElementById("form-mensaje");
    if (banner) banner.hidden = true;
  });
}


async function inicializarDashboard() {
  const cuerpoTabla = document.getElementById("tabla-registros");
  if (!cuerpoTabla) return; // no estamos en index.html

  const registros = await obtenerRegistros();
  if (registros.length === 0) return; // sin datos: se conserva el demo

  // Construir filas (mas recientes primero)
  const filas = registros
  .slice()
  .reverse()
  .map((reg) => {
    const idFormateado = "#" + String(reg.id).padStart(4, "0");
    const nombreCompleto = escaparHtml(reg.nombre + " " + reg.apellido);
    return (
      "<tr>" +
      "<td>" + idFormateado + "</td>" +
      "<td>" + nombreCompleto + "</td>" +
      "<td>Tipo " + escaparHtml(reg.categoria) + "</td>" +
      "<td>" + reg.fecha + "</td>" +
      "<td>" + etiquetaEstado(reg.estado) + "</td>" +
      "<td>" +
        "<a class='btn btn-sm btn-outline-primary me-1' href='registro.html?id=" + reg.id
+ "'>Editar</a>" +
        "<button class='btn btn-sm btn-outline-danger btn-eliminar' data-id='" + reg.id +
"'>Eliminar</button>" +
      "</td>" +
      "</tr>"
    );
  })
  .join("");

  cuerpoTabla.innerHTML = filas; // reemplaza los datos demo por los reales
  cuerpoTabla.querySelectorAll(".btn-eliminar").forEach((btn) => {
  btn.addEventListener("click", () => eliminarRegistro(btn.dataset.id));
  });
  actualizarContadores(registros);
}

function actualizarContadores(registros) {
  const total = registros.length;
  const activos = registros.filter((r) => r.estado === "activo").length;
  const pendientes = registros.filter((r) => r.estado === "pendiente").length;
  const inactivos = registros.filter((r) => r.estado === "inactivo").length;

  fijarTexto("stat-total", total);
  fijarTexto("stat-activos", activos);
  fijarTexto("stat-pendientes", pendientes);
  fijarTexto("stat-inactivos", inactivos);
}


function fijarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor;
}

function etiquetaEstado(estado) {
  const mapa = { activo: "Activo", inactivo: "Inactivo", pendiente: "Pendiente" };
  const texto = mapa[estado] || estado;
  return '<span class="estado estado-' + estado + '">' + texto + '</span>';
}

function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return anio + "-" + mes + "-" + dia;
}

/* Evita que texto del usuario rompa el HTML al inyectarlo */
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}


document.addEventListener("DOMContentLoaded", async () => {
inicializarLogin();
// Paginas privadas: dashboard y registro
const esPrivada = document.getElementById("tabla-registros") ||
document.getElementById("registroForm");
if (esPrivada) {
const ok = await protegerPagina();
if (!ok) return; // sin sesion: ya redirigio al login
}
inicializarLogout();
inicializarFormulario();
inicializarDashboard();
});

