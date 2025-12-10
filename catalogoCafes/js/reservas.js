// ================================
//   CONFIGURACIÓN DE DISPONIBILIDAD
// ================================
const fechasNoDisponibles = [
    "2026-01-17",
    "2026-01-22",
    "2026-01-30"
];


// ================================
//   SELECCIÓN DE FECHAS
// ================================
const tarjetasFecha = document.querySelectorAll(".fecha-card");
const inputFecha = document.getElementById("fechaSeleccionada");

// Inicializar disponibilidad
tarjetasFecha.forEach(card => {
    const fecha = card.dataset.fecha;

    if (fechasNoDisponibles.includes(fecha)) {
        card.classList.add("no-disponible");
        card.querySelector("span").textContent = "No disponible";
    } else {
        card.classList.add("disponible");
        card.querySelector("span").textContent = "Disponible";
    }
});

// Selección
tarjetasFecha.forEach(card => {
    card.addEventListener("click", () => {

        if (card.classList.contains("no-disponible")) return;

        tarjetasFecha.forEach(c => c.classList.remove("seleccionada"));
        card.classList.add("seleccionada");

        inputFecha.value = card.dataset.fecha;
    });
});


// ================================
//   VALIDACIÓN Y ENVÍO
// ================================
const form = document.getElementById("reservaForm");
const msgExito = document.getElementById("mensaje-exito");
const msgError = document.getElementById("mensaje-error");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    msgError.classList.add("hidden");
    msgExito.classList.add("hidden");

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const personas = document.getElementById("personas").value.trim();
    const fecha = inputFecha.value;

    if (!nombre || !correo || !telefono || !personas || !fecha) {
        mostrarError("Debes completar todos los campos y seleccionar una fecha.");
        return;
    }

    if (fechasNoDisponibles.includes(fecha)) {
        mostrarError("La fecha seleccionada no está disponible.");
        return;
    }

    mostrarExito("✔ Reserva realizada con éxito");

    form.reset();
    inputFecha.value = "";
    tarjetasFecha.forEach(c => c.classList.remove("seleccionada"));
});


// ================================
//   FUNCIONES DE MENSAJE
// ================================
function mostrarError(texto) {
    msgError.textContent = texto;
    msgError.classList.remove("hidden");

    setTimeout(() => {
        msgError.classList.add("hidden");
    }, 4000);
}

function mostrarExito(texto) {
    msgExito.textContent = texto;
    msgExito.classList.remove("hidden");

    setTimeout(() => {
        msgExito.classList.add("hidden");
    }, 4000);
}
