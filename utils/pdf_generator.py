from pathlib import Path

from fpdf import FPDF


PAGE_MARGIN = 15
BODY_FONT_SIZE = 9.5
SECTION_FONT_SIZE = 11
NAME_FONT_SIZE = 14


def clean_pdf_text(value):
    value = str(value or "")
    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "-",
        "\u2022": "-",
        "\xa0": " ",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    return value.encode("latin-1", "replace").decode("latin-1")


class ResumePDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(PAGE_MARGIN, PAGE_MARGIN, PAGE_MARGIN)
        self.set_auto_page_break(auto=True, margin=PAGE_MARGIN)
        self.set_title("Resume")
        self.set_author("Resume Builder")

    @property
    def content_width(self):
        return self.w - self.l_margin - self.r_margin


def ensure_space(pdf, height=18):
    if pdf.get_y() + height > pdf.h - pdf.b_margin:
        pdf.add_page()


def has_text(value):
    return bool(clean_pdf_text(value).strip())


def has_values(mapping):
    return any(has_text(value) for value in mapping.values())


def has_entry_content(entry):
    return any(has_text(value) for key, value in entry.items() if key != "bullets") or any(
        has_text(value) for value in entry.get("bullets", [])
    )


def fit_text(pdf, text, width):
    text = clean_pdf_text(text)
    if pdf.get_string_width(text) <= width:
        return text

    ellipsis = "..."
    while text and pdf.get_string_width(text + ellipsis) > width:
        text = text[:-1]
    return text.rstrip() + ellipsis


def section_heading(pdf, title):
    ensure_space(pdf, 16)
    if pdf.get_y() > PAGE_MARGIN + 8:
        pdf.ln(2)

    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", SECTION_FONT_SIZE)
    pdf.cell(0, 5, clean_pdf_text(title.upper()), ln=1)
    y = pdf.get_y()
    pdf.set_draw_color(0, 0, 0)
    pdf.set_line_width(0.35)
    pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
    pdf.ln(2)


def add_labeled_line(pdf, label, value):
    value = clean_pdf_text(value)
    if not value:
        return

    ensure_space(pdf, 8)
    pdf.set_x(pdf.l_margin)
    label_text = clean_pdf_text(f"{label}: ")
    pdf.set_font("Helvetica", "B", BODY_FONT_SIZE)
    label_width = pdf.get_string_width(label_text) + 1
    pdf.cell(label_width, 4.8, label_text, ln=0)

    pdf.set_font("Helvetica", "", BODY_FONT_SIZE)
    pdf.multi_cell(pdf.content_width - label_width, 4.8, value)
    pdf.set_x(pdf.l_margin)


def add_bullet(pdf, text):
    text = clean_pdf_text(text)
    if not text:
        return

    ensure_space(pdf, 8)
    pdf.set_font("Helvetica", "", BODY_FONT_SIZE)
    pdf.set_x(pdf.l_margin + 4)
    pdf.multi_cell(pdf.content_width - 4, 4.6, f"- {text}")
    pdf.set_x(pdf.l_margin)


def add_two_column_title(pdf, left_text, right_text, left_bold=True):
    if not has_text(left_text) and not has_text(right_text):
        return

    ensure_space(pdf, 10)
    right_text = clean_pdf_text(right_text)
    right_width = min(max(pdf.get_string_width(right_text) + 4, 32), 62)
    left_width = pdf.content_width - right_width

    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B" if left_bold else "", BODY_FONT_SIZE + 0.5)
    pdf.cell(left_width, 5, fit_text(pdf, left_text, left_width), ln=0)

    pdf.set_font("Helvetica", "", BODY_FONT_SIZE)
    pdf.cell(right_width, 5, fit_text(pdf, right_text, right_width), align="R", ln=1)


def add_header(pdf, personal):
    full_name = clean_pdf_text(personal.get("full_name") or "Resume")
    contact_parts = []
    for part in [
        personal.get("city"),
        personal.get("email"),
        personal.get("phone"),
        personal.get("linkedin"),
        personal.get("github"),
    ]:
        part = clean_pdf_text(part)
        if part:
            contact_parts.append(part)

    contact_line = " | ".join(contact_parts)

    pdf.set_font("Helvetica", "B", NAME_FONT_SIZE)
    pdf.set_x(pdf.l_margin)
    pdf.cell(0, 9, full_name, align="C", ln=1)

    pdf.set_font("Helvetica", "", 9)
    if contact_line:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 4.5, fit_text(pdf, contact_line, pdf.content_width), align="C")
    pdf.ln(3)


def add_summary(pdf, summary):
    if not has_text(summary):
        return

    section_heading(pdf, "Professional Summary")
    pdf.set_font("Helvetica", "", BODY_FONT_SIZE)
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(0, 4.8, clean_pdf_text(summary))
    pdf.set_x(pdf.l_margin)


def add_skills(pdf, skills):
    if not has_values(skills):
        return

    section_heading(pdf, "Technical Skills")
    for label, value in skills.items():
        add_labeled_line(pdf, label, value)


def add_experience(pdf, experiences):
    experiences = [experience for experience in experiences if has_entry_content(experience)]
    if not experiences:
        return

    section_heading(pdf, "Professional Experience")
    for index, experience in enumerate(experiences):
        if index:
            pdf.ln(1)

        add_two_column_title(
            pdf,
            experience.get("job_title", ""),
            experience.get("duration", ""),
            left_bold=True,
        )

        company_location = " | ".join(
            clean_pdf_text(value)
            for value in [experience.get("company"), experience.get("location")]
            if value
        )
        if company_location:
            pdf.set_font("Helvetica", "", BODY_FONT_SIZE)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(0, 4.6, company_location)
            pdf.set_x(pdf.l_margin)

        for bullet in experience.get("bullets", []):
            add_bullet(pdf, bullet)


def add_projects(pdf, projects):
    projects = [project for project in projects if has_entry_content(project)]
    if not projects:
        return

    section_heading(pdf, "Projects")
    for index, project in enumerate(projects):
        if index:
            pdf.ln(1)

        add_two_column_title(
            pdf,
            project.get("name", ""),
            project.get("github", ""),
            left_bold=True,
        )

        tech_stack = clean_pdf_text(project.get("tech_stack"))
        duration = clean_pdf_text(project.get("duration"))
        stack_line_parts = []
        if tech_stack:
            stack_line_parts.append(f"Tech Stack: {tech_stack}")
        if duration:
            stack_line_parts.append(f"Duration: {duration}")

        if stack_line_parts:
            pdf.set_font("Helvetica", "I", BODY_FONT_SIZE)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(0, 4.6, " | ".join(stack_line_parts))
            pdf.set_x(pdf.l_margin)

        for bullet in project.get("bullets", []):
            add_bullet(pdf, bullet)


def add_education(pdf, education):
    if not has_values(education):
        return

    section_heading(pdf, "Education")
    degree = clean_pdf_text(education.get("degree"))
    if degree:
        pdf.set_font("Helvetica", "B", BODY_FONT_SIZE + 0.5)
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 5, degree)
        pdf.set_x(pdf.l_margin)

    details = []
    if education.get("university"):
        details.append(clean_pdf_text(education.get("university")))
    if education.get("location"):
        details.append(clean_pdf_text(education.get("location")))
    if education.get("cgpa"):
        details.append(f"CGPA: {clean_pdf_text(education.get('cgpa'))}")
    if education.get("duration"):
        details.append(f"Duration: {clean_pdf_text(education.get('duration'))}")

    if details:
        pdf.set_font("Helvetica", "", BODY_FONT_SIZE)
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 4.8, " | ".join(details))
        pdf.set_x(pdf.l_margin)

    final_year_project = clean_pdf_text(education.get("final_year_project"))
    if final_year_project:
        add_labeled_line(pdf, "Final Year Project", final_year_project)


def add_certifications(pdf, certifications):
    certifications = [certification for certification in certifications if has_text(certification)]
    if not certifications:
        return

    section_heading(pdf, "Certifications & Achievements")
    for certification in certifications:
        add_bullet(pdf, certification)


def generate_resume_pdf(resume_data, output_path):
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    pdf = ResumePDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "", BODY_FONT_SIZE)

    add_header(pdf, resume_data.get("personal", {}))
    add_summary(pdf, resume_data.get("summary", ""))
    add_skills(pdf, resume_data.get("skills", {}))
    add_experience(pdf, resume_data.get("experiences", []))
    add_projects(pdf, resume_data.get("projects", []))
    add_education(pdf, resume_data.get("education", {}))
    add_certifications(pdf, resume_data.get("certifications", []))

    pdf.output(str(output_path))
    return output_path
