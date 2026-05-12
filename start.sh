#!/bin/bash
# AWAAZ Quick Start Script
# Run: chmod +x start.sh && ./start.sh

echo ""
echo "╔══════════════════════════════════╗"
echo "║     AWAAZ — Public Voice         ║"
echo "╚══════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
  echo "⚠️  No .env file found in backend/"
  echo "   Copying .env.example to .env..."
  cp backend/.env.example backend/.env
  echo "   ✅ Created backend/.env"
  echo "   ❗ Please edit backend/.env with your credentials before starting."
  echo ""
  echo "   Required values:"
  echo "   - MONGODB_URI (from MongoDB Atlas)"
  echo "   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
  echo "   - JWT_SECRET (any long random string)"
  echo "   - ADMIN_PASSWORD (secret for admin access)"
  echo ""
  exit 1
fi

# Install backend dependencies if not installed
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
  echo "✅ Dependencies installed"
  echo ""
fi

echo "🚀 Starting backend server..."
echo "   API will be available at: http://localhost:3000/api"
echo ""
echo "📂 To serve frontend, run in another terminal:"
echo "   cd frontend && npx live-server --port=5500"
echo ""
echo "Press Ctrl+C to stop."
echo ""

cd backend && npm start
