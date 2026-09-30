                              /* ============================================================
   RUTA: js/app.js
   Biblioteca de Prompts · JavaScript puro (ES6+), sin frameworks
   LÓGICA INTACTA: comportamiento idéntico a la versión original;
   no cambiar IDs/clases que este código usa.
   Secciones: 1) Datos  2) Utilidades  3) Render  4) Eventos  5) Tema  6) Inicio
   ============================================================ */

'use strict';

/* ============================ 1. DATOS ============================ */

const CATEGORIAS = ['OOP', 'Python', 'Bases de datos', 'Investigación', 'Imágenes', 'Pruebas de software', 'IA'];
const ESTADOS = ['borrador', 'probado', 'optimizado'];
const HERRAMIENTAS = ['Claude', 'ChatGPT', 'Gemini', 'Generador de imágenes'];

const CLAVE_PROMPTS = 'bp_prompts';
const CLAVE_TEMA = 'bp_tema';

const ICONOS_HERRAMIENTA = {
  'Claude': 'bi-chat-square-quote',
  'ChatGPT': 'bi-chat-dots',
  'Gemini': 'bi-stars',
  'Generador de imágenes': 'bi-image'
};

// Colección completa de prompts (única fuente de datos de la app)
let prompts = [];

// Estado de la interfaz (no se persiste, salvo selección implícita por re-render)
const estado = {
  modulo: 'lista',        // lista | favoritos | estadisticas
  seleccionado: null,     // id del prompt abierto en el detalle
  version: null,          // número de versión antigua en revisión (null = actual)
  valores: {},            // valores escritos en los campos de variable del detalle
  editandoId: null,       // id abierto en el modal (null = crear nuevo)
  calificacionModal: 3,
  variablesModal: [],     // [{nombre, descripcion, defecto}] del modal
  idPorEliminar: null,
  filtros: {
    lista: { texto: '', categoria: '', estado: '' },
    favoritos: { texto: '', categoria: '', estado: '' }
  }
};

let modalPrompt = null;
let modalEliminar = null;
let temporizadorToast = null;

/* Crea la versión 1 a partir del contenido actual (para los datos de ejemplo) */
function versionInicial(p) {
  return { numero: 1, fecha: p.creado, nota: 'Versión inicial', contenido: p.contenido, variables: copiar(p.variables) };
}

/* 5 prompts de ejemplo de distintas categorías, cargados solo si localStorage está vacío */
function datosEjemplo() {
  const ahora = Date.now();
  const DIA = 86400000;
  const iso = hace => new Date(ahora - hace * DIA).toISOString();

  const p1 = {
    id: 'ADSO-001',
    titulo: 'Generador de ejercicios de Python con solución explicada',
    categoria: 'Python',
    estado: 'probado',
    herramienta: 'ChatGPT',
    calificacion: 5,
    favorito: true,
    etiquetas: ['ejercicios', 'docencia', 'fundamentos'],
    contenido: `Actúa como docente experto en Python con experiencia en formación técnica.

Crea {{cantidad}} ejercicios prácticos sobre {{tema}} para estudiantes de nivel {{nivel}}.

Para cada ejercicio entrega:
1. Enunciado claro y corto.
2. Solución completa en Python con comentarios línea por línea.
3. Explicación paso a paso y un error común al resolverlo.

Ordena los ejercicios de menor a mayor dificultad y usa situaciones cercanas a Colombia (tiendas, ciudades o productos locales).`,
    variables: [
      { nombre: 'cantidad', descripcion: 'Número de ejercicios a generar', defecto: '5' },
      { nombre: 'tema', descripcion: 'Tema de Python a practicar', defecto: 'listas y diccionarios' },
      { nombre: 'nivel', descripcion: 'Nivel del estudiante', defecto: 'principiante' }
    ],
    notas: 'Funciona muy bien con nivel intermedio. Si el tema es avanzado, vale la pena pedir además un reto final opcional y casos de prueba.',
    usos: 12,
    creado: iso(24),
    actualizado: iso(2),
    versiones: []
  };
  p1.versiones = [versionInicial(p1)];

  const p2 = {
    id: 'ADSO-002',
    titulo: 'Refactorización de una clase aplicando principios SOLID',
    categoria: 'OOP',
    estado: 'optimizado',
    herramienta: 'Claude',
    calificacion: 4,
    favorito: false,
    etiquetas: ['solid', 'refactorización', 'arquitectura'],
    contenido: `Actúa como arquitecto de software senior, especialista en programación orientada a objetos en {{lenguaje}}.

Analiza la siguiente clase y propón una refactorización aplicando los principios SOLID:

{{codigo}}

Entrega tu respuesta en este orden:
1. Problemas detectados, indicando qué principio SOLID se incumple en cada caso.
2. Código refactorizado completo, con comentarios que expliquen cada cambio.
3. Impacto de la refactorización en el mantenimiento y en las pruebas unitarias.`,
    variables: [
      { nombre: 'lenguaje', descripcion: 'Lenguaje de programación del ejemplo', defecto: 'Java' },
      { nombre: 'codigo', descripcion: 'Código de la clase a refactorizar', defecto: '' }
    ],
    notas: 'Con clases muy largas conviene dividir la entrada. Las explicaciones de Claude son precisas y con buenos nombres de métodos.',
    usos: 7,
    creado: iso(18),
    actualizado: iso(5),
    versiones: []
  };
  // Historial de dos versiones para demostrar el módulo de historial
  p2.versiones = [
    {
      numero: 1,
      fecha: p2.creado,
      nota: 'Versión inicial',
      contenido: `Actúa como arquitecto de software senior. Analiza la siguiente clase escrita en {{lenguaje}} y propón una refactorización aplicando los principios SOLID:

{{codigo}}

Indica qué principio se incumple y muestra el código mejorado.`,
      variables: [
        { nombre: 'lenguaje', descripcion: 'Lenguaje de programación del ejemplo', defecto: 'Java' },
        { nombre: 'codigo', descripcion: 'Código de la clase a refactorizar', defecto: '' }
      ]
    },
    { numero: 2, fecha: p2.actualizado, nota: 'Se añadió la estructura de la respuesta y el impacto en mantenimiento', contenido: p2.contenido, variables: copiar(p2.variables) }
  ];

  const p3 = {
    id: 'ADSO-003',
    titulo: 'Diseño de modelo entidad-relación a partir de requisitos',
    categoria: 'Bases de datos',
    estado: 'borrador',
    herramienta: 'Gemini',
    calificacion: 3,
    favorito: false,
    etiquetas: ['sql', 'modelado', 'mer'],
    contenido: `Actúa como ingeniero de datos senior.

A partir de los siguientes requisitos de un sistema de {{dominio}}, diseña el modelo entidad-relación completo:

{{requisitos}}

Incluye en tu respuesta:
1. Entidades con sus atributos, tipos de datos y claves primarias.
2. Relaciones con la cardinalidad justificada en una frase.
3. Script SQL de creación de tablas (CREATE TABLE) para {{motor}}, con llaves foráneas y restricciones.
4. Tres consultas SQL de ejemplo que resuelvan necesidades típicas del sistema.`,
    variables: [
      { nombre: 'dominio', descripcion: 'Área o negocio del sistema', defecto: 'inventarios de una papelería' },
      { nombre: 'requisitos', descripcion: 'Lista de requisitos funcionales', defecto: '' },
      { nombre: 'motor', descripcion: 'Motor de base de datos', defecto: 'MySQL' }
    ],
    notas: 'Pendiente probar con requisitos extensos: con textos muy largos omite restricciones. Posible mejora: pedir la respuesta por partes.',
    usos: 2,
    creado: iso(9),
    actualizado: iso(9),
    versiones: []
  };
  p3.versiones = [versionInicial(p3)];

  const p4 = {
    id: 'ADSO-004',
    titulo: 'Prompt fotorrealista con estilo cinematográfico',
    categoria: 'Imágenes',
    estado: 'probado',
    herramienta: 'Generador de imágenes',
    calificacion: 4,
    favorito: true,
    etiquetas: ['fotorrealismo', 'cine', 'arte'],
    contenido: `Fotografía cinematográfica de {{escena}}.

Estilo y técnica:
- Iluminación {{iluminacion}}.
- Lente 50 mm, profundidad de campo reducida, sujeto nítido y fondo suave.
- Paleta de colores cálidos y contrastados, textura sutil de película analógica.
- Composición por regla de tercios, calidad editorial, alto detalle.

Relación de aspecto: {{proporcion}}.
Evitar: texto, marcas de agua, rostros y manos deformes, exceso de saturación.`,
    variables: [
      { nombre: 'escena', descripcion: 'Sujeto o escena principal', defecto: 'una calle colonial colombiana al atardecer' },
      { nombre: 'iluminacion', descripcion: 'Tipo de iluminación', defecto: 'natural dorada' },
      { nombre: 'proporcion', descripcion: 'Formato de la imagen', defecto: '16:9' }
    ],
    notas: 'Excelente resultado en generadores de imágenes. Con personas, añadir "retrato" al inicio mejora notablemente los rostros.',
    usos: 21,
    creado: iso(15),
    actualizado: iso(1),
    versiones: []
  };
  p4.versiones = [versionInicial(p4)];

  const p5 = {
    id: 'ADSO-005',
    titulo: 'Mejorador de prompts con técnicas de prompt engineering',
    categoria: 'IA',
    estado: 'optimizado',
    herramienta: 'Claude',
    calificacion: 5,
    favorito: false,
    etiquetas: ['prompt engineering', 'meta-prompt', 'mejora'],
    contenido: `Actúa como experto en prompt engineering con experiencia en modelos de lenguaje (Claude, ChatGPT y Gemini).

Analiza el siguiente prompt y devuélveme una versión mejorada, lista para usar:

{{prompt_original}}

Aplica estas técnicas:
- Asignación explícita de rol, audiencia y objetivo.
- Contexto, restricciones y criterios de calidad claros.
- Formato de salida definido: {{formato}}.
- Un ejemplo breve de salida esperada cuando aporte claridad.

Entrega:
1. El prompt mejorado, completo y listo para copiar.
2. Una lista de los cambios realizados y la razón de cada uno.
3. Una sugerencia de variable adicional que lo haría más reutilizable.`,
    variables: [
      { nombre: 'prompt_original', descripcion: 'Prompt que se desea mejorar', defecto: '' },
      { nombre: 'formato', descripcion: 'Formato esperado de la respuesta', defecto: 'lista numerada en español' }
    ],
    notas: 'Muy útil como "meta-prompt" antes de publicar una versión en la biblioteca. La sugerencia de variables extra ahorra tiempo.',
    usos: 9,
    creado: iso(12),
    actualizado: iso(3),
    versiones: []
  };
  p5.versiones = [
    {
      numero: 1,
      fecha: p5.creado,
      nota: 'Versión inicial',
      contenido: `Actúa como experto en prompt engineering. Mejora el siguiente prompt aplicando rol, contexto, restricciones y formato de salida ({{formato}}):

{{prompt_original}}

Explica brevemente los cambios realizados.`,
      variables: [
        { nombre: 'prompt_original', descripcion: 'Prompt que se desea mejorar', defecto: '' },
        { nombre: 'formato', descripcion: 'Formato esperado de la respuesta', defecto: 'texto plano' }
      ]
    },
    { numero: 2, fecha: p5.actualizado, nota: 'Se añadió el ejemplo de salida esperada y la sugerencia de variables', contenido: p5.contenido, variables: copiar(p5.variables) }
  ];

  return [p1, p2, p3, p4, p5];
}

/* ============================ 2. UTILIDADES ============================ */

function copiar(obj) { return JSON.parse(JSON.stringify(obj)); }

function ahoraISO() { return new Date().toISOString(); }

function capitalizar(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

/* Escapa texto del usuario antes de insertarlo como HTML (anti-inyección) */
function escapeHtml(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatearFecha(isoFecha, conHora = true) {
  try {
    const d = new Date(isoFecha);
    if (isNaN(d.getTime())) return 'fecha desconocida';
    const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!conHora) return fecha;
    const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return fecha + ' · ' + hora;
  } catch (err) {
    return String(isoFecha ?? '');
  }
}

/* Siguiente código ADSO-###: mayor número existente + 1, con 3 dígitos */
function siguienteId(lista) {
  let max = 0;
  (lista || []).forEach(p => {
    const m = /^ADSO-(\d+)$/.exec(p && p.id ? p.id : '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return 'ADSO-' + String(max + 1).padStart(3, '0');
}

/* Detecta marcadores {{nombre}} sin repetidos; nombres: minúsculas, números y guion bajo */
function detectarVariables(texto) {
  const nombres = [];
  const vistos = new Set();
  const expReg = /\{\{\s*([a-z0-9_]+)\s*\}\}/g;
  let coincidencia;
  while ((coincidencia = expReg.exec(String(texto ?? ''))) !== null) {
    if (!vistos.has(coincidencia[1])) {
      vistos.add(coincidencia[1]);
      nombres.push(coincidencia[1]);
    }
  }
  return nombres;
}

/* Número de la versión más reciente */
function versionActual(p) {
  return (p.versiones || []).reduce((max, v) => (v.numero > max ? v.numero : max), 0) || 1;
}

function versionDe(p, numero) {
  return (p.versiones || []).find(v => v.numero === numero) || null;
}

function buscarPrompt(id) {
  return prompts.find(p => p.id === id) || null;
}

/* Firma estable de las variables, para comparar cambios al editar */
function firmaVariables(variables) {
  return JSON.stringify((variables || []).map(v => ({
    nombre: v.nombre,
    descripcion: v.descripcion || '',
    defecto: v.defecto || ''
  })));
}

/* Arma el prompt final: reemplaza {{nombre}} solo si el campo tiene valor;
   lo vacío queda visible como {{nombre}} */
function construirPromptFinal(contenido, variables, valores) {
  let texto = String(contenido ?? '');
  (variables || []).forEach(v => {
    const valor = String((valores || {})[v.nombre] ?? '');
    if (valor.trim() !== '') {
      // Se reemplaza con función para que los "$" del valor no se interpreten
      texto = texto.replace(new RegExp('\\{\\{\\s*' + v.nombre + '\\s*\\}\\}', 'g'), () => valor);
    }
  });
  return texto;
}

function parsearEtiquetas(texto) {
  const vistas = new Set();
  return String(texto || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .filter(e => {
      const clave = e.toLowerCase();
      if (vistas.has(clave)) return false;
      vistas.add(clave);
      return true;
    });
}

/* Defensivo: completa campos faltantes de un prompt leído de localStorage */
function normalizarPrompt(p) {
  if (!p || typeof p !== 'object' || typeof p.id !== 'string' || !p.id) return null;
  const contenido = String(p.contenido ?? '');
  const creado = typeof p.creado === 'string' && p.creado ? p.creado : ahoraISO();
  const actualizado = typeof p.actualizado === 'string' && p.actualizado ? p.actualizado : creado;

  const variables = Array.isArray(p.variables)
    ? p.variables
        .filter(v => v && typeof v.nombre === 'string' && v.nombre)
        .map(v => ({ nombre: v.nombre, descripcion: String(v.descripcion ?? ''), defecto: String(v.defecto ?? '') }))
    : detectarVariables(contenido).map(n => ({ nombre: n, descripcion: '', defecto: '' }));

  let versiones = (Array.isArray(p.versiones) ? p.versiones : [])
    .filter(v => v && typeof v.numero === 'number')
    .map(v => ({
      numero: v.numero,
      fecha: v.fecha || creado,
      nota: String(v.nota ?? ''),
      contenido: String(v.contenido ?? contenido),
      variables: Array.isArray(v.variables) ? v.variables : copiar(variables)
    }))
    .sort((a, b) => a.numero - b.numero);
  if (!versiones.length) {
    versiones.push({ numero: 1, fecha: creado, nota: 'Versión inicial', contenido, variables: copiar(variables) });
  }

  return {
    id: p.id,
    titulo: String(p.titulo ?? 'Sin título').slice(0, 80),
    categoria: CATEGORIAS.includes(p.categoria) ? p.categoria : CATEGORIAS[0],
    estado: ESTADOS.includes(p.estado) ? p.estado : 'borrador',
    herramienta: HERRAMIENTAS.includes(p.herramienta) ? p.herramienta : HERRAMIENTAS[0],
    calificacion: Math.min(5, Math.max(1, parseInt(p.calificacion, 10) || 3)),
    favorito: !!p.favorito,
    etiquetas: Array.isArray(p.etiquetas) ? p.etiquetas.map(e => String(e)).filter(Boolean) : [],
    contenido,
    variables,
    notas: String(p.notas ?? ''),
    usos: parseInt(p.usos, 10) || 0,
    creado,
    actualizado,
    versiones
  };
}

/* Persistencia: siempre dentro de try/catch */
function cargarDatos() {
  let crudo = null;
  try { crudo = localStorage.getItem(CLAVE_PROMPTS); } catch (err) { crudo = null; }

  if (crudo === null) {
    // Primera apertura: cargar los 5 prompts de ejemplo
    prompts = datosEjemplo();
    guardarDatos();
    return;
  }
  try {
    const datos = JSON.parse(crudo);
    prompts = Array.isArray(datos) ? datos.map(normalizarPrompt).filter(Boolean) : [];
  } catch (err) {
    prompts = []; // almacenamiento dañado: arrancar vacío sin romper la app
  }
  guardarDatos();
}

function guardarDatos() {
  try {
    localStorage.setItem(CLAVE_PROMPTS, JSON.stringify(prompts));
  } catch (err) {
    mostrarToast('No se pudo guardar en el almacenamiento del navegador');
  }
}

function mostrarToast(mensaje) {
  const toast = document.getElementById('bp-toast');
  if (!toast) return;
  toast.innerHTML = `<i class="bi bi-check-circle-fill" aria-hidden="true"></i><span>${escapeHtml(mensaje)}</span>`;
  toast.classList.add('visible');
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove('visible'), 2800);
}

/* Portapapeles con respaldo para contextos sin navigator.clipboard */
function copiarAlPortapapeles(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(texto);
  }
  return new Promise((resolver, rechazar) => {
    try {
      const area = document.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      if (ok) resolver(); else rechazar(new Error('execCommand falló'));
    } catch (err) {
      rechazar(err);
    }
  });
}

/* ============================ 3. RENDER ============================ */

function estrellasHtml(n, extra = '') {
  const num = Math.min(5, Math.max(0, parseInt(n, 10) || 0));
  let html = `<span class="bp-estrellas ${extra}" role="img" aria-label="Calificación: ${num} de 5 estrellas" title="Calificación: ${num} de 5">`;
  for (let i = 1; i <= 5; i++) {
    html += `<i class="bi ${i <= num ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>`;
  }
  return html + '</span>';
}

function badgeEstadoHtml(e) {
  const seguro = ESTADOS.includes(e) ? e : 'borrador';
  return `<span class="bp-badge bp-badge-estado estado-${seguro}"><span class="bp-punto" aria-hidden="true"></span>${capitalizar(seguro)}</span>`;
}

/* Tarjeta de la lista: código, estrella de favorito, título, categoría y calificación */
function tarjetaHtml(p) {
  const activa = p.id === estado.seleccionado ? ' activa' : '';
  return `
  <div class="bp-card${activa}" data-action="seleccionar" data-id="${escapeHtml(p.id)}" tabindex="0" role="button"
       aria-label="Ver detalle de ${escapeHtml(p.id)}: ${escapeHtml(p.titulo)}">
    <div class="bp-card-supertop">
      <span class="bp-codigo">${escapeHtml(p.id)}</span>
      <button type="button" class="bp-fav-btn${p.favorito ? ' activo' : ''}" data-action="favorito" data-id="${escapeHtml(p.id)}"
              aria-pressed="${p.favorito ? 'true' : 'false'}"
              aria-label="${p.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}"
              title="${p.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}">
        <i class="bi ${p.favorito ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>
      </button>
    </div>
    <div class="bp-card-titulo">${escapeHtml(p.titulo)}</div>
    <div class="bp-card-meta">
      <span class="bp-chip">${escapeHtml(p.categoria)}</span>
      ${estrellasHtml(p.calificacion, 'sm')}
    </div>
  </div>`;
}

/* Buscador + filtros combinados, orden por actualización descendente */
function filtrarPrompts(mod) {
  const f = estado.filtros[mod] || estado.filtros.lista;
  const texto = (f.texto || '').trim().toLowerCase();
  let lista = prompts.slice();

  if (mod === 'favoritos') lista = lista.filter(p => p.favorito);

  if (texto) {
    lista = lista.filter(p =>
      p.id.toLowerCase().includes(texto) ||
      p.titulo.toLowerCase().includes(texto) ||
      (p.etiquetas || []).some(et => String(et).toLowerCase().includes(texto))
    );
  }
  if (f.categoria) lista = lista.filter(p => p.categoria === f.categoria);
  if (f.estado) lista = lista.filter(p => p.estado === f.estado);

  lista.sort((a, b) => new Date(b.actualizado) - new Date(a.actualizado)); // reciente → antiguo
  return lista;
}

function renderItems(mod) {
  const cont = document.getElementById('items-' + mod);
  const contador = document.getElementById('contador-' + mod);
  if (!cont) return;

  const lista = filtrarPrompts(mod);
  if (contador) contador.textContent = lista.length === 1 ? '1 resultado' : lista.length + ' resultados';

  if (!lista.length) {
    const f = estado.filtros[mod];
    let mensaje = 'Crea tu primer prompt con el botón «Nuevo prompt».';
    if (mod === 'favoritos' && !prompts.some(p => p.favorito)) {
      mensaje = 'Todavía no tienes favoritos. Marca uno con la estrella de la tarjeta o del detalle.';
    } else if (f && (f.texto || f.categoria || f.estado)) {
      mensaje = 'Ningún prompt coincide con la búsqueda o los filtros.';
    } else if (mod === 'favoritos') {
      mensaje = 'Ningún favorito coincide con los filtros.';
    }
    cont.innerHTML = `<div class="bp-vacio"><i class="bi ${mod === 'favoritos' ? 'bi-star' : 'bi-inbox'}" aria-hidden="true"></i>${escapeHtml(mensaje)}</div>`;
    return;
  }
  cont.innerHTML = lista.map(tarjetaHtml).join('');
}

/* Desplegable Historial (vN): versiones de la más nueva a la más antigua */
function historialHtml(p, numActual) {
  const versiones = (p.versiones || []).slice().sort((a, b) => b.numero - a.numero);
  const items = versiones.map(v => {
    const enRevision = estado.version !== null && estado.version === v.numero;
    const esLaActual = v.numero === numActual;
    const activa = enRevision || (estado.version === null && esLaActual);
    return `
    <li>
      <button type="button" class="dropdown-item bp-item-version${activa ? ' active' : ''}"
              data-action="ver-version" data-num="${v.numero}">
        <span class="bp-ver-num">v${v.numero}</span>
        <span class="bp-ver-info">
          <span>${formatearFecha(v.fecha)}</span>
          <span class="bp-ver-nota">${escapeHtml(v.nota)}</span>
        </span>
        ${esLaActual ? '<span class="bp-ver-actual">actual <i class="bi bi-check-lg" aria-hidden="true"></i></span>' : ''}
      </button>
    </li>`;
  }).join('');

  return `
  <div class="dropdown bp-historial">
    <button class="btn btn-sm bp-btn-historial dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" aria-label="Historial de versiones; versión actual ${numActual}">
      <i class="bi bi-clock-history" aria-hidden="true"></i> Historial (v${numActual})
    </button>
    <ul class="dropdown-menu dropdown-menu-end">${items}</ul>
  </div>`;
}

function detalleVacioHtml() {
  return `
  <div class="bp-vacio-detalle">
    <i class="bi bi-journal-text" aria-hidden="true"></i>
    <div class="bp-vacio-titulo">Selecciona un prompt de la lista</div>
    <p class="mb-0 small">Aquí verás el detalle, sus variables, el historial de versiones y las acciones disponibles.</p>
  </div>`;
}

/* Detalle de la versión actual: variables en vivo, prompt final, copiar, metadatos y acciones */
function detalleCompletoHtml(p, numActual) {
  const valores = estado.valores || {};
  const final = construirPromptFinal(p.contenido, p.variables, valores);
  const iconoHerr = ICONOS_HERRAMIENTA[p.herramienta] || 'bi-robot';

  const bloqueVariables = (p.variables && p.variables.length) ? `
    <div class="row g-2 mb-3">
      ${p.variables.map(v => {
        const valor = String(valores[v.nombre] ?? v.defecto ?? '');
        return `
        <div class="col-12 col-md-6">
          <span class="bp-var-label"><code>{{${escapeHtml(v.nombre)}}}</code></span>
          ${v.descripcion ? `<span class="bp-var-desc">${escapeHtml(v.descripcion)}</span>` : ''}
          <input type="text" class="form-control form-control-sm mt-1" data-var="${escapeHtml(v.nombre)}"
                 value="${escapeHtml(valor)}" placeholder="Valor de {{${escapeHtml(v.nombre)}}}"
                 aria-label="Valor de la variable ${escapeHtml(v.nombre)}" autocomplete="off">
        </div>`;
      }).join('')}
    </div>
    <p class="bp-texto-sec small mb-2">Los campos vacíos dejan visible el marcador <code>{{nombre}}</code> en el prompt final.</p>`
    : `<p class="bp-texto-sec small">Este prompt no tiene variables: se copia tal como está.</p>`;

  return `
  <button type="button" class="btn btn-sm bp-btn-volver d-md-none mb-3" data-action="volver">
    <i class="bi bi-arrow-left" aria-hidden="true"></i> Volver
  </button>

  <div class="bp-det-cabecera">
    <div class="bp-det-cabecera-izq">
      <div class="bp-det-codigo">${escapeHtml(p.id)} <span class="bp-sep">·</span> ${escapeHtml(p.categoria)}</div>
      <h2 class="bp-det-titulo">${escapeHtml(p.titulo)}</h2>
      <div class="bp-det-badges">
        ${badgeEstadoHtml(p.estado)}
        <span class="bp-badge bp-badge-herr"><i class="bi ${iconoHerr}" aria-hidden="true"></i>${escapeHtml(p.herramienta)}</span>
        ${estrellasHtml(p.calificacion)}
        ${p.favorito ? '<span class="bp-badge bp-badge-herr"><i class="bi bi-star-fill" aria-hidden="true"></i>Favorito</span>' : ''}
      </div>
    </div>
    ${historialHtml(p, numActual)}
  </div>

  <div class="bp-seccion">
    <h3 class="bp-seccion-titulo"><i class="bi bi-sliders" aria-hidden="true"></i> Variables y prompt final</h3>
    ${bloqueVariables}
    <div class="bp-etiqueta-final">Prompt final</div>
    <pre class="bp-prompt bp-prompt-final">${escapeHtml(final)}</pre>
    <div class="d-flex flex-wrap align-items-center gap-2 mt-2">
      <button type="button" class="btn btn-primary btn-sm" data-action="copiar">
        <i class="bi bi-clipboard-check" aria-hidden="true"></i> Copiar prompt final
      </button>
      <span class="bp-texto-sec small"><i class="bi bi-clipboard-data" aria-hidden="true"></i> Usado ${p.usos} vez(es)</span>
    </div>
  </div>

  <div class="bp-seccion">
    <h3 class="bp-seccion-titulo"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Contenido original</h3>
    <pre class="bp-prompt">${escapeHtml(p.contenido)}</pre>
  </div>

  <div class="bp-seccion">
    <h3 class="bp-seccion-titulo"><i class="bi bi-journal-text" aria-hidden="true"></i> Notas de resultado</h3>
    ${p.notas
      ? `<p class="bp-notas">${escapeHtml(p.notas)}</p>`
      : '<p class="bp-texto-sec small mb-0">Sin notas todavía. Edita el prompt para registrar cómo responde la herramienta.</p>'}
  </div>

  ${(p.etiquetas && p.etiquetas.length) ? `
  <div class="bp-seccion">
    <h3 class="bp-seccion-titulo"><i class="bi bi-tags" aria-hidden="true"></i> Etiquetas</h3>
    <div class="bp-etiquetas">${p.etiquetas.map(t => `<span class="bp-chip bp-chip-etiqueta"><i class="bi bi-hash" aria-hidden="true"></i>${escapeHtml(t)}</span>`).join('')}</div>
  </div>` : ''}

  <div class="bp-det-meta">
    <span><i class="bi bi-clipboard-data" aria-hidden="true"></i>Usos: <strong>${p.usos}</strong></span>
    <span><i class="bi bi-calendar-plus" aria-hidden="true"></i>Creado: ${formatearFecha(p.creado, false)}</span>
    <span><i class="bi bi-calendar-check" aria-hidden="true"></i>Actualizado: ${formatearFecha(p.actualizado)}</span>
    <span><i class="bi bi-clock-history" aria-hidden="true"></i>Versión actual: <strong>v${numActual}</strong> de ${p.versiones.length}</span>
  </div>

  <div class="bp-det-acciones">
    <button type="button" class="btn btn-primary" data-action="editar"><i class="bi bi-pencil-square" aria-hidden="true"></i> Editar</button>
    <button type="button" class="btn ${p.favorito ? 'btn-outline-primary' : 'btn-outline-secondary'}" data-action="favorito"
            data-id="${escapeHtml(p.id)}" aria-pressed="${p.favorito ? 'true' : 'false'}">
      <i class="bi ${p.favorito ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i> ${p.favorito ? 'Quitar favorito' : 'Marcar favorito'}
    </button>
    <button type="button" class="btn btn-outline-danger" data-action="eliminar" data-id="${escapeHtml(p.id)}">
      <i class="bi bi-trash3" aria-hidden="true"></i> Eliminar
    </button>
  </div>`;
}

/* Detalle de una versión antigua: solo lectura, con Restaurar y Volver a la actual */
function detalleVersionHtml(p, v, numActual) {
  return `
  <button type="button" class="btn btn-sm bp-btn-volver d-md-none mb-3" data-action="volver">
    <i class="bi bi-arrow-left" aria-hidden="true"></i> Volver
  </button>

  <div class="bp-det-cabecera">
    <div class="bp-det-cabecera-izq">
      <div class="bp-det-codigo">${escapeHtml(p.id)} <span class="bp-sep">·</span> ${escapeHtml(p.categoria)}</div>
      <h2 class="bp-det-titulo">${escapeHtml(p.titulo)}</h2>
    </div>
    ${historialHtml(p, numActual)}
  </div>

  <div class="bp-alert-version" role="alert">
    <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
    <div>
      Estás viendo la <strong>versión ${v.numero}</strong> en <strong>solo lectura</strong>. La versión actual es la <strong>v${numActual}</strong>.<br>
      <span class="bp-texto-sec small">${formatearFecha(v.fecha)} · ${escapeHtml(v.nota)}</span>
    </div>
  </div>

  <div class="bp-seccion">
    <h3 class="bp-seccion-titulo"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Contenido de la versión ${v.numero}</h3>
    <pre class="bp-prompt">${escapeHtml(v.contenido)}</pre>
  </div>

  <div class="d-flex flex-wrap gap-2 mt-4">
    <button type="button" class="btn btn-primary" data-action="restaurar">
      <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Restaurar
    </button>
    <button type="button" class="btn btn-outline-secondary" data-action="volver-actual">
      <i class="bi bi-arrow-return-left" aria-hidden="true"></i> Volver a la actual
    </button>
  </div>`;
}

function renderDetalle(mod) {
  const cont = document.getElementById('detalle-' + mod);
  if (!cont) return;
  const p = buscarPrompt(estado.seleccionado);
  if (!p) { cont.innerHTML = detalleVacioHtml(); return; }

  const numActual = versionActual(p);
  // Si la versión en revisión ya no existe o es la actual, se vuelve a la vista normal
  if (estado.version !== null && (estado.version >= numActual || !versionDe(p, estado.version))) {
    estado.version = null;
  }
  cont.innerHTML = estado.version !== null
    ? detalleVersionHtml(p, versionDe(p, estado.version), numActual)
    : detalleCompletoHtml(p, numActual);
}

/* Estadísticas en vivo desde los datos reales */
function filaStat(nombre, cantidad, porcentaje, claseBarra) {
  return `
  <div class="bp-stat-fila">
    <div class="bp-stat-label">
      <span>${escapeHtml(nombre)}</span>
      <span class="bp-stat-cant">${cantidad} <small>(${porcentaje}%)</small></span>
    </div>
    <div class="progress bp-progress" role="progressbar" aria-label="${escapeHtml(nombre)}: ${cantidad} de ${prompts.length}"
         aria-valuenow="${cantidad}" aria-valuemin="0" aria-valuemax="${Math.max(prompts.length, 1)}">
      <div class="progress-bar${claseBarra ? ' ' + claseBarra : ''}" style="width:${porcentaje}%"></div>
    </div>
  </div>`;
}

function renderEstadisticas() {
  const cont = document.getElementById('stats-content');
  if (!cont) return;
  const total = prompts.length;
  const favoritos = prompts.filter(p => p.favorito).length;
  const porcentaje = n => (total > 0 ? Math.round((n / total) * 100) : 0);

  const porCategoria = CATEGORIAS.map(cat => {
    const n = prompts.filter(p => p.categoria === cat).length;
    return filaStat(cat, n, porcentaje(n), '');
  }).join('');

  const porEstado = ESTADOS.map(est => {
    const n = prompts.filter(p => p.estado === est).length;
    return filaStat(capitalizar(est), n, porcentaje(n), 'estado-' + est);
  }).join('');

  const sinDatos = '<p class="bp-texto-sec small mb-0">Aún no hay prompts para graficar.</p>';

  cont.innerHTML = `
  <div class="mb-4">
    <h1>Estadísticas</h1>
    <p class="bp-texto-sec small mb-0">Resumen en vivo de tu biblioteca local.</p>
  </div>

  <div class="row g-3 mb-4">
    <div class="col-6 col-xl-3">
      <div class="bp-stat-card">
        <div class="bp-stat-numero">${total}</div>
        <div class="bp-stat-nombre"><i class="bi bi-collection" aria-hidden="true"></i> Total de prompts</div>
      </div>
    </div>
    <div class="col-6 col-xl-3">
      <div class="bp-stat-card">
        <div class="bp-stat-numero">${favoritos}</div>
        <div class="bp-stat-nombre"><i class="bi bi-star-fill" aria-hidden="true"></i> Favoritos</div>
      </div>
    </div>
  </div>

  <div class="row g-4">
    <div class="col-lg-6">
      <div class="bp-panel">
        <h2>Prompts por categoría</h2>
        ${total > 0 ? porCategoria : sinDatos}
      </div>
    </div>
    <div class="col-lg-6">
      <div class="bp-panel">
        <h2>Prompts por estado</h2>
        ${total > 0 ? porEstado : sinDatos}
      </div>
    </div>
  </div>`;
}

/* Cambia el módulo visible en la zona derecha */
function cambiarModulo(mod) {
  if (!['lista', 'favoritos', 'estadisticas'].includes(mod)) mod = 'lista';
  estado.modulo = mod;

  document.querySelectorAll('.bp-view').forEach(v => {
    v.classList.toggle('d-none', v.id !== 'view-' + mod);
    v.classList.remove('show-detail'); // en móvil siempre se entra por la lista
  });
  document.querySelectorAll('.bp-nav-item').forEach(b => {
    const activo = b.dataset.modulo === mod;
    b.classList.toggle('activo', activo);
    if (activo) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });

  if (mod === 'estadisticas') renderEstadisticas();
  else { renderItems(mod); renderDetalle(mod); }
}

function refrescarVistaActual() {
  if (estado.modulo === 'estadisticas') renderEstadisticas();
  else { renderItems(estado.modulo); renderDetalle(estado.modulo); }
}

/* ============================ 4. EVENTOS ============================ */

function iniciarValores(p) {
  estado.valores = {};
  (p.variables || []).forEach(v => { estado.valores[v.nombre] = v.defecto || ''; });
}

function seleccionarPrompt(id) {
  const p = buscarPrompt(id);
  if (!p) return;
  if (estado.seleccionado !== id) {
    estado.seleccionado = id;
    estado.version = null;
    iniciarValores(p);
  }
  renderItems(estado.modulo);
  renderDetalle(estado.modulo);

  // En móvil el detalle reemplaza a la lista a pantalla completa
  if (window.matchMedia('(max-width: 767.98px)').matches) {
    const vista = document.getElementById('view-' + estado.modulo);
    if (vista) { vista.classList.add('show-detail'); window.scrollTo({ top: 0 }); }
  }
}

function ocultarDetalleMovil() {
  const vista = document.getElementById('view-' + estado.modulo);
  if (vista) vista.classList.remove('show-detail');
}

function alternarFavorito(id) {
  const p = buscarPrompt(id);
  if (!p) return;
  p.favorito = !p.favorito;
  guardarDatos();
  renderItems(estado.modulo);
  if (estado.seleccionado === p.id) renderDetalle(estado.modulo);
  if (estado.modulo === 'estadisticas') renderEstadisticas();
  mostrarToast(p.favorito ? `${p.id} marcado como favorito` : `${p.id} ya no es favorito`);
}

/* Copia el prompt final rellenado y suma 1 al contador de usos */
async function copiarPromptFinal() {
  const p = buscarPrompt(estado.seleccionado);
  if (!p) return;
  const texto = construirPromptFinal(p.contenido, p.variables, estado.valores);
  try {
    await copiarAlPortapapeles(texto);
  } catch (err) {
    mostrarToast('El navegador no permitió copiar al portapapeles');
    return;
  }
  p.usos = (p.usos || 0) + 1;
  guardarDatos();
  renderDetalle(estado.modulo);
  mostrarToast('Prompt copiado · usos: ' + p.usos);
}

function verVersion(numero) {
  const p = buscarPrompt(estado.seleccionado);
  if (!p || !Number.isFinite(numero)) return;
  estado.version = numero >= versionActual(p) ? null : numero;
  renderDetalle(estado.modulo);
  const cont = document.getElementById('detalle-' + estado.modulo);
  if (cont) cont.scrollTop = 0;
}

/* Restaurar: crea una versión nueva con el contenido de la antigua */
function restaurarVersion() {
  const p = buscarPrompt(estado.seleccionado);
  if (!p || estado.version === null) return;
  const v = versionDe(p, estado.version);
  if (!v) return;

  const nuevoNumero = versionActual(p) + 1;
  p.versiones.push({
    numero: nuevoNumero,
    fecha: ahoraISO(),
    nota: `Restaurada desde v${v.numero}`,
    contenido: v.contenido,
    variables: copiar(v.variables || [])
  });
  p.contenido = v.contenido;
  p.variables = copiar(v.variables || []);
  p.actualizado = ahoraISO();
  estado.version = null;
  iniciarValores(p);
  guardarDatos();
  renderItems(estado.modulo);
  renderDetalle(estado.modulo);
  mostrarToast(`Contenido restaurado como v${nuevoNumero}`);
}

/* ---------- Modal crear / editar ---------- */

function pintarCalificacionModal() {
  document.querySelectorAll('#f-calificacion .bp-star-btn').forEach(btn => {
    const valor = parseInt(btn.dataset.valor, 10) || 0;
    const activa = valor <= estado.calificacionModal;
    btn.classList.toggle('rellena', activa);
    btn.setAttribute('aria-pressed', activa ? 'true' : 'false');
    const icono = btn.querySelector('i');
    if (icono) icono.className = 'bi ' + (activa ? 'bi-star-fill' : 'bi-star');
  });
  const txt = document.getElementById('f-calificacion-texto');
  if (txt) txt.textContent = estado.calificacionModal + ' de 5';
}

function pintarVariablesModal() {
  const cont = document.getElementById('modal-variables');
  if (!cont) return;
  const vars = estado.variablesModal;

  if (!vars.length) {
    cont.innerHTML = `<div class="bp-vars-editor bp-vars-vacio">
      <i class="bi bi-braces" aria-hidden="true"></i> Sin variables detectadas.
      Puedes añadir marcadores como <code>{{tema}}</code> dentro del contenido.
    </div>`;
    return;
  }

  cont.innerHTML = `
  <div class="bp-vars-editor">
    <div class="bp-vars-editor-titulo"><i class="bi bi-braces" aria-hidden="true"></i> Variables detectadas (${vars.length})</div>
    ${vars.map(v => `
      <div class="bp-var-row">
        <div class="bp-var-nombre"><code>{{${escapeHtml(v.nombre)}}}</code></div>
        <div class="row g-2">
          <div class="col-sm-6">
            <span class="bp-var-label">Descripción</span>
            <input type="text" class="form-control form-control-sm" value="${escapeHtml(v.descripcion)}"
                   data-var-nombre="${escapeHtml(v.nombre)}" data-var-campo="descripcion"
                   aria-label="Descripción de la variable ${escapeHtml(v.nombre)}" autocomplete="off">
          </div>
          <div class="col-sm-6">
            <span class="bp-var-label">Valor por defecto</span>
            <input type="text" class="form-control form-control-sm" value="${escapeHtml(v.defecto)}"
                   data-var-nombre="${escapeHtml(v.nombre)}" data-var-campo="defecto"
                   aria-label="Valor por defecto de la variable ${escapeHtml(v.nombre)}" autocomplete="off">
          </div>
        </div>
      </div>`).join('')}
  </div>`;
}

/* Redetecta las variables del contenido conservando descripciones y defectos ya escritos */
function sincronizarVariablesModal() {
  const contenido = document.getElementById('f-contenido').value;
  const nombres = detectarVariables(contenido);
  estado.variablesModal = nombres.map(nombre => {
    const anterior = estado.variablesModal.find(v => v.nombre === nombre);
    return anterior
      ? { nombre, descripcion: anterior.descripcion, defecto: anterior.defecto }
      : { nombre, descripcion: '', defecto: '' };
  });
  pintarVariablesModal();
}

function marcarInvalido(id, esInvalido) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.classList.toggle('is-invalid', esInvalido);
  return !esInvalido;
}

function abrirModalPrompt(id) {
  const p = id ? buscarPrompt(id) : null;
  estado.editandoId = p ? p.id : null;

  ['f-titulo', 'f-categoria', 'f-contenido'].forEach(fid => {
    const el = document.getElementById(fid);
    if (el) el.classList.remove('is-invalid');
  });

  document.getElementById('modal-prompt-label').textContent = p ? 'Editar prompt' : 'Nuevo prompt';
  document.getElementById('f-titulo').value = p ? p.titulo : '';
  document.getElementById('f-categoria').value = p ? p.categoria : '';
  document.getElementById('f-estado').value = p ? p.estado : 'borrador';
  document.getElementById('f-herramienta').value = p ? p.herramienta : HERRAMIENTAS[0];
  document.getElementById('f-favorito').checked = p ? !!p.favorito : false;
  document.getElementById('f-etiquetas').value = p ? (p.etiquetas || []).join(', ') : '';
  document.getElementById('f-contenido').value = p ? p.contenido : '';
  document.getElementById('f-notas').value = p ? p.notas : '';
  document.getElementById('f-nota-version').value = '';
  document.getElementById('grupo-nota-version').classList.toggle('d-none', !p);

  estado.calificacionModal = p ? (p.calificacion || 3) : 3;
  estado.variablesModal = p ? copiar(p.variables) : [];
  pintarCalificacionModal();
  sincronizarVariablesModal();

  modalPrompt.show();
  setTimeout(() => document.getElementById('f-titulo').focus(), 300);
}

function manejarGuardado(e) {
  e.preventDefault();

  const titulo = document.getElementById('f-titulo').value.trim();
  const categoria = document.getElementById('f-categoria').value;
  const contenido = document.getElementById('f-contenido').value;
  const notaVersion = document.getElementById('f-nota-version').value.trim();
  const etiquetas = parsearEtiquetas(document.getElementById('f-etiquetas').value);

  // Validación: título, una sola categoría (select) y contenido
  let valido = true;
  if (!marcarInvalido('f-titulo', titulo === '')) valido = false;
  if (!marcarInvalido('f-categoria', categoria === '')) valido = false;
  if (!marcarInvalido('f-contenido', contenido.trim() === '')) valido = false;
  if (!valido) return;

  const meta = {
    titulo: titulo.slice(0, 80),
    categoria,
    estado: document.getElementById('f-estado').value || 'borrador',
    herramienta: document.getElementById('f-herramienta').value || HERRAMIENTAS[0],
    calificacion: Math.min(5, Math.max(1, estado.calificacionModal || 1)),
    favorito: document.getElementById('f-favorito').checked,
    etiquetas,
    notas: document.getElementById('f-notas').value.trim()
  };
  const variables = copiar(estado.variablesModal);

  if (estado.editandoId) {
    const p = buscarPrompt(estado.editandoId);
    if (!p) return;

    // Solo se crea versión si cambió el contenido o sus variables
    const cambioContenido = p.contenido !== contenido || firmaVariables(p.variables) !== firmaVariables(variables);
    Object.assign(p, meta);
    p.actualizado = ahoraISO();

    if (cambioContenido) {
      p.contenido = contenido;
      p.variables = variables;
      p.versiones.push({
        numero: versionActual(p) + 1,
        fecha: p.actualizado,
        nota: notaVersion || 'Edición',
        contenido,
        variables: copiar(variables)
      });
      mostrarToast(`Guardado · nueva versión v${versionActual(p)}`);
    } else {
      mostrarToast('Cambios guardados (sin nueva versión)');
    }
    estado.seleccionado = p.id;
    estado.version = null;
    iniciarValores(p);
  } else {
    const nuevo = Object.assign({ id: siguienteId(prompts) }, meta, {
      contenido,
      variables,
      usos: 0,
      creado: ahoraISO(),
      actualizado: ahoraISO(),
      versiones: []
    });
    nuevo.versiones = [{ numero: 1, fecha: nuevo.creado, nota: 'Versión inicial', contenido, variables: copiar(variables) }];
    prompts.push(nuevo);
    estado.seleccionado = nuevo.id;
    estado.version = null;
    iniciarValores(nuevo);
    mostrarToast(`Prompt ${nuevo.id} creado`);
  }

  guardarDatos();
  modalPrompt.hide();
  refrescarVistaActual();
}

/* ---------- Modal eliminar ---------- */

function abrirModalEliminar(id) {
  const p = buscarPrompt(id);
  if (!p) return;
  estado.idPorEliminar = id;
  document.getElementById('eliminar-texto').innerHTML =
    `¿Eliminar <strong>${escapeHtml(p.id)} · ${escapeHtml(p.titulo)}</strong>?<br>
     <span class="bp-texto-sec small">Se perderán sus ${p.versiones.length} versión(es). Esta acción no se puede deshacer.</span>`;
  modalEliminar.show();
}

function eliminarPrompt(id) {
  const p = buscarPrompt(id);
  prompts = prompts.filter(x => x.id !== id);
  if (estado.seleccionado === id) {
    estado.seleccionado = null;
    estado.version = null;
    estado.valores = {};
  }
  estado.idPorEliminar = null;
  guardarDatos();
  if (modalEliminar) modalEliminar.hide();
  refrescarVistaActual();
  mostrarToast(p ? `Prompt ${p.id} eliminado` : 'Prompt eliminado');
}

/* ---------- Enlaces de eventos (una sola vez, con delegación) ---------- */

function bindEventos() {
  // Módulos del menú lateral
  document.querySelectorAll('.bp-nav-item').forEach(btn => {
    btn.addEventListener('click', () => cambiarModulo(btn.dataset.modulo));
  });

  // Tema claro/oscuro
  document.getElementById('btn-tema').addEventListener('click', alternarTema);

  // Buscador, filtros y botón nuevo en cada panel maestro
  ['lista', 'favoritos'].forEach(mod => {
    const buscador = document.getElementById('buscar-' + mod);
    buscador.addEventListener('input', () => {
      estado.filtros[mod].texto = buscador.value;
      renderItems(mod); // solo se re-dibujan las tarjetas: el input conserva el foco
    });
    const selCat = document.getElementById('filtro-categoria-' + mod);
    selCat.addEventListener('change', () => { estado.filtros[mod].categoria = selCat.value; renderItems(mod); });
    const selEst = document.getElementById('filtro-estado-' + mod);
    selEst.addEventListener('change', () => { estado.filtros[mod].estado = selEst.value; renderItems(mod); });
    document.getElementById('btn-nuevo-' + mod).addEventListener('click', () => abrirModalPrompt(null));
  });

  // Acciones delegadas: tarjetas y detalle se re-dibujan constantemente
  document.addEventListener('click', e => {
    const origen = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
    if (!origen) return;
    const accion = origen.dataset.action;

    if (accion === 'seleccionar') seleccionarPrompt(origen.dataset.id);
    else if (accion === 'favorito') alternarFavorito(origen.dataset.id || estado.seleccionado);
    else if (accion === 'copiar') copiarPromptFinal();
    else if (accion === 'editar') abrirModalPrompt(estado.seleccionado);
    else if (accion === 'eliminar') abrirModalEliminar(origen.dataset.id || estado.seleccionado);
    else if (accion === 'ver-version') verVersion(parseInt(origen.dataset.num, 10));
    else if (accion === 'restaurar') restaurarVersion();
    else if (accion === 'volver-actual') { estado.version = null; renderDetalle(estado.modulo); }
    else if (accion === 'volver') ocultarDetalleMovil();
  });

  // Teclado: Enter o Espacio sobre una tarjeta
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tarjeta = e.target && e.target.closest ? e.target.closest('.bp-card') : null;
    if (tarjeta && e.target === tarjeta) {
      e.preventDefault();
      seleccionarPrompt(tarjeta.dataset.id);
    }
  });

  // Detalle: el prompt final se actualiza en vivo al escribir en una variable
  document.addEventListener('input', e => {
    const campo = e.target && e.target.closest ? e.target.closest('input[data-var]') : null;
    if (!campo || !campo.closest('.bp-detalle')) return;
    const p = buscarPrompt(estado.seleccionado);
    if (!p) return;
    estado.valores[campo.dataset.var] = campo.value;
    const bloqueFinal = campo.closest('.bp-detalle').querySelector('.bp-prompt-final');
    if (bloqueFinal) bloqueFinal.textContent = construirPromptFinal(p.contenido, p.variables, estado.valores);
  });

  // Modal crear/editar
  document.getElementById('form-prompt').addEventListener('submit', manejarGuardado);
  document.getElementById('f-contenido').addEventListener('input', sincronizarVariablesModal);
  document.getElementById('modal-variables').addEventListener('input', e => {
    const inp = e.target && e.target.closest ? e.target.closest('[data-var-nombre]') : null;
    if (!inp) return;
    const fila = estado.variablesModal.find(v => v.nombre === inp.dataset.varNombre);
    if (!fila) return;
    if (inp.dataset.varCampo === 'descripcion') fila.descripcion = inp.value;
    else if (inp.dataset.varCampo === 'defecto') fila.defecto = inp.value;
  });
  document.querySelectorAll('#f-calificacion .bp-star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      estado.calificacionModal = Math.min(5, Math.max(1, parseInt(btn.dataset.valor, 10) || 1));
      pintarCalificacionModal();
    });
  });
  ['f-titulo', 'f-categoria', 'f-contenido'].forEach(fid => {
    document.getElementById(fid).addEventListener('input', () => {
      document.getElementById(fid).classList.remove('is-invalid');
    });
  });

  // Modal eliminar
  document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
    if (estado.idPorEliminar) eliminarPrompt(estado.idPorEliminar);
  });
}

/* ============================ 5. TEMA ============================ */

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-bs-theme', tema);
  const btn = document.getElementById('btn-tema');
  if (btn) {
    const oscuro = tema === 'dark';
    const icono = btn.querySelector('i');
    if (icono) icono.className = 'bi ' + (oscuro ? 'bi-sun-fill' : 'bi-moon-stars-fill');
    const texto = btn.querySelector('span');
    if (texto) texto.textContent = oscuro ? 'Tema claro' : 'Tema oscuro';
    btn.setAttribute('aria-label', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  }
  try { localStorage.setItem(CLAVE_TEMA, tema); } catch (err) { /* almacenamiento no disponible */ }
}

function alternarTema() {
  const actual = document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'light' : 'dark';
  aplicarTema(actual === 'dark' ? 'light' : 'dark');
}

function cargarTema() {
  let tema = 'dark'; // el tema oscuro es el predeterminado
  try { tema = localStorage.getItem(CLAVE_TEMA) || 'dark'; } catch (err) { tema = 'dark'; }
  if (tema !== 'light' && tema !== 'dark') tema = 'dark';
  aplicarTema(tema);
}

/* ============================ 6. INICIO ============================ */

function poblarSelects() {
  const opcionesCat = CATEGORIAS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  const opcionesEst = ESTADOS.map(e => `<option value="${e}">${capitalizar(e)}</option>`).join('');

  ['lista', 'favoritos'].forEach(mod => {
    document.getElementById('filtro-categoria-' + mod).innerHTML = '<option value="">Todas las categorías</option>' + opcionesCat;
    document.getElementById('filtro-estado-' + mod).innerHTML = '<option value="">Todos los estados</option>' + opcionesEst;
  });

  document.getElementById('f-categoria').innerHTML = '<option value="">Selecciona…</option>' + opcionesCat;
  document.getElementById('f-estado').innerHTML = opcionesEst;
  document.getElementById('f-herramienta').innerHTML = HERRAMIENTAS.map(h => `<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`).join('');
}

function iniciar() {
  cargarTema();
  cargarDatos();
  poblarSelects();

  // Las instancias de modal se crean una sola vez
  if (window.bootstrap) {
    modalPrompt = new bootstrap.Modal(document.getElementById('modal-prompt'));
    modalEliminar = new bootstrap.Modal(document.getElementById('modal-eliminar'));
  }

  bindEventos();
  cambiarModulo('lista');
}

document.addEventListener('DOMContentLoaded', iniciar);

