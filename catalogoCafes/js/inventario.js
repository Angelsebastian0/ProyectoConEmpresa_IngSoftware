//inventario.js

const tabla = document.querySelector("#tabla-inventario tbody");

function cargarInventario() {
  fetch("http://localhost:3000/productos")
    .then(res => res.json())
    .then(productos => {
      tabla.innerHTML = "";

      productos.forEach(p => {
        tabla.innerHTML += `
          <tr>
            <td>${p.nombre}</td>
            <td>${p.stock}</td>
            <td>$${p.precio}</td>
            <td>
              <a href="editar_producto.html?id=${p.id}" class="btn-secundario">Editar</a>
              <button onclick="eliminar(${p.id})" class="btn-principal">Eliminar</button>
            </td>
          </tr>
        `;
      });
    });
}

function eliminar(id) {
  if (!confirm("¿Eliminar este producto?")) return;

  fetch(`http://localhost:3000/productos/${id}`, {
    method: "DELETE"
  })
  .then(() => cargarInventario());
}

cargarInventario();
