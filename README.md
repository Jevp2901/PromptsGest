# PromptsGest · Biblioteca de Prompts

Aplicación web para **centralizar, catalogar, versionar y reutilizar prompts de IA**, pensada para llevar el ciclo de vida de cada prompt desde el borrador hasta su versión optimizada. Funciona 100 % en el navegador: sin backend, sin cuenta y sin instalación.

---

## 📌 Descripción del Proyecto

**PromptsGest** es una SPA estática que permite crear, organizar y mejorar prompts de forma iterativa. Los datos se guardan en `localStorage`, y el diseño sigue la identidad **"Editorial Dark"** (fondo oscuro con acento dorado, tema claro opcional).

---

## 🚀 Características Principales

* **Centralización y catalogación:** prompts organizados por categoría y estado (borrador · probado · optimizado).
* **Variables dinámicas:** al escribir en una variable, el *prompt final* se actualiza en vivo y se puede copiar (con contador de usos).
* **Historial y versionado:** consulta y restaura versiones anteriores de cada prompt.
* **CRUD con validaciones:** crear, editar y eliminar prompts.
* **Búsqueda y filtros combinados**, más **favoritos** con estrella.
* **Módulos:** Lista, Favoritos y Estadísticas.
* **Tema claro/oscuro** con persistencia.
* **Responsive y accesible:** foco visible, contraste AA y soporte de `prefers-reduced-motion`.

---

## 🛠️ Tecnologías Utilizadas

* **Estructura:** HTML5 semántico
* **Estilos:** CSS3 con variables personalizadas (`--bp-*`) + Bootstrap 5.3.3 y Bootstrap Icons 1.11.3 (CDN)
* **Tipografías:** Playfair Display, Inter y JetBrains Mono (Google Fonts)
* **Lógica:** JavaScript vanilla (ES6+)
* **Persistencia:** `localStorage` (`bp_prompts`, `bp_tema`)

Sin frameworks, bundlers ni paso de build.

---

## ▶️ Cómo ejecutarlo

1. Clona o descarga el repositorio.
2. Abre `index.html` con doble clic o con la extensión **Live Server**.
3. Necesitas internet la primera vez para cargar las CDN (Bootstrap, iconos y fuentes).

---

## 📁 Estructura del proyecto

```
/
├── index.html        # Documento HTML único + modales Bootstrap
├── css/styles.css    # Sistema de diseño completo
├── js/app.js         # Lógica: datos, render, eventos, tema
├── AGENTS.md         # Guía para agentes de IA
├── MEMORY.md         # Registro cronológico de sesiones
└── README.md
```

---

## 🧪 Cómo probar cambios

1. Abre `index.html` y verifica que la consola de DevTools esté limpia.
2. Recorre: cambiar de módulo, copiar el prompt final, restaurar una versión del historial, crear/editar/eliminar, alternar tema, recargar y filtrar.
3. Revisa el responsive en 360 px, 768 px y 1280 px.

Más detalles en [`AGENTS.md`](./AGENTS.md).

---

## 📄 Licencia

Proyecto de aprendizaje, uso educativo.