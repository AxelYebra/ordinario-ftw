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

function cargarTop10() {
    fetch('peliculas.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo abrir el archivo peliculas.xml");
            }
            return response.text();
        })
        .then(str => {
            const parser = new DOMParser();
            const miXML = parser.parseFromString(str, "text/xml");
            
            const peliculas = miXML.getElementsByTagName("pelicula");
            if (!peliculas || peliculas.length === 0) return;
            
            let listaPeliculas = [];

            for (let i = 0; i < peliculas.length; i++) {
                const id = peliculas[i].getAttribute("id") || i;
                
                const tagTitulo = peliculas[i].getElementsByTagName("titulo")[0];
                const titulo = tagTitulo ? tagTitulo.textContent : "Película sin título";
                
                const tagDirector = peliculas[i].getElementsByTagName("director")[0];
                const director = tagDirector ? tagDirector.textContent : "Desconocido";
                
                const tagAño = peliculas[i].getElementsByTagName("año")[0];
                const año = tagAño ? tagAño.textContent : "-";
                
                const tagTipo = peliculas[i].getElementsByTagName("tipo")[0];
                const tipo = tagTipo ? tagTipo.textContent : "General";
                
                const tagRating = peliculas[i].getElementsByTagName("puntuacion_general")[0];
                const rating = tagRating ? parseFloat(tagRating.textContent) : 0.0;
                
                const tagPoster = peliculas[i].getElementsByTagName("poster")[0];
                const poster = tagPoster ? tagPoster.textContent : "https://placehold.co/500x750/111/570b9d?text=🎬";

                listaPeliculas.push({ id, titulo, director, año, tipo, rating, poster });
            }

            listaPeliculas.sort((a, b) => b.rating - a.rating);

            const top10 = listaPeliculas.slice(0, 10);

            let htmlTabla = `
                <div style="overflow-x: auto; margin-top: 20px; padding: 0 10px;">
                    <table style="width: 100%; border-collapse: collapse; background-color: #050505; color: #ffffff; font-family: sans-serif; min-width: 650px; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="border-bottom: 3px solid #570b9d; text-align: left; background-color: #0c0c0c;">
                                <th style="padding: 15px; font-size: 1rem; color: #570b9d; width: 80px; text-align: center;">Puesto</th>
                                <th style="padding: 15px; font-size: 1rem; width: 70px;">Póster</th>
                                <th style="padding: 15px; font-size: 1rem;">Título</th>
                                <th style="padding: 15px; font-size: 1rem;">Director</th>
                                <th style="padding: 15px; font-size: 1rem; width: 80px;">Año</th>
                                <th style="padding: 15px; font-size: 1rem;">Género</th>
                                <th style="padding: 15px; font-size: 1rem; text-align: center; color: #570b9d; width: 110px;">Rating</th>
                                <th style="padding: 15px; font-size: 1rem; text-align: center; width: 100px;">Ficha</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            top10.forEach((pelicula, indice) => {
                const puesto = indice + 1;
                let podio = puesto;
                if (puesto === 1) podio = "🥇 1";
                if (puesto === 2) podio = "🥈 2";
                if (puesto === 3) podio = "🥉 3";

                htmlTabla += `
                    <tr style="border-bottom: 1px solid #1a1a1a; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#0f0f15'" onmouseout="this.style.backgroundColor='transparent'">
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: #d8b4fe; font-size: 1.05rem;">${podio}</td>
                        <td style="padding: 8px 12px;">
                            <img src="${pelicula.poster}" alt="${pelicula.titulo}" style="width: 45px; height: 65px; object-fit: cover; border-radius: 4px; border: 1px solid #222;">
                        </td>
                        <td style="padding: 12px; font-weight: 500; color: #ffffff;">${pelicula.titulo}</td>
                        <td style="padding: 12px; color: #cccccc; font-size: 0.95rem;">${pelicula.director}</td>
                        <td style="padding: 12px; color: #999999; font-size: 0.95rem;">${pelicula.año}</td>
                        <td style="padding: 12px; color: #999999;"><span style="background-color: #161622; color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; border: 1px solid #2d2d3d;">${pelicula.tipo}</span></td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: #fbbf24; font-size: 1.1rem;">★ ${pelicula.rating.toFixed(1)}</td>
                        <td style="padding: 12px; text-align: center;">
                            <a href="detalle.html?id=${pelicula.id}" style="background-color: #570b9d; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 0.85rem; font-weight: bold; display: inline-block; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#701aed'" onmouseout="this.style.backgroundColor='#570b9d'">Ver</a>
                        </td>
                    </tr>
                `;
            });

            htmlTabla += `
                        </tbody>
                    </table>
                </div>
            `;

            const contenedor = document.getElementById("contenido-dinamico") || document.getElementById("tabla-top10");
            if (contenedor) {
                contenedor.innerHTML = htmlTabla;
            }
        })
        .catch(error => {
            console.error("Error en Top 10:", error);
            const contenedor = document.getElementById("contenido-dinamico") || document.getElementById("tabla-top10");
            if (contenedor) {
                contenedor.innerHTML = `<p style="color: red; text-align: center;">Error al cargar el Top 10 de películas.</p>`;
            }
        });
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