import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from typing import Optional

class S3Uploader:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        ) if settings.aws_access_key_id else None
    
    async def upload_file(self, file_path: str, object_name: str) -> Optional[str]:
        if not self.s3_client or not settings.s3_bucket:
            print("S3 not configured, skipping upload")
            return None
        
        try:
            self.s3_client.upload_file(file_path, settings.s3_bucket, object_name)
            return f"https://{settings.s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{object_name}"
        except ClientError as e:
            print(f"S3 upload failed: {e}")
            return None