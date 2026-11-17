#!/bin/bash
# Publica el nuevo sitio de GA Risk Capital en Netlify.
# 1) Baja del sitio ACTUAL el logo y las imágenes (antes de reemplazarlo).
# 2) Publica la carpeta site/ en producción.
set -e
cd "$(dirname "$0")/site"
for f in logo.png favicon.png apple-touch-icon.png about.jpg; do
  if [ ! -s "assets/$f" ]; then
    echo "Bajando $f ..."
    curl -fsSL -o "assets/$f" "https://gariskcapital.com/$f"
  fi
done
echo "Imágenes listas:"; ls -la assets
netlify deploy --dir . --site 182dc4f7-1959-4735-941d-e9c919736eb6 --prod --no-build
