#!/bin/bash

# Función para manejar errores
handle_error() {
    echo "Error en el paso: $1"
    exit 1
}

echo "🚀 Iniciando proceso de build..."

# Construir Tailwind
echo "📦 Instalando dependencias de Tailwind..."
cd theme || handle_error "No se pudo acceder al directorio theme"
npm install || handle_error "Fallo en npm install de Tailwind"
npm run build || handle_error "Fallo en build de Tailwind"
cd ..

# Construir React
echo "⚛️ Construyendo React..."
cd dashboard/static/js/react || handle_error "No se pudo acceder al directorio react"

# Limpiar caché y archivos antiguos
echo "🧹 Limpiando caché y archivos antiguos..."
npm cache clean --force
rm -rf node_modules dist/* package-lock.json

# Instalar dependencias y construir
echo "📦 Instalando dependencias de React..."
npm install || handle_error "Fallo en npm install de React"
echo "🔨 Ejecutando build de React..."
npm run build || handle_error "Fallo en build de React"
cd ../../../..

# Recolectar archivos estáticos de Django
echo "📂 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput || handle_error "Fallo en collectstatic"

echo "✅ Build completado exitosamente!"