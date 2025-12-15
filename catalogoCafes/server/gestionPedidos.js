// gestionPedidos.js (frontend) - lee server/database.json y muestra los pedidos
(async function () {
  const DB_URL = "/server/database.json"; // lectura directa del archivo JSON

  function mostrarError(msg) {
    console.error(msg);
    const cont = document.getElementById("error-container");
    if (cont) cont.textContent = msg;
  }

  async function cargarPedidos() {
    try {
      const res = await fetch(DB_URL);
      if (!res.ok) throw new Error(`Error al leer database.json (${res.status})`);
      const db = await res.json();

      const pedidos = Array.isArray(db.pedidos) ? db.pedidos : [];
      const tbody = document.getElementById("tabla-pedidos");
      if (!tbody) {
        mostrarError("No se encontró el elemento #tabla-pedidos en el DOM.");
        return;
      }
      tbody.innerHTML = "";

      if (pedidos.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4"><i>No hay pedidos</i></td>`;
        tbody.appendChild(tr);
        return;
      }

      pedidos.forEach(pedido => {
        const fila = document.createElement("tr");

        // Nombre
        const tdNombre = document.createElement("td");
        tdNombre.textContent = pedido.customer?.nombre || "—";
        fila.appendChild(tdNombre);

        // Correo
        const tdCorreo = document.createElement("td");
        tdCorreo.textContent = pedido.customer?.email || "—";
        fila.appendChild(tdCorreo);

        // Items
        const tdItems = document.createElement("td");
        tdItems.classList.add("pedido-lista");
        tdItems.innerHTML = Array.isArray(pedido.items) && pedido.items.length > 0
          ? pedido.items.map(i => `${i.nombre} (x${i.cantidad}) ${i.precio ? '- $' + i.precio : ''}`).join("<br>")
          : "<i>Sin items</i>";
        fila.appendChild(tdItems);

        // Estado (solo visual, no persiste)
        const tdEstado = document.createElement("td");
        const select = document.createElement("select");

        const opciones = ["Pendiente", "Pagado", "Enviado", "Cancelado"];
        opciones.forEach(op => {
          const opt = document.createElement("option");
          opt.value = op;
          opt.textContent = op;
          if ((pedido.status || "").toLowerCase() === op.toLowerCase()) opt.selected = true;
          select.appendChild(opt);
        });

        // Al cambiar estado solo mostramos (NO intentamos persistir)
        select.addEventListener("change", () => {
          alert(`Cambio local: estado ${select.value} (no persistido)`);
        });

        tdEstado.appendChild(select);
        fila.appendChild(tdEstado);

        tbody.appendChild(fila);
      });

    } catch (err) {
      mostrarError("Error cargando pedidos: " + (err.message || err));
    }
  }

  // Ejecutar al cargar la página
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarPedidos);
  } else {
    cargarPedidos();
  }
})();
