#!/bin/bash
# Publica el sitio de GA Risk Capital en Netlify (gariskcapital.com).
# 1) Si faltan, baja el logo y las imágenes del sitio publicado.
# 2) Publica site/ y la función de indicadores en producción.
set -e
cd "$(dirname "$0")"
for f in logo.png favicon.png apple-touch-icon.png about.jpg; do
  if [ ! -s "site/assets/$f" ]; then
    echo "Bajando $f ..."
    curl -fsSL -o "site/assets/$f" "https://gariskcapital.com/assets/$f" \
      || curl -fsSL -o "site/assets/$f" "https://gariskcapital.com/$f"
  fi
done
echo "Imágenes listas:"; ls -la site/assets
npx --yes --cache /tmp/npm-ga netlify-cli deploy --dir site --functions netlify/functions \
  --site 182dc4f7-1959-4735-941d-e9c919736eb6 --prod --no-build
