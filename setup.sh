#!/bin/bash

echo "========================================"
echo "Fresh Harvest E-commerce Setup"
echo "========================================"
echo

echo "Starting setup process..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo
    exit 1
fi

echo "Node.js is installed ✓"
echo

# Navigate to backend directory
echo "Setting up backend..."
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies!"
    exit 1
fi

echo "Backend dependencies installed ✓"
echo

# Go back to root directory
cd ..

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "To start the application:"
echo
echo "1. Start the backend server:"
echo "   cd backend"
echo "   npm start"
echo
echo "2. Open the frontend:"
echo "   Open frontend/index.html in your browser"
echo "   or use a local server like Live Server"
echo
echo "The backend will run on http://localhost:5000"
echo
echo "========================================"
