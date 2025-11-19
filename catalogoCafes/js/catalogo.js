const contenedor = document.querySelector(".catalogo");

fetch("http://localhost:3000/productos")
  .then(res => res.json())
  .then(productos => {
    contenedor.innerHTML = "";

    productos.forEach(p => {
      contenedor.innerHTML += `
        <article class="tarjeta">
          <img src="${p.imagen}">
          <div class="card-body">
            <h3>${p.nombre}</h3>
            <p>Origen: ${p.origen}</p>
            <p class="descripcion">${p.descripcion}</p>
            <span class="precio">$${p.precio}</span>
            ${p.stock === 0 ? "<p style='color:red'>Sin stock</p>" : ""}
          </div>
        </article>
      `;
    });
  });
