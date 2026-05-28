#!/bin/sh
set -eu

api_base_url="${API_BASE_URL:-http://localhost:8080}"
escaped_api_base_url="$(printf '%s' "$api_base_url" | sed 's/\\/\\\\/g; s/"/\\"/g')"

cat > /usr/share/nginx/html/env.js <<EOF
window.__APP_CONFIG__ = {
  API_BASE_URL: "$escaped_api_base_url"
};
EOF

