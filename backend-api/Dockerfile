FROM richarvey/nginx-php-fpm:3.1.6

# Copy project files
COPY . /var/www/html

# Set working directory
WORKDIR /var/www/html

# Image config
ENV SKIP_COMPOSER=1
ENV WEBROOT=/var/www/html/public
ENV PHP_ERRORS_ON=1
ENV RUN_SCRIPTS=1
ENV REAL_IP_HEADER=1

# Laravel config
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV SESSION_DRIVER=cookie

# Allow composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER=1

# Install composer dependencies (production only)
RUN composer install --no-dev --optimize-autoloader

# Create necessary directories and set permissions
RUN mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R nginx:nginx /var/www/html/storage \
    && chown -R nginx:nginx /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copy startup script
COPY scripts/00-laravel-deploy.sh /var/www/html/scripts/00-laravel-deploy.sh
RUN chmod +x /var/www/html/scripts/00-laravel-deploy.sh
