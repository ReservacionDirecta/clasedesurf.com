@echo off
echo 🧪 Testing Surf School Deployment...
echo ====================================

echo 📥 Pulling latest images...
docker-compose pull

echo 🏁 Starting services...
docker-compose up -d

echo ⏳ Waiting for services to initialize...
timeout /t 15 /nobreak > nul

echo 📊 Service Status:
docker-compose ps

echo.
echo 🔍 Testing services...

REM Test database
echo 🗄️  Testing database...
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database is ready
) else (
    echo ❌ Database connection failed
)

REM Test backend health
echo 🔧 Testing backend...
curl -s -f http://localhost:4000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not responding
)

REM Test frontend
echo 🌐 Testing frontend...
curl -s -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible
) else (
    echo ❌ Frontend is not accessible
)

echo.
echo 📋 Final Status:
echo ================
docker-compose ps

echo.
echo 🎯 Test completed!
echo ==================
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:4000
echo 🗄️  Database: localhost:5432
echo.
echo To stop services: docker-compose down
echo To view logs: docker-compose logs -f

pause