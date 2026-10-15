FROM php:8.2-apache
COPY index.php styles.css script.js /var/www/html/
RUN mkdir -p /var/www/data && chown www-data:www-data /var/www/data
EXPOSE 80