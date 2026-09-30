# MEMORY — Registro de sesiones

## Sesión 2026-09-30 (n.º 1)
**Objetivo de la sesión:** Analizar el diseño genérico del repositorio, aplicar
mejoras de prioridad Alta y Media con identidad propia ("Editorial Dark" con
acento dorado), crear AGENTS.md/MEMORY.md y verificar que la funcionalidad JS
queda intacta.

**Tareas realizadas:**
- [x] Fase 1: análisis del repo. Se encontró que `index.html` contenía un wrapper
      duplicado (segundo `<!DOCTYPE>`/`<html>` anidado dentro del primero) con el
      CSS incrustado en `<style>` y el JS en `<script>`, apuntando a rutas inexistentes.
- [x] Extracción y separación limpia en la estructura real declarada por el propio
      código: `index.html` + `css/styles.css` + `js/app.js` (elimina el HTML duplicado).
- [x] Fuentes: sustitución de fontsource CDN por **Google Fonts** (Inter, Playfair
      Display, JetBrains Mono) con `preconnect`, según stack permitido.
- [x] Tokens de diseño nuevos en `:root`: escala de espaciado (`--bp-espacio-1..6`),
      radios (`--bp-radio-sm/md/lg`) y sombras (`--bp-sombra-card/elevada/modal`)
      redefinidas por tema (claro/oscuro).
- [x] Escala tipográfica fija para h1–h6 (jerarquía consistente).
- [x] Estados e interacción: sombra base + elevación con hover en `.bp-card`,
      `.bp-stat-card` y `.bp-panel`; sombra de modal/dropdown/toast coherente con el tema.
- [x] Override de `.btn-outline-secondary` vía variables `--bs-btn-*` (antes gris
      azulado genérico de Bootstrap); radios unificados en `.btn/.form-control/.badge`.
- [x] Accesibilidad: skip link `visually-hidden-focusable`, bloque
      `prefers-reduced-motion`, foco visible dorado (ya existía, verificado).
- [x] Limpieza del artefacto `body{background:white}` heredado del wrapper (iframe).
- [x] Creación de `AGENTS.md` y `MEMORY.md`.
- [x] Verificación: `node --check js/app.js` OK; llaves CSS balanceadas (201/201);
      todos los IDs estáticos y dinámicos usados por JS presentes en el HTML;
      un único documento válido; diff JS = solo 2 líneas de comentario de encabezado.

**Archivos modificados/creados:**
- Modificado: `index.html` (paso de wrapper duplicado a documento único; Google Fonts; skip link).
- Creado: `css/styles.css` (todo el sistema de diseño + mejoras de esta sesión).
- Creado: `js/app.js` (lógica idéntica a la original; solo comentario de encabezado).
- Creado: `AGENTS.md`, `MEMORY.md`.

**Decisiones de diseño/técnicas:**
- Separar en 3 archivos porque el propio HTML/CSS/JS declaraban esas rutas
  (`css/styles.css`, `js/app.js`) y era el requisito del stack; elimina el
  documento doble inválido sin tocar una línea de lógica.
- Mantener la identidad "Editorial Dark" ya esbozada (dorado #d4af37 + serif
  editorial) porque da diferenciación frente a la plantilla Bootstrap azul;
  se completó con tokens formales (espaciado/radios/sombras) para dar coherencia.
- Personalizar Bootstrap solo con variables CSS (`--bs-*`, `--bs-btn-*`) y
  cargando styles.css después de bootstrap.min.css: evita `!important` y
  actualizaciones futuras seguras.
- Contraste AA: texto secundario y dorado aclarado/oscurecido por tema
  (`--bp-accento-texto` #8a6d12 en claro) — decisión preexistente verificada.
- Google Fonts en lugar de fontsource: permitido explícitamente por el usuario
  y con fallbacks serif/sans/monospace si el CDN falla.

**Problemas abiertos:**
- README.md describe un stack (React/Vite/Tailwind/Django) que no corresponde a
  este frontend estático; conviene alinearlos en una próxima sesión.
- La escala `--bp-espacio-*` está definida pero varios componentes aún usan
  valores literales; migrarlos es tarea de prioridad Baja.
- No probado en navegador real desde este entorno (verificación estática + sintáctica).

**Próximos pasos:**
- [ ] Migrar paddings/márgenes internos de componentes a `--bp-espacio-*`.
- [ ] Añadir microinteracciones sutiles (transición de tema con `color-scheme`, animación de entrada de tarjetas) respetando reduced-motion.
- [ ] Empty-state del módulo Estadísticas cuando hay 0 prompts (hoy muestra paneles vacíos).
- [ ] Actualizar README.md al stack real (HTML/CSS/Bootstrap 5 + JS vanilla).
- [ ] Probar manualmente en 360/768/1280 px y con Lighthouse (accesibilidad >95).
