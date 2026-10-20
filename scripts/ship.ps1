<#
.SYNOPSIS
  Ship a change end-to-end: issue -> branch -> commit -> push -> pull request.

.EXAMPLE
  npm run ship -- -Type feat -Title "add card viewer page" -Scope viewer
  npm run ship -- -Type fix -Title "crash when deleting last element" -Body "Steps..." -Paths src/store

.NOTES
  Use English titles (matches repo history and avoids console-encoding issues).
  Pull requests always target main and contain "Closes #<issue>".
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidateSet('feat', 'fix', 'refactor', 'chore', 'docs', 'ci', 'style', 'perf', 'test')]
  [string]$Type,
  [Parameter(Mandatory)][string]$Title,
  [string]$Scope = '',
  [string]$Body = '',
  [string[]]$Paths = @('.'),
  [string]$Base = 'main',
  [switch]$NoIssue,
  [switch]$Draft,
  [switch]$SkipChecks,
  [switch]$Watch,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
# "-File" mode passes "a,b" as one string, so split on commas.
$Paths = @($Paths | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8

function Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Run([string]$exe, [string[]]$arguments) {
  if ($DryRun) { Write-Host "[dry-run] $exe $($arguments -join ' ')"; return '' }
  $out = & $exe @arguments
  if ($LASTEXITCODE -ne 0) { throw "$exe $($arguments -join ' ') failed (exit $LASTEXITCODE)" }
  return $out
}
function Write-TempFile([string]$text) {
  $f = [IO.Path]::GetTempFileName()
  [IO.File]::WriteAllText($f, $text, $utf8)
  return $f
}
function ConvertTo-Slug([string]$s) {
  $n = $s.Normalize([Text.NormalizationForm]::FormD)
  $n = -join ($n.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne 'NonSpacingMark' })
  $n = $n.Replace([string][char]0x0111, 'd').Replace([string][char]0x0110, 'd').ToLower()
  $n = ($n -replace '[^a-z0-9]+', '-').Trim('-')
  if ($n.Length -gt 40) { $n = $n.Substring(0, 40).Trim('-') }
  return $n
}

Set-Location (git rev-parse --show-toplevel)
gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw 'gh is not authenticated. Run: gh auth login' }

$current = (git branch --show-current).Trim()
if (-not (git status --porcelain)) { throw 'Nothing to ship: working tree is clean.' }

if (-not $SkipChecks) {
  Step 'Typecheck'
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw 'Typecheck failed. Fix errors or pass -SkipChecks.' }
}

$label = switch ($Type) { 'fix' { 'bug' } 'docs' { 'documentation' } default { 'enhancement' } }
$subject = if ($Scope) { "${Type}(${Scope}): $Title" } else { "${Type}: $Title" }

$issue = $null
if (-not $NoIssue) {
  Step "Create issue: $Title"
  $issueBody = if ($Body) { $Body } else { $Title }
  $f = Write-TempFile $issueBody
  $url = Run 'gh' @('issue', 'create', '--title', $Title, '--body-file', $f, '--label', $label)
  Remove-Item $f -ErrorAction SilentlyContinue
  if ($DryRun) { $issue = 0 } else { $issue = [int](($url | Select-Object -Last 1) -replace '.*/', '') }
  Write-Host "Issue #$issue"
}

$slug = ConvertTo-Slug $Title
$branchType = if ($Type -eq 'feat') { 'feature' } else { $Type }
$branch = if ($issue) { "$branchType/$issue-$slug" } else { "$branchType/$slug" }

Step "Branch: $branch (from $current)"
Run 'git' @('switch', '-c', $branch) | Out-Null

Step 'Commit'
Run 'git' (@('add', '--') + $Paths) | Out-Null
if (-not $DryRun -and -not (git diff --cached --name-only)) { throw 'No staged changes for the given -Paths.' }
$msg = $subject
if ($issue) { $msg += " (#$issue)" }
$msg += "`n`nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`n"
$f = Write-TempFile $msg
Run 'git' @('commit', '-F', $f) | Out-Null
Remove-Item $f -ErrorAction SilentlyContinue

Step 'Push'
Run 'git' @('push', '-u', 'origin', $branch) | Out-Null

Step 'Open pull request'
$prBody = if ($Body) { $Body } else { $Title }
if ($issue) { $prBody += "`n`nCloses #$issue" }
$f = Write-TempFile $prBody
$prArgs = @('pr', 'create', '--base', $Base, '--head', $branch, '--title', $subject, '--body-file', $f)
if ($Draft) { $prArgs += '--draft' }
$prUrl = Run 'gh' $prArgs
Remove-Item $f -ErrorAction SilentlyContinue
Write-Host "PR: $($prUrl | Select-Object -Last 1)" -ForegroundColor Green

if ($Watch -and -not $DryRun) {
  Step 'Waiting for CI'
  gh pr checks $branch --watch
}
