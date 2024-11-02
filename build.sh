#!/bin/bash

# Función para manejar errores
handle_error() {
    echo "Error en el paso: $1"
    exit 1
}

echo "🚀 Iniciando proceso de build..."

# Limpiar directorio staticfiles existente
echo "🧹 Limpiando directorio staticfiles..."
rm -rf staticfiles/*

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
NODE_ENV=production npm run build || handle_error "Fallo en build de React"
cd ../../../..

# Asegurarse de que el directorio staticfiles existe
mkdir -p staticfiles

# Recolectar archivos estáticos de Django
echo "📂 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput --clear || handle_error "Fallo en collectstatic"

# Verificar contenido de staticfiles
echo "📝 Verificando archivos estáticos recolectados..."
ls -la staticfiles/

echo "✅ Build completado exitosamente!"