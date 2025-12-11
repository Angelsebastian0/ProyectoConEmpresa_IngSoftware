async function verificarAdmin() {
    try {
        const res = await fetch("/session");
        const json = await res.json();
        return json.session && json.session.rol === "admin";
    } catch {
        return false;
    }
}

async function cargarPublicaciones(filtro = "todas") {
    const lista = document.getElementById("lista-publicaciones");

    try {
        const resp = await fetch(API + "/publicaciones");
        const publicaciones = await resp.json();

        lista.innerHTML = "";

        publicaciones
            .filter(pub => filtro === "todas" || pub.tipo === filtro)
            .forEach(pub => {
                const card = document.createElement("div");
                card.classList.add("pub-card");

                card.innerHTML = `
                    <img src="${pub.imagen}" alt="Imagen anuncio">
                    <div class="pub-body">
                        <h3>${pub.titulo}</h3>
                        <p>${pub.contenido}</p>

                        ${
                            pub.tipo === "promocion"
                                ? `
                                <p><del>$${pub.precio_antes}</del> 
                                <strong>$${pub.precio_nuevo}</strong></p>
                                <p>Promoción hasta: 
                                ${new Date(pub.fin_promocion).toLocaleDateString()}</p>
                                `
                                : ""
                        }

                        <div class="pub-fecha">
                            ${new Date(pub.fecha).toLocaleDateString()}
                        </div>

                        <button class="btn-secundario btn-eliminar hidden"
                            data-id="${pub.id}">
                            Eliminar
                        </button>
                    </div>
                `;

                lista.appendChild(card);
            });

        // Activar eliminación si es admin
        if (await verificarAdmin()) {
            document.querySelectorAll(".btn-eliminar").forEach(btn => {
                btn.classList.remove("hidden");

                btn.onclick = async () => {
                    const id = btn.dataset.id;

                    const resp = await fetch(API + `/publicaciones/${id}`, {
                        method: "DELETE"
                    });

                    if (resp.ok) cargarPublicaciones();
                    else alert("Error eliminando publicación");
                };
            });
        }

    } catch (err) {
        console.error("Error cargando publicaciones:", err);
        lista.innerHTML = "<p>Error cargando publicaciones.</p>";
    }
}

async function crearPublicacion() {
    const data = {
        id: Date.now(),
        titulo: document.getElementById("new-title").value,
        contenido: document.getElementById("new-content").value,
        imagen: document.getElementById("new-img").value,
        tipo: document.getElementById("new-tipo").value,
        fecha: new Date().toISOString()
    };

    if (data.tipo === "promocion") {
        data.precio_antes = Number(document.getElementById("precio-antes").value);
        data.precio_nuevo = Number(document.getElementById("precio-nuevo").value);
        data.fin_promocion = document.getElementById("fin-promocion").value;
    }

    await fetch(API + "/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    document.getElementById("crear-publicacion-box").classList.add("hidden");
    cargarPublicaciones();
}

document.addEventListener("DOMContentLoaded", async () => {
    const esAdmin = await verificarAdmin();

    // Mostrar controles de administración
    if (esAdmin) {
        document.getElementById("admin-controls").classList.remove("hidden");

        document.getElementById("btn-crear").onclick = () =>
            document.getElementById("crear-publicacion-box").classList.remove("hidden");

        document.getElementById("btn-cancelar").onclick = () =>
            document.getElementById("crear-publicacion-box").classList.add("hidden");

        document.getElementById("btn-publicar").onclick = crearPublicacion;

        // Extra para promociones
        document.getElementById("new-tipo").onchange = e => {
            document
                .getElementById("promo-extra")
                .classList.toggle("hidden", e.target.value !== "promocion");
        };
    }

    // Filtro
    document.getElementById("filtro-publicaciones").onchange = e =>
        cargarPublicaciones(e.target.value);

    // PREVIEW DE IMAGEN
    document.getElementById("new-img").addEventListener("input", () => {
        const url = document.getElementById("new-img").value;
        const preview = document.getElementById("preview");

        if (url.trim().length > 4) {
            preview.src = url;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
        }
    });

    cargarPublicaciones();
});
