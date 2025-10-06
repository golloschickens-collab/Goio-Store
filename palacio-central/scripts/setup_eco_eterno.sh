#!/bin/bash
# =====================================================
# == Script de Activación para el Servidor eco-eterno ==
# =====================================================
#
# Ejecutar este script en el servidor 'eco-eterno'
# para abrir el puerto SSH y autorizar la llave de despliegue.
#

set -e

echo "-> [1/3] Configurando el firewall (UFW)..."
# Permite conexiones entrantes en el puerto 22 (SSH)
sudo ufw allow 22/tcp
sudo ufw reload
echo "    Puerto 22/tcp abierto."

echo "-> [2/3] Asegurando el directorio .ssh..."
# Crea el directorio .ssh si no existe y establece permisos correctos
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "    Directorio ~/.ssh asegurado."

echo "-> [3/3] Instalando la llave pública de despliegue..."
# Añade la llave pública a authorized_keys, evitando duplicados
KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILqKl9HfL5dTQRhUj6S3xTzGv4VlAzQ8jNkR6zMcGbZj metrics-deploy"
AUTH_KEYS_FILE=~/.ssh/authorized_keys
if ! grep -q "$KEY" "$AUTH_KEYS_FILE" 2>/dev/null; then
  echo "$KEY" >> "$AUTH_KEYS_FILE"
  echo "    Llave pública instalada."
else
  echo "    La llave pública ya existe. No se realizaron cambios."
fi

# Establece permisos correctos para el archivo de llaves
chmod 600 ~/.ssh/authorized_keys
echo "    Permisos de authorized_keys asegurados."

echo ""
echo "👑 ¡DECRETO DIVINO EJECUTADO! El servidor 'eco-eterno' está listo. 👑"
