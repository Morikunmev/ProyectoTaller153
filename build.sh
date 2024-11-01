# Instalar dependencias de npm para Tailwind
cd theme && npm install
npm run build
cd ..

# Construir React
cd dashboard/static/js/react
npm install
npm run build
cd ../../../..

# Recolectar archivos estáticos
python manage.py collectstatic --noinput