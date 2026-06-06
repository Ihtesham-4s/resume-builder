document.addEventListener("DOMContentLoaded", () => {
    const DRAFT_KEY = "resume_builder_draft";
    const form = document.querySelector("#resume-form");
    const payloadInput = document.querySelector("#resume-payload");
    const experienceList = document.querySelector("#experience-list");
    const projectList = document.querySelector("#project-list");
    const certificationList = document.querySelector("#certification-list");
    const previewPanel = document.querySelector("#live-preview");

    const getValue = (selector, root = form) => {
        const element = root.querySelector(selector);
        return element ? element.value.trim() : "";
    };

    const getNamedValue = (name) => {
        const element = form.elements[name];
        return element ? element.value.trim() : "";
    };

    const hasEntryContent = (entry) => {
        return Object.entries(entry).some(([key, value]) => {
            if (key === "bullets") {
                return value.length > 0;
            }
            return Boolean(value);
        });
    };

    const renumberEntries = (container, label) => {
        container.querySelectorAll("[data-entry-title]").forEach((title, index) => {
            title.textContent = `${label} ${index + 1}`;
        });
    };

    const createField = (labelText, fieldName, placeholder = "", type = "text") => {
        const label = document.createElement("label");
        label.textContent = labelText;

        const input = document.createElement("input");
        input.type = type;
        input.dataset.field = fieldName;
        input.placeholder = placeholder;

        label.appendChild(input);
        return label;
    };

    const addBullet = (list, placeholder = "Describe impact, tools, or results", value = "") => {
        const row = document.createElement("div");
        row.className = "inline-row bullet-row";

        const label = document.createElement("label");
        label.className = "grow-field";
        label.textContent = "Bullet Point";

        const input = document.createElement("input");
        input.type = "text";
        input.dataset.bulletInput = "true";
        input.placeholder = placeholder;
        input.value = value;
        label.appendChild(input);

        const removeButton = document.createElement("button");
        removeButton.className = "ghost-button danger-button icon-button";
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", "Remove bullet");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => {
            row.remove();
            scheduleDraftSave();
            updatePreview();
        });

        row.append(label, removeButton);
        list.appendChild(row);
        return input;
    };

    const addExperience = (data = {}) => {
        const entry = document.createElement("article");
        entry.className = "dynamic-entry";
        entry.dataset.dynamicEntry = "experience";

        const header = document.createElement("div");
        header.className = "entry-header";

        const title = document.createElement("h3");
        title.dataset.entryTitle = "true";

        const removeButton = document.createElement("button");
        removeButton.className = "ghost-button danger-button icon-button";
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", "Remove experience");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => {
            entry.remove();
            renumberEntries(experienceList, "Experience");
            scheduleDraftSave();
            updatePreview();
        });

        header.append(title, removeButton);

        const grid = document.createElement("div");
        grid.className = "grid two-columns";
        grid.append(
            createField("Job Title", "job_title"),
            createField("Company", "company"),
            createField("Duration", "duration", "Jan 2025 - Present"),
            createField("Location", "location")
        );

        const bulletHeader = document.createElement("div");
        bulletHeader.className = "subsection-row";
        const bulletTitle = document.createElement("h4");
        bulletTitle.textContent = "Bullet Points";
        const addBulletButton = document.createElement("button");
        addBulletButton.className = "secondary-button small-button";
        addBulletButton.type = "button";
        addBulletButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Bullet';

        const bulletList = document.createElement("div");
        bulletList.className = "bullet-list";
        addBulletButton.addEventListener("click", () => {
            const input = addBullet(bulletList);
            input.focus();
            scheduleDraftSave();
            updatePreview();
        });

        bulletHeader.append(bulletTitle, addBulletButton);
        entry.append(header, grid, bulletHeader, bulletList);
        experienceList.appendChild(entry);

        entry.querySelector("[data-field='job_title']").value = data.job_title || "";
        entry.querySelector("[data-field='company']").value = data.company || "";
        entry.querySelector("[data-field='duration']").value = data.duration || "";
        entry.querySelector("[data-field='location']").value = data.location || "";

        const bullets = data.bullets && data.bullets.length ? data.bullets : [""];
        bullets.forEach((bullet) => addBullet(bulletList, "Describe impact, tools, or results", bullet));

        renumberEntries(experienceList, "Experience");
        return entry;
    };

    const addProject = (data = {}) => {
        const entry = document.createElement("article");
        entry.className = "dynamic-entry";
        entry.dataset.dynamicEntry = "project";

        const header = document.createElement("div");
        header.className = "entry-header";

        const title = document.createElement("h3");
        title.dataset.entryTitle = "true";

        const removeButton = document.createElement("button");
        removeButton.className = "ghost-button danger-button icon-button";
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", "Remove project");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => {
            entry.remove();
            renumberEntries(projectList, "Project");
            scheduleDraftSave();
            updatePreview();
        });

        header.append(title, removeButton);

        const grid = document.createElement("div");
        grid.className = "grid two-columns";
        grid.append(
            createField("Project Name", "name"),
            createField("GitHub Link", "github", "https://github.com/username/repository", "url"),
            createField("Duration", "duration"),
            createField("Tech Stack", "tech_stack", "Python, Flask, AWS")
        );

        const bulletHeader = document.createElement("div");
        bulletHeader.className = "subsection-row";
        const bulletTitle = document.createElement("h4");
        bulletTitle.textContent = "Bullet Points";
        const addBulletButton = document.createElement("button");
        addBulletButton.className = "secondary-button small-button";
        addBulletButton.type = "button";
        addBulletButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Bullet';

        const bulletList = document.createElement("div");
        bulletList.className = "bullet-list";
        addBulletButton.addEventListener("click", () => {
            const input = addBullet(bulletList, "Describe feature, scope, or result");
            input.focus();
            scheduleDraftSave();
            updatePreview();
        });

        bulletHeader.append(bulletTitle, addBulletButton);
        entry.append(header, grid, bulletHeader, bulletList);
        projectList.appendChild(entry);

        entry.querySelector("[data-field='name']").value = data.name || "";
        entry.querySelector("[data-field='github']").value = data.github || "";
        entry.querySelector("[data-field='duration']").value = data.duration || "";
        entry.querySelector("[data-field='tech_stack']").value = data.tech_stack || "";

        const bullets = data.bullets && data.bullets.length ? data.bullets : [""];
        bullets.forEach((bullet) => addBullet(bulletList, "Describe feature, scope, or result", bullet));

        renumberEntries(projectList, "Project");
        return entry;
    };

    const addCertification = (value = "") => {
        const row = document.createElement("div");
        row.className = "inline-row certification-row";
        row.dataset.certification = "true";

        const label = document.createElement("label");
        label.className = "grow-field";
        label.textContent = "Certification or Achievement";

        const input = document.createElement("input");
        input.type = "text";
        input.dataset.certificationInput = "true";
        input.placeholder = "AWS Cloud Practitioner, Dean's List, Hackathon Winner";
        input.value = value;
        label.appendChild(input);

        const removeButton = document.createElement("button");
        removeButton.className = "ghost-button danger-button icon-button";
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", "Remove certification");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => {
            row.remove();
            scheduleDraftSave();
            updatePreview();
        });

        row.append(label, removeButton);
        certificationList.appendChild(row);
        return input;
    };

    const collectBullets = (entry) => {
        return Array.from(entry.querySelectorAll("[data-bullet-input]"))
            .map((input) => input.value.trim())
            .filter(Boolean);
    };

    const collectExperiences = () => {
        return Array.from(experienceList.querySelectorAll("[data-dynamic-entry='experience']"))
            .map((entry) => ({
                job_title: getValue("[data-field='job_title']", entry),
                company: getValue("[data-field='company']", entry),
                duration: getValue("[data-field='duration']", entry),
                location: getValue("[data-field='location']", entry),
                bullets: collectBullets(entry),
            }))
            .filter(hasEntryContent);
    };

    const collectProjects = () => {
        return Array.from(projectList.querySelectorAll("[data-dynamic-entry='project']"))
            .map((entry) => ({
                name: getValue("[data-field='name']", entry),
                github: getValue("[data-field='github']", entry),
                duration: getValue("[data-field='duration']", entry),
                tech_stack: getValue("[data-field='tech_stack']", entry),
                bullets: collectBullets(entry),
            }))
            .filter(hasEntryContent);
    };

    const collectCertifications = () => {
        return Array.from(certificationList.querySelectorAll("[data-certification-input]"))
            .map((input) => input.value.trim())
            .filter(Boolean);
    };

    const collectPayload = () => ({
        personal: {
            full_name: getNamedValue("full_name"),
            city: getNamedValue("city"),
            email: getNamedValue("email"),
            phone: getNamedValue("phone"),
            linkedin: getNamedValue("linkedin"),
            github: getNamedValue("github"),
        },
        summary: getNamedValue("summary"),
        skills: {
            Languages: getNamedValue("skills_languages"),
            Backend: getNamedValue("skills_backend"),
            Frontend: getNamedValue("skills_frontend"),
            Database: getNamedValue("skills_database"),
            "Cloud & DevOps": getNamedValue("skills_cloud_devops"),
        },
        experiences: collectExperiences(),
        projects: collectProjects(),
        education: {
            degree: getNamedValue("education_degree"),
            university: getNamedValue("education_university"),
            location: getNamedValue("education_location"),
            cgpa: getNamedValue("education_cgpa"),
            duration: getNamedValue("education_duration"),
            final_year_project: getNamedValue("education_fyp"),
        },
        certifications: collectCertifications(),
    });

    const setNamedValue = (name, value) => {
        const element = form.elements[name];
        if (element) {
            element.value = value || "";
        }
    };

    const restoreDraft = (draft) => {
        if (!draft || typeof draft !== "object") {
            return;
        }

        const personal = draft.personal || {};
        setNamedValue("full_name", personal.full_name);
        setNamedValue("city", personal.city);
        setNamedValue("email", personal.email);
        setNamedValue("phone", personal.phone);
        setNamedValue("linkedin", personal.linkedin);
        setNamedValue("github", personal.github);
        setNamedValue("summary", draft.summary);

        const skills = draft.skills || {};
        setNamedValue("skills_languages", skills.Languages);
        setNamedValue("skills_backend", skills.Backend);
        setNamedValue("skills_frontend", skills.Frontend);
        setNamedValue("skills_database", skills.Database);
        setNamedValue("skills_cloud_devops", skills["Cloud & DevOps"]);

        experienceList.innerHTML = "";
        (draft.experiences || []).forEach((experience) => addExperience(experience));

        projectList.innerHTML = "";
        (draft.projects || []).forEach((project) => addProject(project));

        const education = draft.education || {};
        setNamedValue("education_degree", education.degree);
        setNamedValue("education_university", education.university);
        setNamedValue("education_location", education.location);
        setNamedValue("education_cgpa", education.cgpa);
        setNamedValue("education_duration", education.duration);
        setNamedValue("education_fyp", education.final_year_project);

        certificationList.innerHTML = "";
        (draft.certifications || []).forEach((certification) => addCertification(certification));
    };

    let saveTimer = null;
    const scheduleDraftSave = () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(collectPayload()));
        }, 400);
    };

    const escapeHtml = (value) => {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    };

    const previewSection = (title, bodyHtml) => {
        if (!bodyHtml) {
            return "";
        }
        return `<section class="preview-section"><h3>${escapeHtml(title)}</h3>${bodyHtml}</section>`;
    };

    const updatePreview = () => {
        if (!previewPanel) {
            return;
        }

        const data = collectPayload();
        const contact = [
            data.personal.city,
            data.personal.email,
            data.personal.phone,
            data.personal.linkedin,
            data.personal.github,
        ].filter(Boolean);

        let html = "";
        if (data.personal.full_name) {
            html += `<div class="preview-name">${escapeHtml(data.personal.full_name)}</div>`;
        }
        if (contact.length) {
            html += `<div class="preview-contact">${escapeHtml(contact.join(" | "))}</div>`;
        }

        if (data.summary) {
            html += previewSection(
                "Professional Summary",
                `<p>${escapeHtml(data.summary)}</p>`
            );
        }

        const skillLines = Object.entries(data.skills)
            .filter(([, value]) => value)
            .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
            .join("");
        html += previewSection("Technical Skills", skillLines);

        const experienceHtml = data.experiences
            .map((experience) => {
                const companyLocation = [experience.company, experience.location].filter(Boolean).join(" | ");
                const bullets = experience.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
                return `
                    <article class="preview-entry">
                        <div class="preview-entry-title">
                            <strong>${escapeHtml(experience.job_title || "Role")}</strong>
                            <span>${escapeHtml(experience.duration)}</span>
                        </div>
                        ${companyLocation ? `<p>${escapeHtml(companyLocation)}</p>` : ""}
                        ${bullets ? `<ul>${bullets}</ul>` : ""}
                    </article>
                `;
            })
            .join("");
        html += previewSection("Professional Experience", experienceHtml);

        const projectHtml = data.projects
            .map((project) => {
                const bullets = project.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
                return `
                    <article class="preview-entry">
                        <div class="preview-entry-title">
                            <strong>${escapeHtml(project.name || "Project")}</strong>
                            <span>${escapeHtml(project.github)}</span>
                        </div>
                        ${project.tech_stack ? `<p><em>${escapeHtml(project.tech_stack)}</em></p>` : ""}
                        ${bullets ? `<ul>${bullets}</ul>` : ""}
                    </article>
                `;
            })
            .join("");
        html += previewSection("Projects", projectHtml);

        const education = data.education;
        const educationParts = [
            education.university,
            education.location,
            education.cgpa ? `CGPA: ${education.cgpa}` : "",
            education.duration ? `Duration: ${education.duration}` : "",
        ].filter(Boolean);
        let educationHtml = "";
        if (education.degree) {
            educationHtml += `<p><strong>${escapeHtml(education.degree)}</strong></p>`;
        }
        if (educationParts.length) {
            educationHtml += `<p>${escapeHtml(educationParts.join(" | "))}</p>`;
        }
        if (education.final_year_project) {
            educationHtml += `<p><strong>Final Year Project:</strong> ${escapeHtml(education.final_year_project)}</p>`;
        }
        html += previewSection("Education", educationHtml);

        const certHtml = data.certifications.map((cert) => `<li>${escapeHtml(cert)}</li>`).join("");
        html += previewSection("Certifications & Achievements", certHtml ? `<ul>${certHtml}</ul>` : "");

        previewPanel.innerHTML = html || '<p class="preview-empty">Start typing to see a live preview of your resume.</p>';
    };

    document.querySelector("#add-experience").addEventListener("click", () => {
        const entry = addExperience();
        entry.querySelector("input").focus();
        scheduleDraftSave();
        updatePreview();
    });

    document.querySelector("#add-project").addEventListener("click", () => {
        const entry = addProject();
        entry.querySelector("input").focus();
        scheduleDraftSave();
        updatePreview();
    });

    document.querySelector("#add-certification").addEventListener("click", () => {
        const input = addCertification();
        input.focus();
        scheduleDraftSave();
        updatePreview();
    });

    document.querySelector("#clear-draft")?.addEventListener("click", () => {
        localStorage.removeItem(DRAFT_KEY);
        form.reset();
        experienceList.innerHTML = "";
        projectList.innerHTML = "";
        certificationList.innerHTML = "";
        updatePreview();
    });

    form.addEventListener("input", () => {
        scheduleDraftSave();
        updatePreview();
    });

    form.addEventListener("submit", () => {
        payloadInput.value = JSON.stringify(collectPayload());
        localStorage.removeItem(DRAFT_KEY);
    });

    try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            restoreDraft(JSON.parse(savedDraft));
        } else {
            addExperience();
            addProject();
            addCertification();
        }
    } catch (error) {
        localStorage.removeItem(DRAFT_KEY);
        addExperience();
        addProject();
        addCertification();
    }

    updatePreview();
});
