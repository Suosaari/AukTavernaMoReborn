#!/bin/sh
set -eu

if [ -n "${BACKEND_UPSTREAM:-}" ]; then
  export BACKEND_UPSTREAM="${BACKEND_UPSTREAM%/}"
  envsubst '${BACKEND_UPSTREAM}' < /etc/nginx/templates/default.proxy.conf.template > /etc/nginx/conf.d/default.conf
else
  cp /etc/nginx/conf.d/default.static.conf /etc/nginx/conf.d/default.conf
fi

exec "$@"
