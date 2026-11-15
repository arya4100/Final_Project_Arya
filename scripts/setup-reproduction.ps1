$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
$reproductionRoot=Join-Path $projectRoot ('.tools\setup-reproduction-'+(Get-Date -Format yyyyMMdd-HHmmss))
$frontendPath=Join-Path $reproductionRoot 'frontend'
$backendPath=Join-Path $reproductionRoot 'backend'
New-Item -ItemType Directory -Force -Path $frontendPath,$backendPath | Out-Null
$Host.UI.RawUI.WindowTitle='SmartStock Setup Evidence'
Start-Transcript -Path (Join-Path $projectRoot 'evidence\setup-transcript.txt') -Force | Out-Null
Write-Host 'SMARTSTOCK - CLEAN SETUP REPRODUCTION' -ForegroundColor Green
Write-Host 'This is a real fresh setup reproduction, not the original creation session.'
Write-Host '> node --version'
node --version
Write-Host '> npm --version'
npm --version
Set-Location $frontendPath
Write-Host '> npm init -y   [frontend]'
npm init -y | Out-Null
if($LASTEXITCODE -ne 0){throw 'Frontend initialization failed'}
Write-Host '> npm install react@19 react-dom@19 vite@6 @vitejs/plugin-react@4 --no-audit --no-fund'
npm install react@19 react-dom@19 vite@6 @vitejs/plugin-react@4 --no-audit --no-fund
if($LASTEXITCODE -ne 0){throw 'Frontend installation failed'}
Set-Location $backendPath
Write-Host '> npm init -y   [backend]'
npm init -y | Out-Null
if($LASTEXITCODE -ne 0){throw 'Backend initialization failed'}
Write-Host '> npm install express@5 mongodb@6 bcryptjs jsonwebtoken web-push --no-audit --no-fund'
npm install express@5 mongodb@6 bcryptjs jsonwebtoken web-push --no-audit --no-fund
if($LASTEXITCODE -ne 0){throw 'Backend installation failed'}
Write-Host 'Frontend and backend setup reproduced successfully.' -ForegroundColor Green
Set-Location $projectRoot
Stop-Transcript | Out-Null
'passed' | Set-Content -LiteralPath (Join-Path $projectRoot '.evidence-private\setup-complete.txt')
$Host.UI.RawUI.WindowTitle='SmartStock Setup Evidence'
