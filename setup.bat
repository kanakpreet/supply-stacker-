@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Time Tracker Web Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% LSS 18 (
    echo ❌ Node.js version 18 or higher is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker is not installed. You'll need to set up PostgreSQL manually.
    echo    Please install Docker and Docker Compose, or install PostgreSQL locally.
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker Compose is not installed. You'll need to set up PostgreSQL manually.
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env >nul
    echo ✅ .env file created. Please edit it with your configuration.
) else (
    echo ✅ .env file already exists.
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Start database if Docker is available
docker --version >nul 2>&1
if not errorlevel 1 (
    docker-compose --version >nul 2>&1
    if not errorlevel 1 (
        echo 🐳 Starting PostgreSQL database with Docker...
        docker-compose up -d postgres
        
        REM Wait for database to be ready
        echo ⏳ Waiting for database to be ready...
        timeout /t 10 /nobreak >nul
        
        echo ✅ Database should be ready!
    )
) else (
    echo ⚠️  Please ensure PostgreSQL is running and accessible.
)

REM Push database schema
echo 🗄️  Setting up database schema...
call npm run db:push

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:5000 in your browser
echo.
echo Useful commands:
echo - npm run dev          # Start development server
echo - npm run docker:up    # Start database
echo - npm run docker:down  # Stop database
echo - npm run db:studio    # Open database studio
echo.
echo Happy coding! 🚀
pause 