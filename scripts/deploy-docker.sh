#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

checkDocker() {
  if command -v docker >/dev/null 2>&1; then
    return 0
  fi

  echo "Docker is not installed."
  echo ""
  echo "On Ubuntu/Debian run:"
  echo "  apt update"
  echo "  apt install -y docker.io docker-compose-v2"
  echo "  systemctl enable --now docker"
  echo ""
  exit 1
}

checkDockerCompose() {
  if docker compose version >/dev/null 2>&1; then
    return 0
  fi

  echo "Docker Compose plugin is not available."
  echo "Install it with: apt install -y docker-compose-v2"
  exit 1
}

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

checkDocker
checkDockerCompose

echo "Building and starting frontend on port ${FRONTEND_PORT:-1488}..."
docker compose up --build -d

FRONTEND_PORT="$(grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d= -f2 || true)"
FRONTEND_PORT="${FRONTEND_PORT:-1488}"

echo ""
echo "Done. Open http://localhost:${FRONTEND_PORT}"
echo "Logs: docker compose logs -f frontend"
