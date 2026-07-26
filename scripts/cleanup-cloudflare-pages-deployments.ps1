param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectName,

  [switch]$Apply,
  [string]$ProductionDeploymentId = "",
  [string]$Environment = "",
  [string]$Profile = "",
  [int]$MaxDeletions = 0,
  [switch]$UseGlobalWrangler
)

$ErrorActionPreference = "Stop"

$prodId = $ProductionDeploymentId
$deleted = 0
$failed = @()

function Invoke-Wrangler {
  param([string[]]$ArgsList)

  if ($UseGlobalWrangler) {
    $output = & wrangler @ArgsList 2>&1
  } else {
    $output = & npx @("--yes", "wrangler@latest") @ArgsList 2>&1
  }

  [pscustomobject]@{
    ExitCode = $LASTEXITCODE
    Text = ($output -join [Environment]::NewLine)
  }
}

function Get-DeploymentIds {
  $argsList = @("pages", "deployment", "list", "--project-name", $ProjectName, "--json")
  if ($Environment) { $argsList += @("--environment", $Environment) }
  if ($Profile) { $argsList += @("--profile", $Profile) }

  $result = Invoke-Wrangler $argsList
  if ($result.ExitCode -ne 0) {
    throw "Could not list deployments.`n$result.Text"
  }

  $deployments = @($result.Text | ConvertFrom-Json)
  $ids = @()
  foreach ($deployment in $deployments) {
    $id = if ($deployment.Id) { $deployment.Id } else { $deployment.id }
    if ($id) { $ids += $id }
  }

  $ids
}

$mode = if ($Apply) { "apply" } else { "dry run" }
Write-Host "Cloudflare Pages cleanup for '$ProjectName' ($mode)"

while ($true) {
  $ids = @(Get-DeploymentIds)
  $toDelete = @($ids | Where-Object { $_ -and $_ -ne $prodId })

  if ($MaxDeletions -gt 0) {
    $remainingLimit = $MaxDeletions - $deleted
    if ($remainingLimit -le 0) { break }
    $toDelete = @($toDelete | Select-Object -First $remainingLimit)
  }

  if ($toDelete.Count -eq 0) { break }

  if (-not $Apply) {
    Write-Host "Would delete $($toDelete.Count) deployment(s):"
    $toDelete | ForEach-Object { Write-Host "  $_" }
    break
  }

  Write-Host "Deleting $($toDelete.Count) deployment(s)..."
  $deletedThisPass = 0

  foreach ($id in $toDelete) {
    $deleteArgs = @("pages", "deployment", "delete", "--project-name", $ProjectName, "--force=true")
    if ($Profile) { $deleteArgs += @("--profile", $Profile) }
    $deleteArgs += $id

    $result = Invoke-Wrangler $deleteArgs
    if ($result.ExitCode -eq 0 -or $result.Text -match "Successfully deleted") {
      $deleted++
      $deletedThisPass++
      Write-Host "Deleted $id"
      continue
    }

    if ($result.Text -match "active production deployment") {
      $prodId = $id
      Write-Host "Keeping active production deployment $id"
      continue
    }

    $failed += $id
    Write-Warning "Failed to delete $id"
    Write-Warning $result.Text
    Write-Warning "Stopping after first failure."
    break
  }

  if ($failed.Count -gt 0) { break }
  if ($deletedThisPass -eq 0) { break }
}

$remaining = @(Get-DeploymentIds).Count
$deleteProjectCommand = if ($UseGlobalWrangler) {
  "wrangler pages project delete `"$ProjectName`" --yes"
} else {
  "npx --yes wrangler@latest pages project delete `"$ProjectName`" --yes"
}
if ($Profile) { $deleteProjectCommand += " --profile `"$Profile`"" }

Write-Host ""
Write-Host "Done."
Write-Host "Deleted: $deleted"
Write-Host "Preserved production: $(if ($prodId) { $prodId } else { '(none known)' })"
Write-Host "Failed: $($failed.Count)"
Write-Host "Remaining deployments: $remaining"
Write-Host "Delete the Pages project after cleanup with:"
Write-Host "  $deleteProjectCommand"

if ($failed.Count -gt 0) { exit 1 }
