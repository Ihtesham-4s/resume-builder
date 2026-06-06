import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


def upload_to_cloudinary(file_path, filename):
    result = cloudinary.uploader.upload(
        file_path,
        resource_type="raw",
        folder="resumes",
        public_id=filename,
        overwrite=True,
        invalidate=True
    )
    return result["secure_url"]
