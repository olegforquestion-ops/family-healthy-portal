#!/bin/sh
set -eu

if [ "${1:-}" = "node" ] && [ "${2:-}" = "server.js" ]; then
  exec node server.js
fi

exec "$@"
