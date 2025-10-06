winget install GitHub.cli
gh auth login

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