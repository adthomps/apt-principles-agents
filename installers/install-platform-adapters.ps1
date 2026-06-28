param(
  [Parameter(Mandatory = $true)][string]$Target,
  [string]$Manifest = "core",
  [string]$Manifests = "",
  [string]$Platforms = "codex,claude,copilot,gemini",
  [switch]$DryRun,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$Selected = if ($Manifests) { $Manifests } else { $Manifest }
$Arguments = @(
  (Join-Path $PSScriptRoot "../scripts/apt-assets.mjs"),
  "install",
  "--target", $Target,
  "--manifests", $Selected,
  "--platforms", $Platforms
)
if ($DryRun) { $Arguments += "--dry-run" }
if ($Force) { $Arguments += "--force" }
& node @Arguments
exit $LASTEXITCODE
