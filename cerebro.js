let todasLasPeliculas = [];
let peliculasNodos = []; 

async function cargarCartelera() {
    try {
        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        const peliculas = xml.getElementsByTagName("pelicula");
        const contenedor = document.getElementById("contenedor-peliculas");
        let htmlContenido = "";

        for (let i = 0; i < peliculas.length; i++) {
    const id = peliculas[i].getAttribute("id");
    const titulo = peliculas[i].getElementsByTagName("titulo")[0].textContent;
    const director = peliculas[i].getElementsByTagName("director")[0].textContent;
    const año = peliculas[i].getElementsByTagName("año")[0].textContent;
    const tipo = peliculas[i].getElementsByTagName("tipo")[0].textContent;
    const rating = peliculas[i].getElementsByTagName("puntuacion_general")[0].textContent;
    const nodoPoster = peliculas[i].getElementsByTagName("poster")[0];
    const poster = nodoPoster ? nodoPoster.textContent : "https://placehold.co/500x750/111/570b9d?text=🎬";

            htmlContenido += `
                <div class="tarjeta-pelicula" style="display: flex; flex-direction: column; gap: 15px;">
                    <img src="${poster}" alt="${titulo}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 6px; border: 1px solid #2a2a2a; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                        <div>
                            <h3 class="titulo-peli" style="margin: 0 0 8px 0;">${titulo}</h3>
                            <p class="info-peli"><strong>Año:</strong> ${año}</p>
                            <p class="info-peli"><strong>Género:</strong> ${tipo}</p>
                            <p class="info-peli"><strong>Director:</strong> ${director}</p>
                        </div>
                        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                            <div class="rating-peli">★ ${rating}</div>
                            <a class="btn-ver" href="detalle.html?id=${id}">Ver Ficha</a>
                        </div>
                    </div>
                </div>
            `;

        }
        contenedor.innerHTML = htmlContenido;
    } catch (error) {
        console.error(error);
    }
}

async function cargarDetalle() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const idPeli = parametros.get('id');

        if (!idPeli) {
            document.getElementById("contenido-dinamico").innerHTML = "<p>No se especificó ninguna película.</p>";
            return;
        }

        let historial = JSON.parse(localStorage.getItem('historial_xfilms')) || [];
        if (!historial.includes(idPeli)) {
            historial.unshift(idPeli);
            localStorage.setItem('historial_xfilms', JSON.stringify(historial));
        }

        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        const pelicula = xml.querySelector(`pelicula[id="${idPeli}"]`);

        if (!pelicula) {
            document.getElementById("contenido-dinamico").innerHTML = "<p>Película no encontrada.</p>";
            return;
        }

        const titulo = pelicula.getElementsByTagName("titulo")[0].textContent;
        const director = pelicula.getElementsByTagName("director")[0].textContent;
        const año = pelicula.getElementsByTagName("año")[0].textContent;
        const tipo = pelicula.getElementsByTagName("tipo")[0].textContent;
        const duracion = pelicula.getElementsByTagName("duracion")[0].textContent;
        const sinopsis = pelicula.getElementsByTagName("sinopsis")[0].textContent;        
        const rating = pelicula.getElementsByTagName("puntuacion_general")[0].textContent;
        const poster = pelicula.getElementsByTagName("poster")[0].textContent;

        let reseñasHTML = "";
        const reseñas = pelicula.getElementsByTagName("reseña");

        if (reseñas.length > 0) {
            for (let j = 0; j < reseñas.length; j++) {
                const usuario = reseñas[j].getElementsByTagName("usuario")[0].textContent;
                const calificacion = reseñas[j].getElementsByTagName("calificacion")[0].textContent;
                const comentario = reseñas[j].getElementsByTagName("comentario")[0].textContent;
                const fecha = reseñas[j].getElementsByTagName("fecha")[0].textContent;

                reseñasHTML += `
                    <div class="tarjeta-reseña">
                        <div class="user-reseña">@${usuario} — ★ ${calificacion}/10</div>
                        <div class="comentario-reseña">"${comentario}"</div>
                        <div class="fecha-reseña">Publicado el: ${fecha}</div>
                    </div>
                `;
            }
        } else {
            reseñasHTML = "<p style='color: #777;'>Esta película aún no tiene reseñas de críticos.</p>";
        }

        document.getElementById("contenido-dinamico").innerHTML = `
            <div class="contenedor-detalle" style="display: flex; gap: 30px; align-items: flex-start; max-width: 900px; margin: 0 auto;">
                <div class="columna-poster" style="flex: 1; max-width: 300px;">
                    <img src="${poster}" alt="${titulo}" style="width: 100%; border-radius: 8px; border: 1px solid #33px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);">
                </div>

            <div class="columna-info" style="flex: 2;">
                <div class="header-detalle" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 2rem;">${titulo}</h2>
                    <div style="color: #d8b4fe; font-weight: bold; font-size: 1.5rem;">★ ${rating} / 10</div>
                </div>
            
                <div class="meta-info" style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #ccc;">
                    <div><strong>Director:</strong> ${director}</div>
                    <div><strong>Año:</strong> ${año}</div>
                    <div><strong>Género:</strong> ${tipo}</div>
                    <div><strong>Duración:</strong> ${duracion}</div>
                </div>
            
                <div class="sinopsis" style="margin-bottom: 30px; border-top: 1px solid #222; padding-top: 15px;">
                    <h3 style="color: #570b9d; margin-bottom: 10px;">Sinopsis</h3>
                    <p style="line-height: 1.6; color: #eee;">${sinopsis}</p>
                </div>
            
                <div class="seccion-reseñas" style="border-top: 1px solid #222; padding-top: 15px;">
                    <h3 style="color: #570b9d; margin-bottom: 15px;">Reseñas de Usuarios</h3>
                    ${reseñasHTML}
                </div>
            </div>

        </div>
    `;
    } catch (error) {
        console.error(error);
    }
}

async function inicializarBuscador() {
    try {
        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        todasLasPeliculas = Array.from(xml.getElementsByTagName("pelicula"));
        mostrarPeliculasBusqueda(todasLasPeliculas);
        document.getElementById("input-buscar").addEventListener("input", filtrarPeliculas);
    } catch (error) {
        console.error(error);
    }
}

function mostrarPeliculasBusqueda(lista) {
    const contenedor = document.getElementById("contenedor-peliculas");
    let htmlContenido = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p style='color: #777; text-align: center; width: 100%; grid-column: 1/-1;'>No se encontraron películas.</p>";
        return;
    }

    lista.forEach(pelicula => {
        const id = pelicula.getAttribute("id");
        const titulo = pelicula.getElementsByTagName("titulo")[0].textContent;
        const poster = pelicula.getElementsByTagName("poster")[0].textContent;
        const director = pelicula.getElementsByTagName("director")[0].textContent;
        const año = pelicula.getElementsByTagName("año")[0].textContent;
        const tipo = pelicula.getElementsByTagName("tipo")[0].textContent;
        const rating = pelicula.getElementsByTagName("puntuacion_general")[0].textContent;

        htmlContenido += `
            <div class="tarjeta-pelicula" style="display: flex; flex-direction: column; gap: 15px;">
                <img src="${poster}" alt="${titulo}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 6px; border: 1px solid #2a2a2a; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">       
                <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                    <div>
                        <h3 class="titulo-peli" style="margin: 0 0 8px 0;">${titulo}</h3>
                        <p class="info-peli"><strong>Año:</strong> ${año}</p>
                        <p class="info-peli"><strong>Género:</strong> ${tipo}</p>
                        <p class="info-peli"><strong>Director:</strong> ${director}</p>
                    </div>
                    <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="rating-peli">★ ${rating}</div>
                        <a class="btn-ver" href="detalle.html?id=${id}">Ver Ficha</a>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = htmlContenido;
}

function filtrarPeliculas(evento) {
    const textoBusqueda = evento.target.value.toLowerCase().trim();
    const filtradas = todasLasPeliculas.filter(pelicula => {
        const titulo = pelicula.getElementsByTagName("titulo")[0].textContent.toLowerCase();
        const director = pelicula.getElementsByTagName("director")[0].textContent.toLowerCase();
        return titulo.includes(textoBusqueda) || director.includes(textoBusqueda);
    });
    mostrarPeliculasBusqueda(filtradas);
}

async function cargarGeneros() {
    try {
        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        
        peliculasNodos = Array.from(xml.getElementsByTagName("pelicula"));
        
        const generosSet = new Set();
        peliculasNodos.forEach(p => {
            const tipo = p.getElementsByTagName("tipo")[0].textContent.trim();
            generosSet.add(tipo);
        });

        const contenedorBotones = document.getElementById("botones-generos");
        
        const botonTodos = document.createElement("button");
        botonTodos.className = "btn-filtro activo";
        botonTodos.textContent = "Todos";
        botonTodos.onclick = function() { filtrarPorGenero('Todos', this); };
        contenedorBotones.appendChild(botonTodos);

        generosSet.forEach(genero => {
            const boton = document.createElement("button");
            boton.className = "btn-filtro";
            boton.textContent = genero;
            boton.onclick = function() { filtrarPorGenero(genero, this); };
            contenedorBotones.appendChild(boton);
        });

        mostrarPeliculasBusqueda(peliculasNodos);
    } catch (error) {
        console.error(error);
    }
}

function filtrarPorGenero(genero, botonSeleccionado) {
    const botones = document.getElementsByClassName("btn-filtro");
    for (let b of botones) { b.classList.remove("activo"); }
    botonSeleccionado.classList.add("activo");

    if (genero === 'Todos') {
        mostrarPeliculasBusqueda(peliculasNodos);
    } else {
        const filtradas = peliculasNodos.filter(p => p.getElementsByTagName("tipo")[0].textContent.trim() === genero);
        mostrarPeliculasBusqueda(filtradas);
    }
}

async function cargarTop10() {
    try {
        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        const peliculas = Array.from(xml.getElementsByTagName("pelicula"));

        peliculas.sort((a, b) => {
            const ratingA = parseFloat(a.getElementsByTagName("puntuacion_general")[0].textContent);
            const ratingB = parseFloat(b.getElementsByTagName("puntuacion_general")[0].textContent);
            return ratingB - ratingA;
        });

        const top10 = peliculas.slice(0, 10);
        const contenedor = document.getElementById("lista-top10");
        let htmlContenido = "";

        top10.forEach((pelicula, indice) => {
            const id = pelicula.getAttribute("id");
            const titulo = pelicula.getElementsByTagName("titulo")[0].textContent;
            const director = pelicula.getElementsByTagName("director")[0].textContent;
            const año = pelicula.getElementsByTagName("año")[0].textContent;
            const tipo = pelicula.getElementsByTagName("tipo")[0].textContent;
            const rating = pelicula.getElementsByTagName("puntuacion_general")[0].textContent;

            htmlContenido += `
                <div class="fila-ranking">
                    <div class="posicion">#${indice + 1}</div>
                    <div class="detalles-ranking">
                        <h3>${titulo}</h3>
                        <span style="color: #aaa; font-size: 0.9rem;">${año} | ${tipo} | Dir: ${director}</span>
                    </div>
                    <div class="puntuacion-top">★ ${rating}</div>
                    <a class="btn-ver" href="detalle.html?id=${id}" style="margin-top: 0; margin-left: 20px;">Ver Ficha</a>
                </div>
            `;
        });
        contenedor.innerHTML = htmlContenido;
    } catch (error) {
        console.error(error);
    }
}

async function cargarHistorial() {
    try {
        const historialIds = JSON.parse(localStorage.getItem('historial_xfilms')) || [];
        const contenedor = document.getElementById("contenedor-historico");

        if (historialIds.length === 0) {
            contenedor.innerHTML = "<p style='color: #777;'>Aún no has visitado ninguna película.</p>";
            return;
        }

        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        let htmlContenido = "";

        historialIds.forEach(id => {
            const pelicula = xml.querySelector(`pelicula[id="${id}"]`);
            if (pelicula) {
                const titulo = pelicula.getElementsByTagName("titulo")[0].textContent;
                const poster = pelicula.getElementsByTagName("poster")[0].textContent;
                const director = pelicula.getElementsByTagName("director")[0].textContent;
                const año = pelicula.getElementsByTagName("año")[0].textContent;
                const tipo = pelicula.getElementsByTagName("tipo")[0].textContent;
                const rating = pelicula.getElementsByTagName("puntuacion_general")[0].textContent;

                htmlContenido += `
                <div class="tarjeta-pelicula" style="display: flex; flex-direction: column; gap: 15px;">
                    <img src="${poster}" alt="${titulo}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 6px; border: 1px solid #2a2a2a; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">       
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                        <div>
                            <h3 class="titulo-peli" style="margin: 0 0 8px 0;">${titulo}</h3>
                            <p class="info-peli"><strong>Año:</strong> ${año}</p>
                            <p class="info-peli"><strong>Género:</strong> ${tipo}</p>
                            <p class="info-peli"><strong>Director:</strong> ${director}</p>
                        </div>
                        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                            <div class="rating-peli">★ ${rating}</div>
                            <a class="btn-ver" href="detalle.html?id=${id}">Ver Ficha</a>
                        </div>
                    </div>
                </div>
            `;
            }
        });
        contenedor.innerHTML = htmlContenido;
    } catch (error) {
        console.error(error);
    }
}

async function cargarMisReseñas() {
    try {
        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        const peliculas = xml.getElementsByTagName("pelicula");
        const contenedor = document.getElementById("lista-mis-reseñas");
        let htmlContenido = "";

        for (let i = 0; i < peliculas.length; i++) {
            const tituloPeli = peliculas[i].getElementsByTagName("titulo")[0].textContent;
            const reseñas = peliculas[i].getElementsByTagName("reseña");

            for (let j = 0; j < reseñas.length; j++) {
                const usuario = reseñas[j].getElementsByTagName("usuario")[0].textContent;
                if (usuario === "AxelYebra") {
                    const calificacion = reseñas[j].getElementsByTagName("calificacion")[0].textContent;
                    const comentario = reseñas[j].getElementsByTagName("comentario")[0].textContent;
                    const fecha = reseñas[j].getElementsByTagName("fecha")[0].textContent;

                    htmlContenido += `
                        <div class="bloque-critica">
                            <h3 class="titulo-critica">${tituloPeli} — <span style="color: #570b9d;">★ ${calificacion}/10</span></h3>
                            <p class="texto-critica">"${comentario}"</p>
                            <div class="info-critica">Publicada el: ${fecha}</div>
                        </div>
                    `;
                }
            }
        }
        contenedor.innerHTML = htmlContenido || "<p style='color: #777;'>No se encontraron reseñas.</p>";
    } catch (error) {
        console.error(error);
    }
}

async function calcularMetricas() {
    try {
        const respuesta = await fetch('peliculas.xml');
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(textoXML, "text/xml");
        const peliculas = xml.getElementsByTagName("pelicula");
        const total = peliculas.length;
        let sumaRatings = 0;
        let maxRating = -1;
        let tituloMaxRating = "";

        for (let i = 0; i < total; i++) {
            const titulo = peliculas[i].getElementsByTagName("titulo")[0].textContent;
            const rating = parseFloat(peliculas[i].getElementsByTagName("puntuacion_general")[0].textContent);
            sumaRatings += rating;
            if (rating > maxRating) {
                maxRating = rating;
                tituloMaxRating = titulo;
            }
        }

        const promedio = total > 0 ? (sumaRatings / total).toFixed(2) : 0;
        document.getElementById("total-peliculas").textContent = total;
        document.getElementById("promedio-rating").textContent = promedio;
        document.getElementById("mejor-pelicula").innerHTML = `${tituloMaxRating} <br><span style='font-size: 1.1rem; color: #fff;'>★ ${maxRating}</span>`;
    } catch (error) {
        console.error(error);
    }
}