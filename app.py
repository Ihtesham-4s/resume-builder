import json
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, abort, render_template, request, send_from_directory, url_for
from werkzeug.utils import secure_filename

from utils.pdf_generator import generate_resume_pdf


BASE_DIR = Path(__file__).resolve().parent
RESUME_DIR = BASE_DIR / "resumes"

load_dotenv()

app = Flask(__name__)
app.config["RESUME_DIR"] = RESUME_DIR
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


def text_field(name):
    return request.form.get(name, "").strip()


def clean_text(value):
    return str(value or "").strip()


def clean_list(values):
    if not isinstance(values, list):
        return []
    return [clean_text(value) for value in values if clean_text(value)]


def entry_has_content(entry):
    return any(value for key, value in entry.items() if key != "bullets") or bool(
        entry.get("bullets")
    )


def clean_experiences(values):
    if not isinstance(values, list):
        return []

    experiences = []
    for item in values:
        if not isinstance(item, dict):
            continue
        entry = {
            "job_title": clean_text(item.get("job_title")),
            "company": clean_text(item.get("company")),
            "duration": clean_text(item.get("duration")),
            "location": clean_text(item.get("location")),
            "bullets": clean_list(item.get("bullets")),
        }
        if entry_has_content(entry):
            experiences.append(entry)
    return experiences


def clean_projects(values):
    if not isinstance(values, list):
        return []

    projects = []
    for item in values:
        if not isinstance(item, dict):
            continue
        entry = {
            "name": clean_text(item.get("name")),
            "github": clean_text(item.get("github")),
            "duration": clean_text(item.get("duration")),
            "tech_stack": clean_text(item.get("tech_stack")),
            "bullets": clean_list(item.get("bullets")),
        }
        if entry_has_content(entry):
            projects.append(entry)
    return projects


def parse_resume_payload():
    raw_payload = request.form.get("resume_payload", "")
    if not raw_payload:
        return {}

    try:
        payload = json.loads(raw_payload)
    except json.JSONDecodeError:
        return {}

    return payload if isinstance(payload, dict) else {}


def collect_resume_data():
    payload = parse_resume_payload()
    personal = payload.get("personal", {}) if payload else {}
    skills = payload.get("skills", {}) if payload else {}
    education = payload.get("education", {}) if payload else {}

    return {
        "personal": {
            "full_name": clean_text(personal.get("full_name") or text_field("full_name")),
            "city": clean_text(personal.get("city") or text_field("city")),
            "email": clean_text(personal.get("email") or text_field("email")),
            "phone": clean_text(personal.get("phone") or text_field("phone")),
            "linkedin": clean_text(personal.get("linkedin") or text_field("linkedin")),
            "github": clean_text(personal.get("github") or text_field("github")),
        },
        "summary": clean_text(payload.get("summary") if payload else text_field("summary")),
        "skills": {
            "Languages": clean_text(skills.get("Languages") or text_field("skills_languages")),
            "Backend": clean_text(skills.get("Backend") or text_field("skills_backend")),
            "Frontend": clean_text(skills.get("Frontend") or text_field("skills_frontend")),
            "Database": clean_text(skills.get("Database") or text_field("skills_database")),
            "Cloud & DevOps": clean_text(
                skills.get("Cloud & DevOps") or text_field("skills_cloud_devops")
            ),
        },
        "experiences": clean_experiences(payload.get("experiences", [])),
        "projects": clean_projects(payload.get("projects", [])),
        "education": {
            "degree": clean_text(education.get("degree") or text_field("education_degree")),
            "university": clean_text(
                education.get("university") or text_field("education_university")
            ),
            "location": clean_text(
                education.get("location") or text_field("education_location")
            ),
            "cgpa": clean_text(education.get("cgpa") or text_field("education_cgpa")),
            "duration": clean_text(
                education.get("duration") or text_field("education_duration")
            ),
            "final_year_project": clean_text(
                education.get("final_year_project") or text_field("education_fyp")
            ),
        },
        "certifications": clean_list(payload.get("certifications", [])),
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    data = collect_resume_data()
    full_name = data["personal"]["full_name"]
    if not full_name:
        return render_template("index.html", error="Full Name is required."), 400

    filename_root = secure_filename(full_name.replace(" ", "_")) or "resume"
    filename = f"{filename_root}.pdf"
    output_path = app.config["RESUME_DIR"] / filename

    app.config["RESUME_DIR"].mkdir(parents=True, exist_ok=True)
    generate_resume_pdf(data, output_path)

    return render_template(
        "success.html",
        filename=filename,
        full_name=full_name,
        download_url=url_for("download_resume", filename=filename),
    )


@app.route("/download/<filename>")
def download_resume(filename):
    if secure_filename(filename) != filename:
        abort(404)
    return send_from_directory(app.config["RESUME_DIR"], filename, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)
