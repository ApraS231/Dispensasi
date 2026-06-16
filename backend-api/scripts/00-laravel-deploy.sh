#!/usr/bin/env bash

echo "Running Laravel deployment script..."

# Clear old cache files and fix permissions to prevent "Failed opening required" errors
echo "Cleaning bootstrap cache and fixing directory permissions..."
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php bootstrap/cache/routes.php
chmod -R 775 bootstrap/cache storage || true

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --show
fi

# Clear and cache config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Filament: publish assets & create storage link
php artisan filament:assets
php artisan storage:link || true

echo "Laravel deployment script completed!"
