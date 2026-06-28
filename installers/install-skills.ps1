param(
  [Parameter(Mandatory=$true)][string]$Target,
  [string]$Manifest = "core",
  [switch]$DryRun,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ManifestPath = Join-Path $RepoRoot "manifests/$Manifest.yaml"
if (-not (Test-Path -LiteralPath $ManifestPath)) { throw "Unknown manifest: $Manifest" }
$TargetRoot = [IO.Path]::GetFullPath($Target)
$BackupRoot = Join-Path $TargetRoot (".apt-backups/" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$Section = ""
$Entries = @()
foreach ($Line in Get-Content -LiteralPath $ManifestPath) {
  if ($Line -match '^(principles|skills|agents|templates|prompts|examples):$') { $Section=$Matches[1]; continue }
  if ($Line -match '^[a-z-]+:$') { $Section=""; continue }
  if ($Section -and $Line -match '^\s+-\s+(.+)$') { $Entries += $Matches[1].Trim() }
}
function Install-File([string]$Source,[string]$Relative) {
  $Destination = Join-Path $TargetRoot (".apt/" + $Relative.Replace('\','/'))
  if (Test-Path -LiteralPath $Destination) {
    if (-not $Force) { Write-Warning "Skipping existing $Destination"; return }
    $Backup = Join-Path $BackupRoot $Relative
    if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Backup) | Out-Null; Copy-Item -LiteralPath $Destination -Destination $Backup -Force }
  }
  $Verb = if ($DryRun) { "Would install " } else { "Installing " }
  Write-Output ($Verb + $Relative)
  if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Destination) | Out-Null; Copy-Item -LiteralPath $Source -Destination $Destination -Force }
}
foreach ($Entry in $Entries) {
  $Source = Join-Path $RepoRoot $Entry
  if (-not (Test-Path -LiteralPath $Source)) { throw "Manifest path missing: $Entry" }
  if ((Get-Item -LiteralPath $Source).PSIsContainer) {
    Get-ChildItem -LiteralPath $Source -Recurse -File | ForEach-Object {
      Install-File $_.FullName $_.FullName.Substring($RepoRoot.Length + 1)
    }
  } else { Install-File $Source $Entry }
}
