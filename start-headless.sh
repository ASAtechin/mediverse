#!/bin/bash

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure logs directory exists
mkdir -p logs

echo "🧹 Cleaning up existing processes..."
ports=(3000 3001 4000)
for port in "${ports[@]}"; do
  fuser -k "$port/tcp" > /dev/null 2>&1
done
sleep 2

echo "🚀 Starting Clinicia Ecosystem (Headless)..."

# 1. Start Backend (Port 4000)
echo "📦 Starting Backend on :4000..."
(cd clinicia-backend && npm run dev) > logs/backend.log 2>&1 &

# 2. Start Admin Portal (Port 3001)
echo "👑 Starting Admin Portal on :3001..."
(cd clinicia-admin && npm run dev) > logs/admin.log 2>&1 &

# 3. Start Web Portal (Port 3000)
echo "💻 Starting Web Portal on :3000..."
(cd clinicia-web && npm run dev) > logs/web.log 2>&1 &

echo ""
echo "✅ All services initiated in background!"
echo "-----------------------------------"
echo "Backend: http://localhost:4000  (logs/backend.log)"
echo "Admin:   http://localhost:3001  (logs/admin.log)"
echo "Web:     http://localhost:3000  (logs/web.log)"
echo "-----------------------------------"
echo "Use ./stop-headless.sh to stop all services."
