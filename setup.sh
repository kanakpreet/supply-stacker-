#!/bin/bash

# Time Tracker Web Application Setup Script
# This script automates the initial setup process

set -e

echo "🚀 Setting up Time Tracker Web Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
    echo "   Please install Docker and Docker Compose, or install PostgreSQL locally."
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose is not installed. You'll need to set up PostgreSQL manually."
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start database if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Starting PostgreSQL database with Docker..."
    docker-compose up -d postgres
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    # Check if database is ready
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ Database is ready!"
    else
        echo "⚠️  Database might not be ready yet. Please wait a moment and try again."
    fi
else
    echo "⚠️  Please ensure PostgreSQL is running and accessible."
fi

# Push database schema
echo "🗄️  Setting up database schema..."
npm run db:push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5000 in your browser"
echo ""
echo "Useful commands:"
echo "- npm run dev          # Start development server"
echo "- npm run docker:up    # Start database"
echo "- npm run docker:down  # Stop database"
echo "- npm run db:studio    # Open database studio"
echo ""
echo "Happy coding! 🚀" 