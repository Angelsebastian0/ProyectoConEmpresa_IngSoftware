// Clase Carrito para gestionar productos en el carrito
class Carrito {
  constructor() {
    this.productos = JSON.parse(localStorage.getItem("carrito") || "[]");
  }

  agregarProducto(producto) {
    const existente = this.productos.find(p => p.id === producto.id);
    if (existente) {
      existente.cantidad += producto.cantidad || 1;
    } else {
      this.productos.push({ ...producto, cantidad: producto.cantidad || 1 });
    }
    this.guardar();
  }

  aumentarCantidad(id) {
    const prod = this.productos.find(p => p.id === id);
    if (prod) {
      prod.cantidad++;
      this.guardar();
    }
  }

  disminuirCantidad(id) {
    const prod = this.productos.find(p => p.id === id);
    if (prod) {
      prod.cantidad--;
      if (prod.cantidad <= 0) {
        this.eliminarProducto(id);
      } else {
        this.guardar();
      }
    }
  }

  eliminarProducto(id) {
    this.productos = this.productos.filter(p => p.id !== id);
    this.guardar();
  }

  listarProductos() {
    return this.productos;
  }

  obtenerTotal() {
    return this.productos.reduce((total, p) => total + (p.precio * p.cantidad), 0);
  }

  guardar() {
    localStorage.setItem("carrito", JSON.stringify(this.productos));
  }

  vaciarCarrito() {
    this.productos = [];
    this.guardar();
  }
}

// Instancia global del carrito
const carrito = new Carrito();

// Función para mostrar el carrito en una ventana modal
function mostrarCarrito() {
  const modal = document.getElementById("carrito-modal");
  const lista = document.getElementById("carrito-lista");
  const total = document.getElementById("carrito-total");
  lista.innerHTML = "";
  carrito.listarProductos().forEach(p => {
    lista.innerHTML += `
      <li>
        ${p.nombre} - $${p.precio} x ${p.cantidad}
        <button class="btn-mas" data-id="${p.id}">+</button>
        <button class="btn-menos" data-id="${p.id}">–</button>
        <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
      </li>
    `;
  });
  total.textContent = "Total: $" + carrito.obtenerTotal();
  modal.classList.remove("hidden");
}

// Eventos para agregar productos desde el catálogo
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("btn-agregar-carrito")) {
    const id = parseInt(e.target.dataset.id);
    const nombre = e.target.dataset.nombre;
    const precio = parseInt(e.target.dataset.precio);
    carrito.agregarProducto({ id, nombre, precio, cantidad: 1 });
  }
  if (e.target.classList.contains("carrito-icono")) {
    mostrarCarrito();
  }
  if (e.target.classList.contains("btn-mas")) {
    carrito.aumentarCantidad(parseInt(e.target.dataset.id));
    mostrarCarrito();
  }
  if (e.target.classList.contains("btn-menos")) {
    carrito.disminuirCantidad(parseInt(e.target.dataset.id));
    mostrarCarrito();
  }
  if (e.target.classList.contains("btn-eliminar")) {
    carrito.eliminarProducto(parseInt(e.target.dataset.id));
    mostrarCarrito();
  }
  if (e.target.classList.contains("btn-finalizar")) {
    alert("¡Pedido confirmado! Número de pedido: " + Date.now());
    carrito.vaciarCarrito();
    mostrarCarrito();
  }
  if (e.target.classList.contains("btn-maximizar")) {
    document.getElementById("carrito-modal").classList.toggle("maximizado");
  }
  if (e.target.classList.contains("btn-minimizar")) {
    document.getElementById("carrito-modal").classList.toggle("hidden");
  }
});

// Al cargar la página, mostrar el carrito si ya hay productos
window.addEventListener("DOMContentLoaded", () => {
  if (carrito.listarProductos().length > 0) {
    mostrarCarrito();
  }
});