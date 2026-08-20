$env:JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"

# 1. Check if backend JARs are missing (Clone for the first time)
$jarPath = "$PSScriptRoot\backend\auth-service\target\quarkus-app\quarkus-run.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "========================================================================" -ForegroundColor Yellow
    Write-Host "[He thong] Phat hien thieu file JAR backend (Lan dau tien clone du an)." -ForegroundColor Yellow
    Write-Host "Dang tu dong thuc hien bien dich & dong goi backend..." -ForegroundColor Yellow
    Write-Host "========================================================================" -ForegroundColor Yellow
    
    Push-Location "$PSScriptRoot\backend"
    if (Test-Path "mvnw.cmd") {
        .\mvnw clean package -DskipTests
    } else {
        mvn clean package -DskipTests
    }
    Pop-Location
}

# 2. Check if frontend node_modules is missing
$nodeModulesPath = "$PSScriptRoot\frontend\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "========================================================================" -ForegroundColor Yellow
    Write-Host "[He thong] Phat hien thieu node_modules frontend." -ForegroundColor Yellow
    Write-Host "Dang tu dong thuc hien 'npm install'..." -ForegroundColor Yellow
    Write-Host "========================================================================" -ForegroundColor Yellow
    
    Push-Location "$PSScriptRoot\frontend"
    npm install
    Pop-Location
}

Write-Host "Starting E-Commerce Microservices (Packaged JAR Mode) and Frontend..." -ForegroundColor Green

# Start Backend Services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Xms32m -Xmx192m -XX:+UseG1GC -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -jar auth-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Xms32m -Xmx192m -XX:+UseG1GC -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -jar product-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Xms32m -Xmx192m -XX:+UseG1GC -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -jar order-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Xms32m -Xmx192m -XX:+UseG1GC -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -jar payment-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Xms32m -Xmx192m -XX:+UseG1GC -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -jar api-gateway/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Xms32m -Xmx256m -XX:+UseG1GC -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -jar ai-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal

Write-Host "All processes have been spawned in separate PowerShell windows!" -ForegroundColor Cyan
