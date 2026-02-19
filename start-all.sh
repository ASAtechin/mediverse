#!/bin/bash

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧹 Cleaning up existing processes..."
ports=(3000 3001 4000 8081)
for port in "${ports[@]}"; do
  fuser -k "$port/tcp" > /dev/null 2>&1
done
sleep 2

echo "🚀 Starting Clinicia Ecosystem..."

# 1. Start Backend (Port 4000)
echo "📦 Starting Backend on :4000..."
gnome-terminal --title="Clinicia Backend" -- bash -c "cd '$SCRIPT_DIR/clinicia-backend' && npm run dev; exec bash" 2>/dev/null || \
  (cd clinicia-backend && npm run dev) &

# 2. Start Admin Portal (Port 3001)
echo "👑 Starting Admin Portal on :3001..."
gnome-terminal --title="Clinicia Admin" -- bash -c "cd '$SCRIPT_DIR/clinicia-admin' && npm run dev; exec bash" 2>/dev/null || \
  (cd clinicia-admin && npm run dev) &

# 3. Start Web Portal (Port 3000)
echo "💻 Starting Web Portal on :3000..."
gnome-terminal --title="Clinicia Web" -- bash -c "cd '$SCRIPT_DIR/clinicia-web' && npm run dev; exec bash" 2>/dev/null || \
  (cd clinicia-web && npm run dev) &

echo ""
echo "✅ All services initiated!"
echo "-----------------------------------"
echo "Backend: http://localhost:4000"
echo "Admin:   http://localhost:3001"
echo "Web:     http://localhost:3000"
echo "-----------------------------------"
