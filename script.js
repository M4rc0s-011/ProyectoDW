const nombre = document.getElementById("nombre");
const errorNombre = document.getElementById("errorNombre");

if (nombre) {
  nombre.addEventListener("input", function () {

    if (nombre.value.trim() === "") {
      errorNombre.innerHTML = "El nombre es obligatorio";
    } else if (nombre.value.length < 3) {
      errorNombre.innerHTML = "Debe tener al menos 3 caracteres";
    } else {
      errorNombre.innerHTML = "Nombre válido";
    }

  });
}

const apellido = document.getElementById("apellido");
const errorApellido = document.getElementById("errorApellido");

if (apellido) {
  apellido.addEventListener("input", function () {

    if (apellido.value.trim() === "") {
      errorApellido.innerHTML = "El apellido es obligatorio";
    } else if (apellido.value.length < 3) {
      errorApellido.innerHTML = "Debe tener al menos 3 caracteres";
    } else {
      errorApellido.innerHTML = "Apellido válido";
    }

  });
}
const email = document.getElementById("email");
const errorEmail = document.getElementById("errorEmail");

if (email) {

  email.addEventListener("input", function () {

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === "") {

      errorEmail.innerHTML = "El correo es obligatorio";
      errorEmail.classList.add("error");
      errorEmail.classList.remove("exito");

    } else if (!formatoEmail.test(email.value)) {

      errorEmail.innerHTML = "Formato de correo no válido";
      errorEmail.classList.add("error");
      errorEmail.classList.remove("exito");

    } else {

      errorEmail.innerHTML = "Correo válido";
      errorEmail.classList.add("exito");
      errorEmail.classList.remove("error");

    }

  });

}

const formulario = document.getElementById("registroForm");
const mensajeFormulario = document.getElementById("mensajeFormulario");

if (formulario) {

  formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    if (
      nombre.value.trim().length < 3 ||
      apellido.value.trim().length < 3 ||
      email.value.trim() === ""
    ) {

      mensajeFormulario.innerHTML =
        "Por favor complete correctamente todos los campos obligatorios.";

      mensajeFormulario.classList.add("error");
      mensajeFormulario.classList.remove("exito");

    } else {

      mensajeFormulario.innerHTML =
        "Registro guardado correctamente.";

      mensajeFormulario.classList.add("exito");
      mensajeFormulario.classList.remove("error");

    }

  });

}