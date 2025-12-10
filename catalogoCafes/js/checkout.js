// checkout.js: maneja el formulario de pago y la comunicación con /pedidos
document.addEventListener("DOMContentLoaded", () => {
  const itemsList = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const form = document.getElementById("checkout-form");
  const confirmBox = document.getElementById("confirmacion");
  const confirmText = document.getElementById("confirm-text");
  const volverCarrito = document.getElementById("volver-carrito");

  // Cargar carrito desde localStorage (misma key que usa carrito.js)
  const key = localStorage.getItem("carrito_key") || "carrito";
  const productos = JSON.parse(localStorage.getItem(key) || "[]");

  function renderItems() {
    itemsList.innerHTML = "";
    productos.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `${p.nombre} — ${p.cantidad} x $${p.precio} = $${p.cantidad * p.precio}`;
      itemsList.appendChild(li);
    });
    const total = productos.reduce((s, x) => s + x.precio * x.cantidad, 0);
    totalEl.textContent = `Total: $${total}`;
  }

  renderItems();

  volverCarrito.addEventListener("click", () => {
    window.location.href = "catalogo.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const nombre = document.getElementById("nombre").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();
    const metodo = document.querySelector('input[name="metodo"]:checked').value;

    if (!nombre || !direccion || !telefono || !email) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const total = productos.reduce((s, x) => s + x.precio * x.cantidad, 0);

    try {
      const res = await fetch("http://localhost:3000/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { nombre, direccion, telefono, email },
          items: productos,
          total,
          paymentMethod: metodo
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando pedido");

            // Tras crear el pedido en estado Pendiente, confirmamos el pago
      // inmediatamente para obtener la vista previa del correo (emailPreview)
      const pedidoId = data.pedidoId;
      const confirmRes = await fetch(`http://localhost:3000/pedidos/${pedidoId}/confirm`, { method: "POST" });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        // Si hay problema (p. ej. stock insuficiente), mostrar detalle
        if (confirmData && confirmData.details) {
          const msgs = confirmData.details.map(d => `${d.nombre}: requerido ${d.required}, disponible ${d.available}`);
          alert('No se pudo confirmar el pedido. Stock insuficiente:\n' + msgs.join('\n'));
        } else {
          throw new Error(confirmData.error || 'Error confirmando pedido');
        }
        return;
      }

      // Mostrar modal con preview del correo si existe
      const modal = document.getElementById("modal-confirm");
      const modalMsg = document.getElementById("modal-message");
      const modalEmailLink = document.getElementById("modal-email-link");
      modalMsg.textContent = `¡Pago confirmado, gracias por su compra!   Número de pedido: ${confirmData.pedidoId}`;
      if (confirmData.emailPreview) {
        modalEmailLink.innerHTML = `En breve recibira un correo con su factura.   Previsualiza el correo aquí: <a href="${confirmData.emailPreview}" target="_blank" rel="noreferrer">Ver factura (Ethereal)</a>`;
      }
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");

      // Vaciar carrito local y ocultar el formulario/ resumen
      localStorage.removeItem(key);
      document.getElementById("checkout-container").classList.add("hidden");

      // configurar cierre del modal
      const closeAndRedirect = () => {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        // Redirigir al inicio
        window.location.href = "index.html";
      };
      document.getElementById("modal-close").addEventListener("click", closeAndRedirect);
      document.getElementById("modal-cerrar-btn").addEventListener("click", closeAndRedirect);
      document.getElementById("modal-volver").addEventListener("click", closeAndRedirect);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error procesando el pago: " + err.message);
    }
  });
});
