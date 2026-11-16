# Resume Builder

A Flask web application for creating professional, ATS-friendly resumes and exporting them as PDF files.

## Features

- Live resume preview while editing
- Personal information, summary, skills, experience, projects, education, and certifications
- ATS-friendly PDF generation
- Local PDF downloads
- Optional Cloudinary upload for cloud storage
- Responsive interface

## Tech Stack

- Python 3.11
- Flask
- FPDF2
- Cloudinary
- HTML, CSS, and JavaScript
- Gunicorn for production deployment

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ihtesham-4s/resume-builder.git
cd resume-builder
```

### 2. Create and activate a virtual environment

Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure optional Cloudinary storage

Create a `.env` file in the project root:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

If these values are not configured, generated resumes remain available through local downloads.

### 5. Run the application

```bash
python app.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Production Deployment

The included `Procfile` runs the application with Gunicorn:

```text
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

Set the Cloudinary environment variables in the hosting provider's secret or environment-variable settings. Do not commit `.env` files or API credentials.

## Project Structure

```text
app.py                    Flask routes and resume form processing
utils/pdf_generator.py    PDF generation
utils/storage.py          Cloudinary upload integration
templates/                Jinja2 HTML templates
static/                   CSS and JavaScript assets
resumes/                  Generated and sample PDF files
```

## License

This project is available for educational and personal use.
