import os
from pathlib import Path

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def configure_cloudinary():
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        raise ValueError(
            "Missing Cloudinary credentials. Check CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env"
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def upload_to_cloudinary(file_path, filename):
    configure_cloudinary()

    upload_result = cloudinary.uploader.upload(
        str(file_path),
        folder="resumes",
        public_id=filename.replace(".pdf", ""),
        resource_type="raw",
        use_filename=True,
        overwrite=True,
    )
    return upload_result["secure_url"]
