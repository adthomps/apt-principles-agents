param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$repositoryRoot = Split-Path -Parent $root
$failures = New-Object System.Collections.Generic.List[string]

function Test-RequiredPath {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath (Join-Path $root $Path))) {
    $failures.Add("Missing required path: $Path")
  }
}

function Test-TextContains {
  param([string]$Path, [string]$Pattern, [string]$Message)
  $fullPath = Join-Path $root $Path
  if (-not (Test-Path -LiteralPath $fullPath)) {
    $failures.Add("Missing file for text check: $Path")
    return
  }
  $text = Get-Content -LiteralPath $fullPath -Raw
  if ($text -notmatch $Pattern) {
    $failures.Add($Message)
  }
}

Test-RequiredPath "README.md"
Test-RequiredPath "AGENTS.md"
Test-RequiredPath "docs/project-identity.md"
Test-RequiredPath "docs/project-context.md"
Test-RequiredPath "docs/operating-model.md"
Test-RequiredPath "docs/session-retention-policy.md"
Test-RequiredPath ".apt/local-agents.md"
Test-RequiredPath "working-backwards/active/README.md"
Test-RequiredPath "working-backwards/archive/README.md"
Test-RequiredPath "working-backwards/promotion-candidates/README.md"
Test-RequiredPath "templates/session.json.template"
Test-RequiredPath ".claude/skills/working-backwards/SKILL.md"

Test-TextContains "README.md" "internal planning subsystem" "README should identify the subsystem boundary."
Test-TextContains "AGENTS.md" "Draft issues by default" "AGENTS.md should keep issue creation as explicit opt-in."
Test-TextContains "docs/project-context.md" "shares its Git history" "Project context should describe parent-repository ownership."
Test-TextContains ".apt/local-agents.md" "four pipeline workers" "Local agent declaration should preserve the Product Team workers."
Test-TextContains "docs/session-retention-policy.md" "Sensitive data is absent" "Retention policy should keep promotion hygiene explicit."

if (Test-Path -LiteralPath (Join-Path $root ".git")) {
  $failures.Add("Nested Git metadata is not allowed; use the parent apt-principles-agents repository.")
}
if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot ".git"))) {
  $failures.Add("Parent apt-principles-agents Git metadata was not found.")
}

$rootSessions = Get-ChildItem -LiteralPath (Join-Path $root "working-backwards") -Directory |
  Where-Object { $_.Name -notin @("active", "archive", "promotion-candidates") }
foreach ($session in $rootSessions) {
  $failures.Add("Session folder is not in active/archive/promotion-candidates: working-backwards/$($session.Name)")
}

$activeItems = Get-ChildItem -LiteralPath (Join-Path $root "working-backwards/active") -Force |
  Where-Object { $_.Name -ne "README.md" }
if ($Strict -and $activeItems.Count -gt 0) {
  $failures.Add("Strict mode expected no active sessions; found $($activeItems.Count).")
}

if ($failures.Count -gt 0) {
  Write-Host "Product Team subsystem validation failed:" -ForegroundColor Red
  foreach ($failure in $failures) {
    Write-Host " - $failure" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Product Team subsystem validation passed." -ForegroundColor Green
Write-Host "Checked subsystem placement, worker declaration, retention folders, and promotion hygiene."
