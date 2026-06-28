param(
  [Parameter(Mandatory=$true)][string]$Target,
  [string]$Manifest = "core",
  [switch]$DryRun,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$TargetRoot = [IO.Path]::GetFullPath($Target)
$BackupRoot = Join-Path $TargetRoot (".apt-backups/" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$ManifestPath = Join-Path $RepoRoot "manifests/$Manifest.yaml"
if (-not (Test-Path -LiteralPath $ManifestPath)) { throw "Unknown manifest: $Manifest" }
$Mappings = @{
  "AGENTS.md"="AGENTS.md"; "CODEX.md"="CODEX.md"; "CLAUDE.md"="CLAUDE.md"; "GEMINI.md"="GEMINI.md";
  "platforms/gemini/config.yaml"=".gemini/config.yaml"; "platforms/gemini/styleguide.md"=".gemini/styleguide.md";
  "platforms/github-copilot/copilot-instructions.md"=".github/copilot-instructions.md"
}
function Install-MappedFile([string]$Source,[string]$Relative) {
  $Destination=Join-Path $TargetRoot $Relative
  if (Test-Path -LiteralPath $Destination) {
    if (-not $Force) { Write-Warning "Skipping existing $Destination"; return }
    $Backup=Join-Path $BackupRoot $Relative
    if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Backup) | Out-Null; Copy-Item $Destination $Backup -Force }
  }
  $Verb = if ($DryRun) { "Would install " } else { "Installing " }
  Write-Output ($Verb + $Relative)
  if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Destination) | Out-Null; Copy-Item $Source $Destination -Force }
}
foreach ($Pair in $Mappings.GetEnumerator()) { Install-MappedFile (Join-Path $RepoRoot $Pair.Key) $Pair.Value }
$Section=""
$Entries=@()
foreach($Line in Get-Content -LiteralPath $ManifestPath){
  if($Line -match '^(skills|prompts):$'){$Section=$Matches[1];continue}
  if($Line -match '^[a-z-]+:$'){$Section="";continue}
  if($Section -and $Line -match '^\s+-\s+(.+)$'){$Entries += [pscustomobject]@{Section=$Section;Path=$Matches[1].Trim()}}
}
foreach($Entry in $Entries){
  $Source=Join-Path $RepoRoot $Entry.Path
  $Files=if((Get-Item $Source).PSIsContainer){Get-ChildItem $Source -Recurse -File}else{Get-Item $Source}
  foreach($File in $Files){
    $RepoRelative=$File.FullName.Substring($RepoRoot.Length+1).Replace('\','/')
    if($Entry.Section -eq "skills"){
      $Suffix=$RepoRelative.Substring("skills/".Length)
      foreach($Base in @(".codex/skills",".claude/skills",".github/skills")){Install-MappedFile $File.FullName ($Base+"/"+$Suffix)}
    } else {
      $Suffix=$RepoRelative.Substring("prompts/".Length)
      Install-MappedFile $File.FullName (".github/prompts/"+$Suffix)
      Install-MappedFile $File.FullName (".gemini/commands/"+$Suffix)
    }
  }
}
