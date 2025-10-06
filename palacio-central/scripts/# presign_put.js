# presign_put.py
# Genera una presigned URL para subir (PUT) un objeto a S3.
import boto3
import sys
import time

# --- CONFIGURA ESTAS VARIABLES ---
BUCKET = "NOMBRE-DE-TU-BUCKET"   # <- reemplaza por tu bucket
KEY = "hetzner_minimal_20251003_094947.tar.gz"  # nombre del objeto en S3
REGION = "us-east-1"  # ajusta si tu bucket está en otra región
EXPIRES = 3600  # segundos, duración de la URL pre-firmada
# ---------------------------------

def main():
    if BUCKET.startswith("NOMBRE-DE"):
        print("ERROR: edita el archivo y reemplaza BUCKET por el nombre real de tu bucket S3.")
        sys.exit(2)

    try:
        s3 = boto3.client('s3', region_name=REGION)
        url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={'Bucket': BUCKET, 'Key': KEY},
            ExpiresIn=EXPIRES
        )
        print(url)
    except Exception as e:
        print("ERROR: al generar la presigned URL:", e, file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()