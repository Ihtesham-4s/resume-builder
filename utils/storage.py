import os

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()


def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def upload_to_cloudinary(file_path, filename):
    configure_cloudinary()

    upload_result = cloudinary.uploader.upload(
        str(file_path),
        public_id=f"resumes/{filename.replace('.pdf', '')}",
        resource_type="raw",
        overwrite=True,
    )
    return upload_result["secure_url"]
