Write-Host "Starting E-Commerce Microservices (Packaged JAR Mode) and Frontend..." -ForegroundColor Green

# Start Backend Services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dfile.encoding=UTF-8 -jar auth-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dfile.encoding=UTF-8 -jar product-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dfile.encoding=UTF-8 -jar order-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dfile.encoding=UTF-8 -jar payment-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dfile.encoding=UTF-8 -jar api-gateway/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dfile.encoding=UTF-8 -jar ai-service/target/quarkus-app/quarkus-run.jar" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal

Write-Host "All processes have been spawned in separate PowerShell windows!" -ForegroundColor Cyan
