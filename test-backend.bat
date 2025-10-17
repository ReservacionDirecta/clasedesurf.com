@echo off
echo 🧪 Testing Backend Container...
echo ================================

REM Stop any existing container
docker stop surfschool-backend-test >nul 2>&1
docker rm surfschool-backend-test >nul 2>&1

REM Run the backend container for testing
echo 🚀 Starting backend container...
docker run -d ^
  --name surfschool-backend-test ^
  -p 4001:4000 ^
  -e DATABASE_URL="postgresql://postgres:postgres123@host.docker.internal:5432/surfschool" ^
  -e JWT_SECRET="test-jwt-secret" ^
  -e NEXTAUTH_SECRET="test-nextauth-secret" ^
  -e NODE_ENV="production" ^
  chambadigital/surfschool-backend:latest

REM Wait for container to start
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

REM Check if container is running
docker ps | findstr surfschool-backend-test >nul
if %errorlevel% == 0 (
  echo ✅ Container is running!
  
  REM Test health endpoint
  echo 🔍 Testing health endpoint...
  curl -f http://localhost:4001/health >nul 2>&1
  if %errorlevel% == 0 (
    echo ✅ Health check passed!
  ) else (
    echo ❌ Health check failed!
  )
  
  REM Show container logs
  echo 📋 Container logs:
  docker logs surfschool-backend-test --tail 20
  
) else (
  echo ❌ Container failed to start!
  echo 📋 Container logs:
  docker logs surfschool-backend-test
)

REM Cleanup
echo 🧹 Cleaning up test container...
docker stop surfschool-backend-test >nul
docker rm surfschool-backend-test >nul

echo 🏁 Test completed!
pause