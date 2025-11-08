@echo off
REM Discussion Forum Setup Script for Windows
echo 🚀 Setting up Discussion Forum for Learnato Hackathon...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)

echo ✅ Node.js found
node -v

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed.
    exit /b 1
)

echo ✅ npm found
npm -v
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend

if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env and add your MongoDB Atlas connection string!
)

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)

echo ✅ Backend dependencies installed
cd ..
echo.

REM Setup Frontend
echo 📦 Setting up Frontend...
cd frontend

if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
)

echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)

echo ✅ Frontend dependencies installed
cd ..
echo.

REM Final instructions
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo.
echo 1. Get your MongoDB Atlas connection string:
echo    - Sign up at https://www.mongodb.com/cloud/atlas
echo    - Create a free cluster
echo    - Click 'Connect' → 'Connect your application'
echo    - Copy the connection string
echo.
echo 2. Edit backend\.env and add your MongoDB connection string:
echo    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/discussion-forum
echo.
echo 3. Start the backend:
echo    cd backend
echo    npm run dev
echo.
echo 4. In a new terminal, start the frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 5. Open your browser:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 🎉 Happy coding!
pause
