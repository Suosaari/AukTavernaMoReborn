<#
  Builds and starts the Pointauc frontend with Docker Compose.
  Windows-friendly mirror of scripts/deploy-docker.sh.

  Usage (from anywhere):
    pwsh scripts/deploy-docker.ps1
    # or in Windows PowerShell:
    powershell -ExecutionPolicy Bypass -File scripts/deploy-docker.ps1
#>
$ErrorActionPreference = 'Stop'

# Always run from the repository root, regardless of the caller's location.
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Test-DockerInstalled {
  if (Get-Command docker -ErrorAction SilentlyContinue) { return }
  Write-Host 'Docker is not installed or not on PATH.' -ForegroundColor Red
  Write-Host 'Install Docker Desktop: https://www.docker.com/products/docker-desktop/'
  exit 1
}

function Test-DockerCompose {
  docker compose version *> $null
  if ($LASTEXITCODE -eq 0) { return }
  Write-Host 'The Docker Compose plugin is not available. Update Docker Desktop.' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host 'Created .env from .env.example'
}

Test-DockerInstalled
Test-DockerCompose

# Resolve the published host port from .env (defaults to 1488).
$port = '1488'
$match = Select-String -Path .env -Pattern '^\s*FRONTEND_PORT\s*=\s*(\d+)' -ErrorAction SilentlyContinue |
  Select-Object -First 1
if ($match) { $port = $match.Matches[0].Groups[1].Value }

Write-Host "Building and starting frontend on port $port..."
docker compose up --build -d

Write-Host ''
Write-Host "Done. Open http://localhost:$port"
Write-Host 'Logs: docker compose logs -f frontend'
