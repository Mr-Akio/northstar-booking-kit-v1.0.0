param(
  [string]$Version = "v1.0.0",
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
  throw "This script must run inside a valid git repository."
}

Set-Location $repoRoot

$resolvedOutputDir = Join-Path $repoRoot $OutputDir
if (-not (Test-Path $resolvedOutputDir)) {
  New-Item -ItemType Directory -Path $resolvedOutputDir | Out-Null
}

$safeVersion = $Version -replace '[^A-Za-z0-9._-]', '-'
$baseName = "northstar-booking-kit-$safeVersion"
$archivePath = Join-Path $resolvedOutputDir "$baseName.zip"
$checksumPath = Join-Path $resolvedOutputDir "$baseName.sha256.txt"

if (Test-Path $archivePath) {
  Remove-Item -LiteralPath $archivePath -Force
}

if (Test-Path $checksumPath) {
  Remove-Item -LiteralPath $checksumPath -Force
}

git archive --format=zip "--prefix=$baseName/" --output="$archivePath" $Version

$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash.ToLowerInvariant()
Set-Content -LiteralPath $checksumPath -Value "$hash *$($baseName).zip"

Write-Output "Created: $archivePath"
Write-Output "Checksum: $checksumPath"
