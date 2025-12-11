async function cargarDatos() {
    const response = await fetch("http://localhost:3000/database");
    const data = await response.json();

    const usuarios = data.usuarios;
    const tbody = document.querySelector("#tablaPedidos tbody");

    usuarios.forEach(usuario => {
        if (usuario.rol !== "cliente") return; // solo clientes

        const carrito = usuario.carrito;

        let total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

        // Convertir los productos a texto
        let productosHTML = carrito.length === 0 
            ? "<i>Sin productos</i>"
            : carrito.map(p => `
                <div>
                    <strong>${p.nombre}</strong> — ${p.cantidad} und — $${p.precio}
                </div>
            `).join("");

        // Crear fila
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${usuario.nombre}</td>
            <td>${usuario.correo}</td>
            <td>${productosHTML}</td>
            <td>$${total}</td>
            <td>
                <select onchange="cambiarEstado(${usuario.id}, this.value)">
                    <option value="en espera">En espera</option>
                    <option value="enviado">Enviado</option>
                </select>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// Guardar el estado del pedido del cliente
async function cambiarEstado(usuarioId, estado) {
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}`);
    const usuario = await response.json();

    usuario.estadoPedido = estado;

    await fetch(`http://localhost:3000/usuarios/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    alert(`Estado actualizado a: ${estado}`);
}

cargarDatos();
