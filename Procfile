web: npm run build --prefix theme && python manage.py collectstatic --noinput && gunicorn proyecto_taller153.wsgi:application --bind 0.0.0.0:$PORT --log-file -
