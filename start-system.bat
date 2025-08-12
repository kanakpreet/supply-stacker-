@echo off
echo 🚀 Starting Time Tracker System...
echo.

echo 📋 Step 1: Checking Docker...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker found. Make sure Docker Desktop is running...
echo.

echo 📋 Step 2: Starting database...
npm run docker:up
if %errorlevel% neq 0 (
    echo ❌ Failed to start database. Make sure Docker Desktop is running.
    echo 💡 Start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Database started successfully!
echo.

echo 📋 Step 3: Seeding database...
npm run seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database.
    pause
    exit /b 1
)

echo ✅ Database seeded successfully!
echo.

echo 📋 Step 4: Starting development server...
echo 🌐 The application will be available at: http://localhost:5000
echo 👤 Login credentials: admin / admin123
echo.
echo Press Ctrl+C to stop the server when done.
echo.

npm run dev