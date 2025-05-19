# Deploy both client and server to Vercel
# Run this script from the root directory of your project

# Check if Vercel CLI is installed
if (Get-Command "vercel" -ErrorAction SilentlyContinue) {
    Write-Host "Vercel CLI is installed. Proceeding with deployment..." -ForegroundColor Green
} else {
    Write-Host "Vercel CLI is not installed. Installing it now..." -ForegroundColor Yellow
    npm install -g vercel
}

# Ensure user is logged in
Write-Host "Checking Vercel login status..."
$loginStatus = vercel whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please log in to Vercel:"
    vercel login
}

# Deploy the server first
Write-Host "Deploying the server..." -ForegroundColor Cyan
Set-Location -Path .\server
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "Server deployment failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

# Get the deployment URL
$serverUrl = Read-Host "Enter the server deployment URL (e.g., https://dostifyapp-server.vercel.app)"

# Update the client's environment variables
Write-Host "Updating client environment variables..." -ForegroundColor Cyan
Set-Location -Path ..\client

# Create or update .env.production
$envContent = @"
NEXT_PUBLIC_SERVER_URL=$serverUrl
NEXT_PUBLIC_API_URL=$serverUrl
"@
$envContent | Out-File -FilePath .\.env.production -Encoding utf8

# Deploy the client
Write-Host "Deploying the client..." -ForegroundColor Cyan
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "Client deployment failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

# Return to the root directory
Set-Location -Path ..

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Server URL: $serverUrl" -ForegroundColor Yellow
Write-Host "Don't forget to set environment variables in the Vercel dashboard if needed." -ForegroundColor Yellow
