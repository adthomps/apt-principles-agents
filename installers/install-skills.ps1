param(
  [Parameter(Mandatory = $true)][string]$Target,
  [string]$Manifest = "core",
  [string]$Manifests = "",
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
  "--platforms", "none"
)
if ($DryRun) { $Arguments += "--dry-run" }
if ($Force) { $Arguments += "--force" }
& node @Arguments
exit $LASTEXITCODE
