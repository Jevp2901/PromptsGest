# AGENTS.md — Guía para agentes de IA que trabajen en este repositorio

## 1. Descripción del proyecto y objetivo
**Biblioteca de Prompts (PromptsGest)**: SPA estática sin backend para guardar,
organizar, versionar y reutilizar prompts de IA. Los datos viven en
`localStorage` (claves `bp_prompts` y `bp_tema`). Objetivo actual del proyecto:
mantener la identidad de diseño "Editorial Dark" (fondo oscuro + acento dorado)
sin romper la funcionalidad, y seguir puliendo el sistema de diseño.

## 2. Stack y versiones
- HTML5 semántico (`lang="es"`, un solo `<!DOCTYPE>`).
- CSS3 con variables personalizadas (`--bp-*`) que mapean las de Bootstrap.
- **Bootstrap 5.3.3** vía CDN jsDelivr (CSS + bundle JS) y **Bootstrap Icons 1.11.3**.
- **Google Fonts**: Playfair Display (títulos), Inter (interfaz), JetBrains Mono (bloques de prompt).
- **JavaScript vanilla (ES6+)**, sin frameworks ni bundlers ni dependencias nuevas.
- No hay build: se abre `index.html` directamente o con Live Server.

## 3. Estructura de carpetas
```
/
├── index.html        # Único documento HTML: estructura semántica + modales Bootstrap
├── css/styles.css    # Sistema de diseño completo (paleta, tokens, componentes, responsive)
├── js/app.js         # Lógica de la app (datos, render, eventos, tema) — NO modificar sin necesidad
├── AGENTS.md         # Esta guía
├── MEMORY.md         # Registro cronológico de sesiones (más reciente arriba)
└── README.md         # Descripción del producto (PromptsGest)
```
Responsabilidad de `js/app.js` (secciones): 1) Datos · 2) Utilidades · 3) Render ·
4) Eventos · 5) Tema · 6) Inicio.

## 4. Sistema de diseño
**Paleta (regla 60-30-10: fondo / superficies / acento):**
| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| `--bp-fondo` | `#0d0d0f` | `#faf8f3` | 60% fondo general |
| `--bp-superficie` | `#16161a` | `#ffffff` | 30% sidebar, tarjetas, cabeceras |
| `--bp-superficie-elevada` | `#1e1e24` | `#f3efe6` | Bloques de prompt, hover |
| `--bp-accento` | `#d4af37` (dorado) | igual | 10% acciones, activo, foco |
| `--bp-accento-texto` | `#d4af37` | `#8a6d12` | Texto dorado con contraste AA |
| `--bp-peligro(-texto)` | `#c65d5d` / `#d47373` | `#c65d5d` / `#a34444` | Eliminar, inválido |
| Estados | borrador `#8b8b94` · probado `#6c8ebf` · optimizado `#5fa87a` | idem | Badges y barras |

**Tipografías:** títulos → Playfair Display (serif editorial); interfaz → Inter;
prompt/códigos → JetBrains Mono. Cada una con respaldo serif/sans/monospace.
Escala fija: h1 1.75rem, h2 1.4rem, h3 1.15rem, base .94rem.

**Espaciado (ritmo de 4 px):** `--bp-espacio-1..6` (.25/.5/.75/1/1.5/2.5rem).
**Radios:** `--bp-radio-sm .45rem` (controles), `-md .65rem` (tarjetas/dropdowns),
`-lg .9rem` (paneles/modales); chips/pills usan `999px`.
**Sombras:** `--bp-sombra-card`, `--bp-sombra-elevada`, `--bp-sombra-modal`,
redefinidas por tema (suaves en claro, profundas en oscuro).

**Componentes propios (prefijo `.bp-`):** sidebar (`bp-sidebar/bp-nav-item`),
master-detail (`bp-master/bp-items/bp-detalle`), tarjetas (`bp-card`), chips/badges
(`bp-chip`, `bp-badge-estado` con punto de color), estrellas (`bp-star-btn`),
bloque de prompt (`bp-prompt`), historial (`dropdown`), toast propio (`bp-toast`),
modales Bootstrap restilados vía variables `--bs-*`.

## 5. Convenciones de código
- Clases propias con prefijo `bp-` + sustantivo en español (`bp-btn-tema`,
  `bp-seccion-titulo`). Clases de estado: `.activo`, `.rellena`, `.show-detail`.
- Modificadores de color por estado como clases separadas: `.estado-borrador`,
  `.estado-probado`, `.estado-optimizado` (definen `--bp-color-estado`).
- Identadores HTML usados por JS: `view-*`, `items-*`, `detalle-*`, `contador-*`,
  `buscar-*`, `filtro-categoria-*`, `filtro-estado-*`, `btn-nuevo-*`, `f-*`,
  `modal-*`, `btn-tema`, `stats-content`, `bp-toast`. **Nunca renombrarlos.**
- Orden del CSS: 1) Paleta/tokens → 2) Base → 3) Estructura → 4) Componentes →
  5) Overrides Bootstrap → 6) Responsive → 7) Accesibilidad. Comentarios `/* --- */`
  por sección; indentación 2 espacios; comillas simples en JS.
- Personalizar Bootstrap SIEMPRE mediante sus variables CSS (`--bs-*`,
  `--bs-btn-*`) en reglas propias cargadas después de bootstrap.min.css.
  Prohibido `!important` fuera del bloque `prefers-reduced-motion`.
- Todo texto insertado por JS pasa por `escapeHtml()` (anti-inyección).

## 6. Reglas
**Se puede:** ajustar tokens/colores/radios/sombras en `css/styles.css`; añadir
componentes `.bp-*` nuevos; mejorar contrastes, estados hover/focus y responsive;
crear documentación.
**NO se puede:** cambiar la lógica de `js/app.js` (IDs, selectores, delegación de
eventos, claves de localStorage) sin justificación explícita en MEMORY.md; añadir
frameworks, Tailwind, bundlers o dependencias salvo Google Fonts/iconos; usar
`!important`; romper el único `<!DOCTYPE>`/`<html>` válido del documento; meter
HTML de la app dentro de `<style>`/`<script>` o viceversa; eliminar `alt`/`aria-*`.

## 7. Cómo probar cambios
1. Abrir `index.html` con doble clic (funciona en `file://`) o con Live Server.
2. DevTools → Console: debe estar limpia (sin errores 404 ni JS).
3. Recorrido funcional mínimo: cambiar módulo (Lista/Favoritos/Estadísticas),
   seleccionar tarjeta, escribir en una variable (el "prompt final" se actualiza
   en vivo), Copiar prompt final (↑ usos), abrir Historial y ver/restaurar v1,
   crear/editar/eliminar con validaciones, alternar tema claro/oscuro, recargar
   (persistencia), buscar y filtrar combinados.
4. Responsive: DevTools device toolbar en 360 px (menú superior, detalle a
   pantalla completa con "Volver"), 768 px y 1280 px.
5. Accesibilidad: tabulador recorre con foco dorado visible; comprobar contraste
   AA (herramienta Lighthouse/axe o cálculo manual); `prefers-reduced-motion` activa.

## 8. Protocolo de sesión
- **Al iniciar:** leer `MEMORY.md` (entrada superior = última sesión) y `AGENTS.md`.
- **Durante:** no asumir estados intermedios; verificar el repo con `git status`/lectura.
- **Al terminar:** añadir al inicio de `MEMORY.md` una entrada
  `## Sesión AAAA-MM-DD (n.º)` siguiendo exactamente su formato (objetivo, tareas
  `[x]`, archivos, decisiones con el porqué, problemas abiertos, próximos pasos `[ ]`).
