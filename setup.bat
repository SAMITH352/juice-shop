@echo off
echo ========================================
echo Fresh Harvest E-commerce Setup
echo ========================================
echo.

echo Starting setup process...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js is installed ✓
echo.

REM Navigate to backend directory
echo Setting up backend...
cd backend

REM Install backend dependencies
echo Installing backend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)

echo Backend dependencies installed ✓
echo.

REM Go back to root directory
cd ..

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Start the backend server:
echo    cd backend
echo    npm start
echo.
echo 2. Open the frontend:
echo    Open frontend/index.html in your browser
echo    or use a local server like Live Server
echo.
echo The backend will run on http://localhost:5000
echo.
echo ========================================
pause
