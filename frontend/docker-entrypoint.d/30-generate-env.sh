#!/bin/sh
set -eu

escape_js_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

escape_sed_replacement() {
  printf '%s' "$1" | sed 's/[&|]/\\&/g'
}

api_base_url="${API_BASE_URL:-http://localhost:8080}"
site_url="${SITE_URL:-}"
site_url="${site_url%/}"
escaped_api_base_url="$(escape_js_string "$api_base_url")"

cat > /usr/share/nginx/html/env.js <<EOF
window.__APP_CONFIG__ = {
  API_BASE_URL: "$escaped_api_base_url"
};
EOF

if [ -n "$site_url" ]; then
  escaped_site_url="$(escape_sed_replacement "$site_url")"

  sed -i \
    -e "s|content=\"/camping-banner.png\"|content=\"$escaped_site_url/camping-banner.png\"|g" \
    -e "s|content=\"/\"|content=\"$escaped_site_url/\"|" \
    /usr/share/nginx/html/index.html
fi
