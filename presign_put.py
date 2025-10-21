# presign_put.py
# Genera una presigned URL para subir (PUT) un objeto a S3 usando boto3
import boto3, os, sys

BUCKET = os.environ.get('BUCKET')
if not BUCKET:
    print("ERROR: define la variable de entorno BUCKET antes de ejecutar este script.", file=sys.stderr)
    sys.exit(2)

KEY = os.environ.get('KEY', 'hetzner_minimal_20251003_094947.tar.gz')
REGION = os.environ.get('REGION', 'us-east-1')
EXPIRES = int(os.environ.get('EXPIRES', '3600'))

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
