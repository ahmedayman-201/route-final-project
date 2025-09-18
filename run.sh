#!/bin/bash
echo "🚀 Starting Cloud Store..."
echo "📦 Installing dependencies..."
npm install
echo "🔧 Building project..."
npx ng build
echo "🌐 Starting server..."
npx ng serve --host 0.0.0.0 --port 4200
