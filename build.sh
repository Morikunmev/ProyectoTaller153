#!/bin/bash

# Configuración de variables de entorno
export NODE_OPTIONS="--max-old-space-size=512"
export PYTHONUNBUFFERED=1

# Funciones de utilidad
handle_error() {
  echo "❌ Error en el paso: $1" 
  echo "📝 Detalles del error: $2"
  echo "⏱️ Timestamp: $(date)"
  echo "[$(date)] Error en $1: $2" >> build_errors.log
  exit 1
}

check_disk_space() {
  local free_space=$(df -h . | awk 'NR==2 {print $4}')
  echo "💾 Espacio libre en disco: $free_space"
  if [[ $(df . | awk 'NR==2 {print $4}') -lt 1048576 ]]; then
      handle_error "Verificación de espacio" "Espacio insuficiente en disco"
  fi
}

cleanup() {
  echo "🧹 Limpiando archivos temporales..."
  find . -type f -name "*.pyc" -delete
  find . -type d -name "__pycache__" -exec rm -rf {} +
  npm cache clean --force
}

echo "🚀 Iniciando proceso de build..."
echo "⏱️ Timestamp inicio: $(date)"

check_disk_space
mkdir -p logs

# Limpiar staticfiles
if [ -d "staticfiles" ]; then
  echo "🧹 Limpiando directorio staticfiles..."
  rm -rf staticfiles/* || handle_error "Limpieza staticfiles" "No se pudo limpiar el directorio"
fi

# Build Tailwind
echo "📦 Instalando dependencias de Tailwind..."
cd theme || handle_error "Cambio de directorio" "No se pudo acceder al directorio theme"
for i in {1..3}; do
  if npm install && npm run build; then
      break
  elif [ $i -eq 3 ]; then
      handle_error "Build Tailwind" "Fallo después de 3 intentos"
  fi
  echo "⚠️ Reintentando build de Tailwind... (intento $i)"
  cleanup
  sleep 5
done
cd ..

# Build React
echo "⚛️ Construyendo React..."
cd dashboard/static/js/react || handle_error "Cambio de directorio" "No se pudo acceder al directorio react"
cleanup

echo "📦 Instalando dependencias de React..."
for i in {1..3}; do
  if npm install && NODE_ENV=production npm run build; then
      break
  elif [ $i -eq 3 ]; then
      handle_error "Build React" "Fallo después de 3 intentos"
  fi
  echo "⚠️ Reintentando build de React... (intento $i)"
  cleanup
  sleep 5
done

# Crear directorios necesarios y copiar archivos
echo "📁 Creando directorios y copiando archivos..."
mkdir -p dist
cp -r src/styles/index.css dist/ || true
cd ../../../..

# Asegurar directorios estáticos existen
mkdir -p staticfiles
mkdir -p dashboard/static/js/react/dist

# Copiar bundles y CSS
echo "📦 Copiando archivos estáticos..."
cp -r dashboard/static/js/react/dist/* dashboard/static/js/react/dist/ || true
cp dashboard/static/js/react/src/styles/index.css dashboard/static/js/react/dist/ || true

# Collectstatic
echo "📂 Recolectando archivos estáticos..."
for i in {1..3}; do
  if python manage.py collectstatic --noinput --clear; then
      break
  elif [ $i -eq 3 ]; then
      handle_error "Collectstatic" "Fallo después de 3 intentos"
  fi
  echo "⚠️ Reintentando collectstatic... (intento $i)"
  sleep 5
done

# Verificar build
if [ -d "staticfiles" ]; then
  echo "📝 Contenido de staticfiles:"
  ls -lah staticfiles/
  echo "📝 Contenido de staticfiles/js/react/dist:"
  ls -lah staticfiles/js/react/dist/
  find staticfiles -type f | wc -l | xargs echo "Total archivos estáticos:"
else
  handle_error "Verificación" "Directorio staticfiles no existe después de collectstatic"
fi

echo "✅ Build completado exitosamente!"
echo "⏱️ Timestamp fin: $(date)"