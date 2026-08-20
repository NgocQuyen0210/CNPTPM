$env:JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"
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
