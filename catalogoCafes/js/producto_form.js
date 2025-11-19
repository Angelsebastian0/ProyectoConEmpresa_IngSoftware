const form = document.querySelector("#form-producto");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Si existe ID → es edición
if (id) {
  fetch(`http://localhost:3000/productos/${id}`)
    .then(res => res.json())
    .then(p => {
      form.nombre.value = p.nombre;
      form.origen.value = p.origen;
      form.descripcion.value = p.descripcion;
      form.precio.value = p.precio;
      form.stock.value = p.stock;
      form.imagen.value = p.imagen;
    });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const datos = {
    nombre: form.nombre.value,
    origen: form.origen.value,
    descripcion: form.descripcion.value,
    precio: parseInt(form.precio.value),
    stock: parseInt(form.stock.value),
    imagen: form.imagen.value
  };

  fetch(
    id ? `http://localhost:3000/productos/${id}` : "http://localhost:3000/productos",
    {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    }
  ).then(() => {
    alert("Producto guardado");
    window.location.href = "inventario.html";
  });
});
