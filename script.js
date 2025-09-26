// DiccionarioCode - Funcionalidad del Glosario
let terminos = [];
let terminosFiltrados = [];

// Cargar términos al iniciar la página
document.addEventListener('DOMContentLoaded', async function() {
    await cargarTerminos();
    inicializarBuscador();
    mostrarTodosLosTerminos();
});

// Función para cargar términos desde el JSON
async function cargarTerminos() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        terminos = data.terminos;
        terminosFiltrados = [...terminos];
    } catch (error) {
        console.error('Error cargando términos:', error);
        mostrarError('Error al cargar los términos del glosario.');
    }
}

// Inicializar funcionalidad del buscador
function inicializarBuscador() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        // Búsqueda en tiempo real mientras el usuario escribe
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim().toLowerCase();
            filtrarTerminos(query);
            mostrarTerminos();
        });

        // Limpiar búsqueda al presionar Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.target.value = '';
                filtrarTerminos('');
                mostrarTerminos();
                e.target.blur();
            }
        });

        // Focus automático en el buscador (opcional)
        searchInput.focus();
    }
}

// Filtrar términos según la búsqueda
function filtrarTerminos(query) {
    if (!query) {
        terminosFiltrados = [...terminos];
        return;
    }

    terminosFiltrados = terminos.filter(termino => {
        const termMatch = termino.termino.toLowerCase().includes(query);
        const defMatch = termino.definicion.toLowerCase().includes(query);
        return termMatch || defMatch;
    });
}

// Mostrar todos los términos (función inicial)
function mostrarTodosLosTerminos() {
    terminosFiltrados = [...terminos];
    mostrarTerminos();
}

// Renderizar términos en el DOM
function mostrarTerminos() {
    const container = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    
    if (!container) return;

    // Limpiar container
    container.innerHTML = '';

    if (terminosFiltrados.length === 0) {
        // Mostrar mensaje de sin resultados
        container.style.display = 'none';
        if (noResults) {
            noResults.classList.remove('hidden');
        }
        return;
    }

    // Ocultar mensaje de sin resultados
    container.style.display = 'grid';
    if (noResults) {
        noResults.classList.add('hidden');
    }

    // Crear tarjetas para cada término
    terminosFiltrados.forEach(termino => {
        const card = crearTarjetaTermino(termino);
        container.appendChild(card);
    });

    // Actualizar URLs para enlaces directos
    actualizarAnchors();
}

// Crear tarjeta HTML para un término
function crearTarjetaTermino(termino) {
    const card = document.createElement('div');
    card.className = 'term-card bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600';
    card.id = termino.id;
    
    card.innerHTML = `
        <div class="mb-4">
            <h3 class="text-xl font-bold text-white mb-2">${escapeHtml(termino.termino)}</h3>
            <p class="text-gray-300 leading-relaxed">${escapeHtml(termino.definicion)}</p>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">#${termino.id}</span>
            <button onclick="copiarEnlace('${termino.id}')" 
                    class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    title="Copiar enlace directo">
                📋 Copiar enlace
            </button>
        </div>
    `;

    return card;
}

// Actualizar anchors para navegación directa
function actualizarAnchors() {
    // Si hay un hash en la URL, hacer scroll al elemento
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
                targetElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
                setTimeout(() => {
                    targetElement.style.boxShadow = '';
                }, 2000);
            }, 100);
        }
    }
}

// Función para copiar enlace directo
async function copiarEnlace(terminoId) {
    try {
        const url = `${window.location.origin}${window.location.pathname}#${terminoId}`;
        
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
        } else {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        mostrarNotificacion('Enlace copiado al portapapeles!');
        
    } catch (error) {
        console.error('Error copiando enlace:', error);
        mostrarNotificacion('Error al copiar enlace', 'error');
    }
}

// Mostrar notificaciones temporales
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full ${
        tipo === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${tipo === 'success' ? '✅' : '❌'}</span>
            <span>${mensaje}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animar salida y remover
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Mostrar errores
function mostrarError(mensaje) {
    const container = document.getElementById('resultsContainer');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 class="text-2xl font-semibold text-gray-400 mb-2">Error</h3>
                <p class="text-gray-500">${mensaje}</p>
            </div>
        `;
    }
}

// Función utilitaria para escapar HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Funcionalidad adicional: búsqueda por URL
function buscarPorURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchParam;
            filtrarTerminos(searchParam);
            mostrarTerminos();
        }
    }
}

// Ejecutar búsqueda por URL después de cargar
document.addEventListener('DOMContentLoaded', buscarPorURL);

// Manejar navegación con hash
window.addEventListener('hashchange', actualizarAnchors);

// Funciones globales para uso en HTML
window.copiarEnlace = copiarEnlace;