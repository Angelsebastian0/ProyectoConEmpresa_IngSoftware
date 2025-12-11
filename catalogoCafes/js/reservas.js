// ================================
//   SELECCIÓN DE FECHAS
// ================================
const fechaCards = document.querySelectorAll(".fecha-card");
const fechaSeleccionadaInput = document.getElementById("fechaSeleccionada");

fechaCards.forEach(card => {
    if (card.classList.contains("no-disponible")) return;

    card.addEventListener("click", () => {
        fechaCards.forEach(c => c.classList.remove("seleccionada"));
        card.classList.add("seleccionada");

        fechaSeleccionadaInput.value = card.dataset.fecha;
    });
});

// ================================
//   FORMULARIO Y CONFIRMACIÓN
// ================================
const formulario = document.getElementById("reservaForm");

const mensajeExito = document.getElementById("mensaje-exito");
const mensajeError = document.getElementById("mensaje-error");

const resumenCard = document.getElementById("resumenReserva");
const resumenContenido = document.getElementById("resumenContenido");

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const fecha = fechaSeleccionadaInput.value;
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const personas = document.getElementById("personas").value.trim();

    // Validación
    if (!fecha || !nombre || !correo || !telefono || !personas) {
        mostrarMensaje(false);
        return;
    }

    // Crear resumen
    resumenContenido.innerHTML = `
        <strong>Nombre:</strong> ${nombre}<br>
        <strong>Correo:</strong> ${correo}<br>
        <strong>Teléfono:</strong> ${telefono}<br>
        <strong>Personas:</strong> ${personas}<br>
        <strong>Fecha:</strong> ${fecha}
    `;

    mostrarResumenReserva();
    mostrarMensaje(true);

    formulario.reset();
    fechaSeleccionadaInput.value = "";
    fechaCards.forEach(c => c.classList.remove("seleccionada"));
});

// ================================
//   TARJETA PROFESIONAL
// ================================
function mostrarResumenReserva() {
    resumenCard.style.display = "block";
    resumenCard.style.opacity = "1";
    resumenCard.style.transform = "translateY(0)";

    // Ocultar después de 10 segundos
    setTimeout(() => {
        resumenCard.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        resumenCard.style.opacity = "0";
        resumenCard.style.transform = "translateY(15px)";

        setTimeout(() => {
            resumenCard.style.display = "none";
        }, 600);

    }, 10000);
}

// ================================
//   MENSAJES
// ================================
function mostrarMensaje(exito) {
    if (exito) {
        mensajeError.classList.add("hidden");
        mensajeExito.classList.remove("hidden");
        setTimeout(() => mensajeExito.classList.add("hidden"), 4000);
    } else {
        mensajeExito.classList.add("hidden");
        mensajeError.classList.remove("hidden");
        setTimeout(() => mensajeError.classList.add("hidden"), 4000);
    }
}
