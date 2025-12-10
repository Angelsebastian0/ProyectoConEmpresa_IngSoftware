
async function cargarPublicaciones() {
    const lista = document.getElementById("lista-publicaciones");
    console.log("DIV:", lista);

    try {
        console.log("Llamando a:", API + "/publicaciones");
        const resp = await fetch(API + "/publicaciones");
        console.log("Respuesta HTTP:", resp.status);

        const publicaciones = await resp.json();
        console.log("Publicaciones recibidas:", publicaciones);

        lista.innerHTML = "";

        publicaciones.forEach(pub => {
            const card = document.createElement("div");
            card.classList.add("pub-card");

            card.innerHTML = `
                <img src="${pub.imagen}" alt="Imagen anuncio">
                <div class="pub-body">
                    <h3>${pub.titulo}</h3>
                    <p>${pub.contenido}</p>
                    <div class="pub-fecha">${new Date(pub.fecha).toLocaleDateString()}</div>
                </div>
            `;

            lista.appendChild(card);
        });

    } catch (err) {
        console.error("ERROR:", err);
        lista.innerHTML = "<p>Error cargando publicaciones.</p>";
    }
}

cargarPublicaciones();
