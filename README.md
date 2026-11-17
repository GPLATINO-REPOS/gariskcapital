# GA Risk Capital — sitio web

Sitio estático (HTML/CSS/JS, sin build) de gariskcapital.com.

- `site/` — lo que se publica: inicio, `/solicitud-credito/`, `/aviso-privacidad/`, `_redirects` (`/r` → solicitud, `/simulador` → contacto).
- Formularios: Formspree (`main.js`). Agenda: Calendly.
- Pendiente antes de publicar: completar razón social y domicilio en `site/aviso-privacidad/index.html` (marcados en amarillo).

## Publicar
```bash
bash deploy.sh
```
Baja del sitio actual `logo.png`, `favicon.png`, `apple-touch-icon.png` y `about.jpg` a `site/assets/` si no existen, y publica `site/` en Netlify (producción).
