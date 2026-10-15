FROM php:8.2-apache
WORKDIR /var/www/html
COPY index.php styles.css script.js ./
RUN mkdir -p /var/www/data \
    && chown www-data:www-data /var/www/data \
    && chmod 775 /var/www/data
VOLUME ["/var/www/data"]
EXPOSE 80