#!/bin/bash

# Instalar dependencias de npm para Tailwind
cd theme && npm install

# Construir Tailwind con tu script personalizado
npm run build

# Volver al directorio raíz
cd ..

# Recolectar archivos estáticos
python manage.py collectstatic --noinput