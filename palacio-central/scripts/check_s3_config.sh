Parece que ya estás listo para proceder con la creación del bucket y la clave de acceso temporal en la Consola de Hetzner, y luego ejecutar el bloque de código para subir el archivo y verificar los hashes. Aquí están las instrucciones paso a paso:

PASO A — Crear bucket y clave temporal (en Hetzner Console)

Accede a la Consola de Hetzner:

Visita Hetzner Console
.

Ve a la sección "Object Storage".

Crea un bucket nuevo, por ejemplo, audit-YYYYMMDD. Recuerda el nombre exacto del bucket, ya que lo usarás como BUCKET.

Crear una Access Key Temporal:

Ve a "Access Keys" en la Consola.

Crea una nueva key de acceso temporal:

Nombre: temp-upload-audit-YYYYMMDD.

Permisos: Dale permisos mínimos de lectura/escritura sobre objetos del bucket (con políticas de put/get/list si es necesario).

Guarda la información:

Endpoint: Obtén la URL de tu endpoint S3, como https://s3.region.hetzner.cloud.

Access Key y Secret Key: Copia y guarda ambos, ya que la clave secreta solo se muestra una vez durante la creación.

Una vez que tengas la información de la key (Access Key y Secret Key), pasa al Paso B.

PASO B — Preparar el host

Conéctate al host donde se encuentra el archivo (/tmp/hetzner_minimal_20251003_094947.tar.gz).

Ejecuta las comprobaciones para verificar si el archivo y las herramientas necesarias están disponibles:

# Verificar que el archivo existe
FILE="/tmp/hetzner_minimal_20251003_094947.tar.gz"
ls -l "$FILE" || echo "FILE_MISSING"

# Verificar herramientas necesarias
command -v aws || echo "aws-missing"
aws --version 2>&1 | head -n1 || true
command -v jq || echo "jq-missing"
command -v sha256sum || echo "sha256sum-missing"


Si aws-cli no está instalado, ejecuta los siguientes comandos para instalarlo:

sudo apt-get update
sudo apt-get install -y awscli jq


Exporta las variables de entorno para usar el script de carga:

export ENDPOINT_S3="LA_ENDPOINT_QUE_COPIASTE"
export ACCESS_KEY="TU_ACCESS_KEY_AQUI"
export SECRET_KEY="TU_SECRET_KEY_AQUI"
export BUCKET="nombre-del-bucket-que-creaste"
export AWS_DEFAULT_REGION="us-east-1"  # O la región de Hetzner si es distinta


Si todo está correcto, puedes proceder con el Paso C.

PASO C — Ejecutar el bloque de subida y verificación

Ejecuta el siguiente bloque de código para subir el archivo, calcular los hashes y comparar los valores:

#!/usr/bin/env bash
set -euo pipefail

FILE="/tmp/hetzner_minimal_20251003_094947.tar.gz"
if [ ! -f "$FILE" ]; then
  echo "{\"error\":\"file_not_found\",\"file\":\"$FILE\"}"
  exit 2
fi

# Variables: asegúrate de tener ENDPOINT_S3, ACCESS_KEY, SECRET_KEY, BUCKET exportadas
: "${ENDPOINT_S3:?Need to set ENDPOINT_S3}"
: "${ACCESS_KEY:?Need to set ACCESS_KEY}"
: "${SECRET_KEY:?Need to set SECRET_KEY}"
: "${BUCKET:?Need to set BUCKET}"

export AWS_ACCESS_KEY_ID="$ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$SECRET_KEY"
# AWS_DEFAULT_REGION may already be set; si no, no es crítico para endpoints custom.

OBJECT_NAME="$(basename "$FILE")"
S3_URI="s3://$BUCKET/$OBJECT_NAME"

# Intentar subir con aws-cli usando el --endpoint-url
echo "subiendo $FILE -> $S3_URI via endpoint $ENDPOINT_S3 ..."
if ! aws --endpoint-url "$ENDPOINT_S3" s3 cp "$FILE" "$S3_URI" --only-show-errors; then
  echo "{\"error\":\"upload_failed\"}"
  exit 3
fi

# calcular sha local
if command -v sha256sum >/dev/null 2>&1; then
  sha_local="$(sha256sum "$FILE" | awk '{print $1}')"
elif command -v shasum >/dev/null 2>&1; then
  sha_local="$(shasum -a 256 "$FILE" | awk '{print $1}')"
else
  echo "{\"error\":\"no_sha_tool\"}"
  exit 4
fi

# crear temp dir y descargar
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
aws --endpoint-url "$ENDPOINT_S3" s3 cp "$S3_URI" "$tmpdir/$OBJECT_NAME" --only-show-errors || { echo "{\"error\":\"download_failed\"}"; exit 5; }

# sha del remoto (archivo descargado)
if command -v sha256sum >/dev/null 2>&1; then
  sha_remote="$(sha256sum "$tmpdir/$OBJECT_NAME" | awk '{print $1}')"
else
  sha_remote="$(shasum -a 256 "$tmpdir/$OBJECT_NAME" | awk '{print $1}')"
fi

# Imprime resultado JSON (copialo y pégalo aquí)
if command -v jq >/dev/null 2>&1; then
  jq -n \
    --arg tar_path "$FILE" \
    --arg s3_uri "$S3_URI" \
    --arg sha_local "$sha_local" \
    --arg sha_remote "$sha_remote" \
    '{tar_path:$tar_path, s3_uri:$s3_uri, sha_local:$sha_local, sha_remote:$sha_remote}'
else
  echo "{\"tar_path\":\"$FILE\",\"s3_uri\":\"$S3_URI\",\"sha_local\":\"$sha_local\",\"sha_remote\":\"$sha_remote\"}"
fi

# Cleanup: unset credentials in-session
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN

PASO D — Borrar la clave temporal

Una vez que verifiques que los hashes coinciden (sha_local == sha_remote), ve a Hetzner Console → Object Storage → Access Keys y elimina la clave temporal que creaste. Confírmame que la borraste una vez lo hayas hecho.

Opciones de respuesta:

A) Si ya has creado la key y el bucket, ejecuta el bloque de código y pega el JSON resultante aquí.

B) Si no has creado la key, avísame y te proporcionaré los pasos detallados para crearla.

C) Si prefieres insertar los valores en un archivo keys.json en el repositorio (aunque no es recomendable), avísame.#!/usr/bin/env bash
set -euo pipefail

# check_s3_config.sh
# Pequeño helper para ejecutar en el host Hetzner.
# Detecta si aws-cli está instalado, si hay credenciales en variables de entorno o en ~/.aws,
# intenta un test rápido con STS (si la red lo permite) y muestra el comando exacto para
# subir un archivo (si se proporciona) al bucket S3 configurado.

FILE="${1:-}"

echo "== check_s3_config: comprobando entorno AWS/S3 =="

echo "Usuario actual: $(whoami)"
echo "HOME: ${HOME:-unset}"

AWS_CLI="$(command -v aws || true)"
if [ -n "$AWS_CLI" ]; then
  echo "aws-cli encontrado: $($AWS_CLI --version 2>&1 | head -n1)"
else
  echo "aws-cli NO encontrado en PATH. Para instalarlo en Debian/Ubuntu: apt-get update; apt-get install -y awscli" >&2
fi

# Environment variables
echo
echo "Variables de entorno relevantes:"
for v in AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_REGION AWS_S3_BUCKET AWS_PROFILE; do
  val="${!v:-}"
  if [ -n "$val" ]; then
    echo "  $v = set"
  else
    echo "  $v = unset"
  fi
done

echo
# Check common credentials files for the current user and for root
check_paths=("$HOME/.aws/credentials" "$HOME/.aws/config" "/root/.aws/credentials" "/root/.aws/config")
for p in "${check_paths[@]}"; do
  if [ -f "$p" ]; then
    echo "Se encontró: $p"
  fi
done

# If aws cli present, try a light test to see if credentials work (sts:GetCallerIdentity)
if [ -n "$AWS_CLI" ]; then
  echo
  echo "Intentando un test de credenciales con 'aws sts get-caller-identity' (fallará si no hay egress o credenciales inválidas)..."
  if aws sts get-caller-identity --output json >/tmp/check_s3_sts_out 2>/tmp/check_s3_sts_err; then
    echo "STS OK. Identidad obtenida:"
    jq -r '.Arn' /tmp/check_s3_sts_out || cat /tmp/check_s3_sts_out
    rm -f /tmp/check_s3_sts_out /tmp/check_s3_sts_err || true
  else
    echo "STS falló. Salida de error (si se generó):"
    sed -n '1,200p' /tmp/check_s3_sts_err || true
    rm -f /tmp/check_s3_sts_out /tmp/check_s3_sts_err || true
    echo "Esto puede significar: no hay credenciales configuradas, credenciales inválidas, o salida de red bloqueada desde este host."
  fi
fi

echo
if [ -z "$FILE" ]; then
  echo "No se proporcionó archivo a subir. Para comprobar la capacidad de subida, ejecuta:" 
  echo "  $0 /ruta/al/archivo.tar.gz"
else
  if [ ! -f "$FILE" ]; then
    echo "ERROR: el archivo '$FILE' no existe o no es accesible." >&2
    exit 3
  fi
  # Determine bucket
  BUCKET="${AWS_S3_BUCKET:-}"
  if [ -z "$BUCKET" ] && [ -n "$AWS_PROFILE" ]; then
    echo "No hay AWS_S3_BUCKET en variables de entorno. Puedes usar un bucket existente o crear uno." 
  fi

  if [ -n "$BUCKET" ]; then
    echo "Preparando comando de subida al bucket: $BUCKET"
    DEST="s3://$BUCKET/$(basename "$FILE")"
    if [ -n "$AWS_CLI" ]; then
      echo
      echo "Comando sugerido (sube archivo, acl privado):"
      echo "  aws s3 cp \"$FILE\" \"$DEST\" --only-show-errors"
      echo
      echo "Si quieres que el agente lo ejecute desde este host, copia exactamente la siguiente línea y pégala como un solo comando:" 
      echo "  aws s3 cp '$FILE' '$DEST' --only-show-errors"
    else
      echo "aws-cli no está instalado; no puedo generar el comando ejecutable. Instálalo y vuelve a ejecutar este script." >&2
    fi
  else
    echo "No encuentro AWS_S3_BUCKET configurado en el entorno. Opciones:
  - Exportar AWS_S3_BUCKET='mi-bucket' y ejecutar: aws s3 cp '$FILE' s3://mi-bucket/" 
    if [ -n "$AWS_CLI" ]; then
      echo "Puedes listar buckets accesibles (si las credenciales lo permiten) con:
  aws s3api list-buckets --query 'Buckets[].Name' --output text"
    fi
  fi
fi

echo
echo "Si prefieres que use scp para empujar el archivo a un servidor que controles, proporciona 'user@IP:/ruta/destino' y generaré el comando scp exacto para ejecutarlo desde este host." 

# presign_put.py
import boto3
import sys

bucket = "NOMBRE-DE-TU-BUCKET"
key = "hetzner_minimal_20251003_094947.tar.gz"
region = "us-east-1"   # ajusta si tu bucket está en otra región

s3 = boto3.client('s3', region_name=region)
url = s3.generate_presigned_url(
    ClientMethod='put_object',
    Params={'Bucket': bucket, 'Key': key},
    ExpiresIn=3600
)
print(url)

exit 0
