#!/bin/bash
echo "Starting Cloud Store..."
echo "Installing dependencies..."
npm install
echo "Starting development server..."
npx ng serve --open --port 4200
