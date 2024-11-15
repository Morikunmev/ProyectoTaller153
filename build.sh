#!/bin/bash

# Configuración de variables de entorno
export NODE_OPTIONS="--max-old-space-size=512" # Limitar uso de memoria de Node
export PYTHONUNBUFFERED=1 # Mejorar logging de Python

# Función para manejar errores con más detalles
handle_error() {
    echo "❌ Error en el paso: $1"
    echo "📝 Detalles del error: $2"
    echo "⏱️ Timestamp: $(date)"
    # Guardar log de error
    echo "[$(date)] Error en $1: $2" >> build_errors.log
    exit 1
}

# Función para verificar espacio en disco
check_disk_space() {
    local free_space=$(df -h . | awk 'NR==2 {print $4}')
    echo "💾 Espacio libre en disco: $free_space"
    if [[ $(df . | awk 'NR==2 {print $4}') -lt 1048576 ]]; then # Menos de 1GB
        handle_error "Verificación de espacio" "Espacio insuficiente en disco"
    fi
}

# Función para limpiar archivos temporales
cleanup() {
    echo "🧹 Limpiando archivos temporales..."
    find . -type f -name "*.pyc" -delete
    find . -type d -name "__pycache__" -exec rm -rf {} +
    npm cache clean --force
}

echo "🚀 Iniciando proceso de build..."
echo "⏱️ Timestamp inicio: $(date)"

# Verificar espacio antes de empezar
check_disk_space

# Crear directorio de logs si no existe
mkdir -p logs

# Limpiar directorio staticfiles con verificación
if [ -d "staticfiles" ]; then
    echo "🧹 Limpiando directorio staticfiles..."
    rm -rf staticfiles/* || handle_error "Limpieza staticfiles" "No se pudo limpiar el directorio"
fi

# Construir Tailwind con retry
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

# Construir React con mejor manejo de errores
echo "⚛️ Construyendo React..."
cd dashboard/static/js/react || handle_error "Cambio de directorio" "No se pudo acceder al directorio react"

# Limpiar y preparar entorno React
echo "🧹 Limpiando entorno React..."
cleanup

# Instalar y construir React con retry
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
cd ../../../..

# Crear y verificar directorio staticfiles
mkdir -p staticfiles || handle_error "Creación directorio" "No se pudo crear staticfiles"

# Recolectar archivos estáticos con retry
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

# Verificar contenido y tamaño de staticfiles
echo "📝 Verificando archivos estáticos recolectados..."
if [ -d "staticfiles" ]; then
    ls -lah staticfiles/
    find staticfiles -type f | wc -l | xargs echo "Total archivos estáticos:"
else
    handle_error "Verificación" "Directorio staticfiles no existe después de collectstatic"
fi

echo "✅ Build completado exitosamente!"
echo "⏱️ Timestamp fin: $(date)"