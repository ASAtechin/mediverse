#!/bin/bash

echo "🛑 Stopping Clinicia Ecosystem..."

# Ports to clean up: Web, Admin, Backend, Mobile/Metro
ports=(3000 3001 4000 8081)

for port in "${ports[@]}"; do
  # Check if port is in use before trying to kill
  if lsof -i :$port > /dev/null 2>&1 || fuser "$port/tcp" > /dev/null 2>&1; then
    fuser -k "$port/tcp" > /dev/null 2>&1
    echo "✅ Killed process on port $port"
  else
    echo "ℹ️  No process found on port $port"
  fi
done

echo "🧹 Cleanup complete."
