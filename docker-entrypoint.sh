#!/bin/sh
set -e

# Run migrations if they exist
if [ -f "./prisma/schema.prisma" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
fi

# Start the application
echo "Starting application..."
node server.js
