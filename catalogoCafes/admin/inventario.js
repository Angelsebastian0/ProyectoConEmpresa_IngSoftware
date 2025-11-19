// inventario.js (admin)
const API = "http://localhost:3000/productos"; // coincide con tu server.js

// Elementos
const lista = document.getElementById("inventario-list");
const btnAgregar = document.getElementById("btn-agregar");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");

const form = document.getElementById("producto-form");
const cancelarBtn = document.getElementById("cancelar-edicion");

const idInput = document.getElementById("producto-id");
const nombreInput = document.getElementById("nombre");
const origenInput = document.getElementById("origen");
const descInput = document.getElementById("descripcion");
const precioInput = document.getElementById("precio");
const imagenInput = document.getElementById("imagen");
const cantidadInput = document.getElementById("cantidad");

const menosCant = document.getElementById("menos-cant");
const masCant = document.getElementById("mas-cant");

// Preview elements
const prevImg = document.getElementById("preview-img");
const prevNombre = document.getElementById("preview-nombre");
const prevOrigen = document.getElementById("preview-origen");
const prevDesc = document.getElementById("preview-desc");
const prevPrecio = document.getElementById("preview-precio");
const prevStock = document.getElementById("preview-stock");

// Confirm delete modal
const confirmModal = document.getElementById("confirm-modal");
const confirmText = document.getElementById("confirm-text");
const confirmCancel = document.getElementById("confirm-cancel");
const confirmDelete = document.getElementById("confirm-delete");

let deleteTargetId = null;

// Cargar productos desde API
async function cargarProductos() {
  try {
    const res = await fetch(API);
    const productos = await res.json();

    lista.innerHTML = "";
    if (!Array.isArray(productos)) {
      lista.innerHTML = "<p>No hay productos o la API no devolvió un arreglo.</p>";
      return;
    }

    productos.forEach(p => {
      // usa la estructura .tarjeta que ya tienes en estilos.css
      const nodo = document.createElement("article");
      nodo.className = "tarjeta";
      nodo.innerHTML = `
        <img src="${p.imagen || ''}" alt="${escapeHtml(p.nombre)}">
        <div class="card-body" style="padding:12px;display:flex;flex-direction:column;flex:1;">
          <h3>${escapeHtml(p.nombre)}</h3>
          <p style="margin:0.2rem 0;color:#444;font-size:0.95rem;">Origen: ${escapeHtml(p.origen || '')}</p>
          <p class="descripcion">${escapeHtml(p.descripcion || '')}</p>

          <span class="precio">$${Number(p.precio).toLocaleString()}</span>

          <div style="margin-top:6px;font-size:0.95rem;color:#222;">
            Unidades: <strong>${p.stock}</strong>
          </div>

          ${Number(p.stock) === 0 ? "<p style='color:red;margin:6px 0 0'>Sin stock</p>" : ""}

          <div class="card-actions" style="margin-top:10px;display:flex;gap:8px;">
            <button class="btn-secundario btn-editar" data-id="${p.id}">Editar</button>
            <button class="btn-danger btn-eliminar" data-id="${p.id}">Eliminar</button>
          </div>
        </div>
      `;

      lista.appendChild(nodo);
    });
  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p>Error cargando productos. Revisa la consola.</p>";
  }
}

// abrir modal (nuevo o editar)
function abrirModal(nuevo = true, producto = null) {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  if (nuevo) {
    modalTitle.textContent = "Agregar Producto";
    form.reset();
    idInput.value = "";
    cantidadInput.value = 0;
  } else if (producto) {
    modalTitle.textContent = "Editar Producto";
    idInput.value = producto.id;
    nombreInput.value = producto.nombre || "";
    origenInput.value = producto.origen || "";
    descInput.value = producto.descripcion || "";
    precioInput.value = producto.precio || 0;
    imagenInput.value = producto.imagen || "";
    cantidadInput.value = producto.stock || 0;
  }

  actualizarPreview();
}

// cerrar modal
function cerrarModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  form.reset();
}

// actualizar preview
function actualizarPreview() {
  prevImg.src = imagenInput.value || "https://via.placeholder.com/400x300?text=Sin+imagen";
  prevNombre.textContent = nombreInput.value || "Nombre";
  prevOrigen.textContent = origenInput.value ? `Origen: ${origenInput.value}` : "Origen";
  prevDesc.textContent = descInput.value || "Descripción";
  prevPrecio.textContent = precioInput.value ? `$${Number(precioInput.value).toLocaleString()}` : "$0";
  prevStock.textContent = `Stock: ${cantidadInput.value || 0}`;
}

// guardar (crear o actualizar)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: nombreInput.value,
    origen: origenInput.value,
    descripcion: descInput.value,
    precio: Number(precioInput.value),
    imagen: imagenInput.value,
    stock: Number(cantidadInput.value)
  };

  const id = idInput.value;

  try {
    if (id) {
      // PUT
      await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
      });
    } else {
      // POST
      await fetch(API, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
      });
    }
    cerrarModal();
    await cargarProductos();
  } catch (err) {
    console.error("Error guardando producto:", err);
    alert("Ocurrió un error al guardar. Revisa la consola.");
  }
});

// botones +/- para stock
masCant.addEventListener("click", () => {
  cantidadInput.value = Number(cantidadInput.value || 0) + 1;
  actualizarPreview();
});
menosCant.addEventListener("click", () => {
  const val = Math.max(0, Number(cantidadInput.value || 0) - 1);
  cantidadInput.value = val;
  actualizarPreview();
});

// inputs actualizan preview
[nombreInput, origenInput, descInput, precioInput, imagenInput, cantidadInput].forEach(el => {
  el.addEventListener("input", actualizarPreview);
});

// abrir modal nuevo
btnAgregar.addEventListener("click", () => abrirModal(true));

// cerrar modal
modalClose.addEventListener("click", cerrarModal);
cancelarBtn.addEventListener("click", cerrarModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!modal.classList.contains("hidden")) cerrarModal();
    if (!confirmModal.classList.contains("hidden")) hideConfirm();
  }
});

// delegación para editar/eliminar
lista.addEventListener("click", async (e) => {
  if (e.target.matches(".btn-editar")) {
    const id = e.target.dataset.id;
    try {
      const res = await fetch(`${API}/${id}`);
      const producto = await res.json();
      abrirModal(false, producto);
    } catch (err) {
      console.error(err);
      alert("Error al obtener producto para editar.");
    }
  } else if (e.target.matches(".btn-eliminar")) {
    const id = e.target.dataset.id;
    deleteTargetId = id;
    confirmText.textContent = "Esta acción eliminará permanentemente el producto con id " + id + ". ¿Deseas continuar?";
    showConfirm();
  }
});

// confirmar/eliminar
function showConfirm() {
  confirmModal.classList.remove("hidden");
  confirmModal.setAttribute("aria-hidden", "false");
}
function hideConfirm() {
  confirmModal.classList.add("hidden");
  confirmModal.setAttribute("aria-hidden", "true");
  deleteTargetId = null;
}
confirmCancel.addEventListener("click", hideConfirm);

confirmDelete.addEventListener("click", async () => {
  if (!deleteTargetId) return hideConfirm();

  try {
    await fetch(`${API}/${deleteTargetId}`, { method: "DELETE" });
    hideConfirm();
    await cargarProductos();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar. Revisa la consola.");
  }
});

// util: escapar HTML en texto
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// iniciar
cargarProductos();
