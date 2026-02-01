#!/bin/sh
set -e

# Database check (matching Donald's pattern)
if [ ! -f "/app/data/conan.db" ]; then
    echo "Database file not found, will be initialized on startup..."
fi

# Start the application (using standalone output)
exec node server.js
