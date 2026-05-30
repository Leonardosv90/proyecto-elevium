const body = document.body;
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

const SITE_NAV_LINKS = [
  { href: "index.html", label: "Inicio" },
  { href: "metodo-elevar.html", label: "Método" },
  { href: "servicios.html", label: "Servicios" },
  { href: "marca-personal-profesional.html", label: "Marca personal" },
  { href: "ia-para-negocios.html", label: "IA" },
  { href: "casos.html", label: "Casos" },
  { href: "recursos.html", label: "Recursos" },
  { href: "sobre-elevium.html", label: "Nosotros" },
  { href: "contacto.html", label: "Contacto" }
];

function renderSiteNavigation() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("[data-nav]").forEach((navElement) => {
    navElement.replaceChildren();

    SITE_NAV_LINKS.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      if (item.href === currentPage) link.classList.add("active");
      navElement.append(link);
    });
  });
}

renderSiteNavigation();

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
    });
  });
}

function getFormPayload(form) {
  const data = new FormData(form);
  const payload = {};
  data.forEach((value, key) => {
    payload[key] = String(value).trim();
  });
  payload.formulario = form.getAttribute("data-lead-form") || "lead";
  payload.pagina = window.location.pathname.split("/").pop() || "index.html";
  payload.fecha = new Date().toISOString();
  return payload;
}

function saveLocalLead(payload) {
  const storageKey = "elevium_leads";
  const leads = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
  leads.push(payload);
  window.localStorage.setItem(storageKey, JSON.stringify(leads));
}

const diagnosticProfiles = [
  {
    min: 0,
    max: 10,
    level: "Base por ordenar",
    title: "Tu marca necesita estructura antes de acelerar.",
    recommendation: "Prioriza claridad de mensaje, oferta, pilares de contenido y una ruta simple de captacion antes de invertir en mas publicaciones."
  },
  {
    min: 11,
    max: 18,
    level: "Presencia en desarrollo",
    title: "Ya hay movimiento, pero falta convertirlo en autoridad.",
    recommendation: "Conviene ordenar tu narrativa, profesionalizar tu sistema visual y conectar contenido, diagnostico y seguimiento comercial."
  },
  {
    min: 19,
    max: 24,
    level: "Autoridad lista para escalar",
    title: "Tu marca tiene base para crecer con mas sistema.",
    recommendation: "El siguiente paso es medir, automatizar, crear activos de captacion y usar IA para producir con mas velocidad sin perder criterio."
  }
];

function getDiagnosticResult(score) {
  return diagnosticProfiles.find((profile) => score >= profile.min && score <= profile.max) || diagnosticProfiles[0];
}

function updateDiagnosticResult(form) {
  const questions = Array.from(form.querySelectorAll("[data-diagnostic-question]"));
  if (!questions.length) return null;

  let answered = 0;
  let score = 0;

  questions.forEach((question) => {
    const checked = question.querySelector('input[type="radio"]:checked');
    if (checked) {
      answered += 1;
      score += Number(checked.dataset.score || checked.value || 0);
    }
  });

  const result = getDiagnosticResult(score);
  const scoreField = form.querySelector('[name="diagnostico_puntaje"]');
  const levelField = form.querySelector('[name="diagnostico_nivel"]');
  const recommendationField = form.querySelector('[name="diagnostico_recomendacion"]');
  const panel = form.querySelector("[data-diagnostic-result]");
  const progress = form.querySelector("[data-diagnostic-progress]");

  if (scoreField) scoreField.value = String(score);
  if (levelField) levelField.value = result.level;
  if (recommendationField) recommendationField.value = result.recommendation;

  if (progress) {
    progress.textContent = `${answered} de ${questions.length} respuestas`;
  }

  if (panel) {
    const complete = answered === questions.length;
    panel.classList.toggle("is-complete", complete);
    panel.querySelector("[data-result-score]").textContent = complete ? `${score}/24` : "--/24";
    panel.querySelector("[data-result-level]").textContent = complete ? result.level : "Completa el diagnostico";
    panel.querySelector("[data-result-title]").textContent = complete ? result.title : "Tu resultado aparecera aqui.";
    panel.querySelector("[data-result-copy]").textContent = complete
      ? result.recommendation
      : "Responde las preguntas estrategicas para recibir una lectura inicial antes de enviar tu solicitud.";
  }

  return { answered, total: questions.length, score, ...result };
}

function setDiagnosticStep(form, step) {
  const steps = Array.from(form.querySelectorAll("[data-diagnostic-step]"));
  if (!steps.length) return;

  const targetStep = Math.min(Math.max(step, 1), steps.length);
  const label = form.querySelector("[data-diagnostic-step-label]");
  steps.forEach((item) => {
    item.classList.toggle("is-active", Number(item.dataset.diagnosticStep) === targetStep);
  });
  form.dataset.currentStep = String(targetStep);
  if (label) label.textContent = `Paso ${targetStep} de ${steps.length}`;
  form.querySelector("[data-form-status]").textContent = "";
}

function getFirstMissingDiagnosticQuestion(form) {
  return Array.from(form.querySelectorAll("[data-diagnostic-question]")).find((question) => {
    return !question.querySelector('input[type="radio"]:checked');
  });
}

document.querySelectorAll("[data-lead-form]").forEach((form) => {
  updateDiagnosticResult(form);
  setDiagnosticStep(form, 1);

  form.querySelectorAll("[data-diagnostic-question] input").forEach((input) => {
    input.addEventListener("change", () => updateDiagnosticResult(form));
  });

  form.querySelectorAll("[data-diagnostic-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const status = form.querySelector("[data-form-status]");
      const currentStep = Number(form.dataset.currentStep || 1);
      const diagnosticResult = updateDiagnosticResult(form);

      if (currentStep === 1 && diagnosticResult && diagnosticResult.answered < diagnosticResult.total) {
        const firstMissing = getFirstMissingDiagnosticQuestion(form);
        firstMissing?.querySelector("input")?.focus();
        if (status) status.textContent = "Completa las 6 preguntas para ver tu resultado.";
        return;
      }

      setDiagnosticStep(form, currentStep + 1);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  form.querySelectorAll("[data-diagnostic-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentStep = Number(form.dataset.currentStep || 1);
      setDiagnosticStep(form, currentStep - 1);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");

    const diagnosticResult = updateDiagnosticResult(form);
    if (diagnosticResult && diagnosticResult.answered < diagnosticResult.total) {
      setDiagnosticStep(form, 1);
      const firstMissing = getFirstMissingDiagnosticQuestion(form);
      firstMissing?.querySelector("input")?.focus();
      if (status) status.textContent = "Completa todas las preguntas del diagnostico para calcular tu resultado.";
      return;
    }

    const contactFields = Array.from(form.querySelectorAll(".contact-fields [required]"));
    const invalid = contactFields.find((field) => !field.checkValidity());

    if (invalid) {
      setDiagnosticStep(form, 3);
      invalid.focus();
      if (status) status.textContent = "Por favor completa tus datos para enviar la solicitud.";
      return;
    }

    const email = form.querySelector('input[type="email"]');
    if (email && email.value && !email.checkValidity()) {
      email.focus();
      if (status) status.textContent = "Revisa el correo electrónico antes de enviar.";
      return;
    }

    const endpoint = form.getAttribute("data-endpoint");
    const target = form.getAttribute("data-success") || "gracias-diagnostico.html";
    const payload = getFormPayload(form);

    if (status) status.textContent = "Procesando tu solicitud...";
    form.querySelectorAll("button, input, select, textarea").forEach((field) => {
      field.disabled = true;
    });

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("No se pudo enviar la solicitud.");
      } else {
        saveLocalLead(payload);
      }

      if (status) {
        status.textContent = endpoint
          ? "Tu solicitud fue enviada correctamente. Redirigiendo..."
          : "Solicitud registrada en esta versión local. Redirigiendo...";
      }

      window.setTimeout(() => {
        window.location.href = target;
      }, 520);
    } catch (error) {
      if (status) status.textContent = "No pudimos enviar la solicitud. Intenta nuevamente o escríbenos por WhatsApp.";
      form.querySelectorAll("button, input, select, textarea").forEach((field) => {
        field.disabled = false;
      });
    }
  });
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest("[data-filter-group]");
    const value = button.getAttribute("data-filter");
    group.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll("[data-case]").forEach((card) => {
      const match = value === "todos" || card.dataset.case === value;
      card.style.display = match ? "" : "none";
    });
  });
});

const CINEMATIC_BACKGROUNDS = {
  default: [
    "mpfs470u-ChatGPT-Image-20-may-2026_-10_28_20-p.m.-_5_.webp",
    "mpfs4k7s-ChatGPT-Image-21-may-2026_-11_34_20-a.m.-_3_.webp"
  ],
  "index.html": [
    "mpfs4k56-ChatGPT-Image-21-may-2026_-11_34_19-a.m.-_2_.webp",
    "mpfs4k7s-ChatGPT-Image-21-may-2026_-11_34_20-a.m.-_3_.webp"
  ],
  "servicios.html": [
    "mpfs46n7-ChatGPT-Image-20-may-2026_-10_28_19-p.m.-_1_.webp",
    "mpfryc2f-ChatGPT-Image-20-may-2026_-10_59_15-p.m.-_1_.webp"
  ],
  "ia-para-negocios.html": [
    "mpfs475y-ChatGPT-Image-20-may-2026_-10_28_21-p.m.-_6_.webp",
    "mpfryc8a-ChatGPT-Image-20-may-2026_-10_59_16-p.m.-_3_.webp"
  ],
  "marca-personal-profesional.html": [
    "mpfs3onp-ChatGPT-Image-20-may-2026_-10_39_30-p.m.-_1_.webp",
    "mpfs4e4h-ChatGPT-Image-21-may-2026_-10_50_01-a.m.-_1_.webp"
  ],
  "metodo-elevar.html": [
    "mpfs3us5-ChatGPT-Image-20-may-2026_-10_13_42-p.m.-_2_.webp",
    "mpfrzcj6-ChatGPT-Image-21-may-2026_-11_16_41-a.m..webp"
  ],
  "diagnostico.html": [
    "mpg3lm6h-ChatGPT-Image-20-may-2026_-05_31_39-p.m.-_2_.webp"
  ],
  "contacto.html": [
    "mpfs4e7h-ChatGPT-Image-21-may-2026_-10_50_02-a.m.-_2_.webp",
    "mpfs4k56-ChatGPT-Image-21-may-2026_-11_34_19-a.m.-_2_.webp"
  ],
  "sobre-elevium.html": [
    "mpfs4ebb-ChatGPT-Image-21-may-2026_-10_50_02-a.m.-_3_.webp",
    "mpfs4eh9-ChatGPT-Image-21-may-2026_-10_50_02-a.m.-_4_.webp"
  ],
  "casos.html": [
    "mpfrznvw-ChatGPT-Image-20-may-2026_-09_42_54-p.m..webp",
    "mpfs46we-ChatGPT-Image-20-may-2026_-10_28_20-p.m.-_4_.webp"
  ],
  "recursos.html": [
    "mpfrzhvo-ChatGPT-Image-21-may-2026_-11_26_49-a.m.-_1_.webp",
    "mpfrzhy6-ChatGPT-Image-21-may-2026_-11_26_50-a.m.-_2_.webp"
  ],
  band: [
    "mpfryu4w-ChatGPT-Image-20-may-2026_-05_31_40-p.m.-_6_.webp",
    "mpfryu1l-ChatGPT-Image-20-may-2026_-05_31_40-p.m.-_5_.webp",
    "mpfrytza-ChatGPT-Image-20-may-2026_-05_31_39-p.m.-_4_.webp"
  ]
};

const PORTRAIT_BACKGROUNDS = new Set([
  "mpfs4k56-ChatGPT-Image-21-may-2026_-11_34_19-a.m.-_2_.webp",
  "mpfs4k7s-ChatGPT-Image-21-may-2026_-11_34_20-a.m.-_3_.webp",
  "mpfs3onp-ChatGPT-Image-20-may-2026_-10_39_30-p.m.-_1_.webp",
  "mpfs4e4h-ChatGPT-Image-21-may-2026_-10_50_01-a.m.-_1_.webp",
  "mpfs3us5-ChatGPT-Image-20-may-2026_-10_13_42-p.m.-_2_.webp",
  "mpfrzcj6-ChatGPT-Image-21-may-2026_-11_16_41-a.m..webp",
  "mpfs4e7h-ChatGPT-Image-21-may-2026_-10_50_02-a.m.-_2_.webp",
  "mpfs4ebb-ChatGPT-Image-21-may-2026_-10_50_02-a.m.-_3_.webp",
  "mpfs4eh9-ChatGPT-Image-21-may-2026_-10_50_02-a.m.-_4_.webp",
  "mpfrznvw-ChatGPT-Image-20-may-2026_-09_42_54-p.m..webp"
]);

function installFadingBackground(section, sources, variant) {
  if (!section || section.querySelector(".cinematic-video")) return;

  const wrap = document.createElement("div");
  wrap.className = "cinematic-video";
  wrap.setAttribute("aria-hidden", "true");

  const frames = sources.map((src, index) => {
    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";
    image.style.opacity = index === 0 ? "1" : "0";
    if (PORTRAIT_BACKGROUNDS.has(src)) {
      image.classList.add("portrait-bg");
    }

    if (variant === "hero") {
      image.style.left = "50%";
      image.style.top = "0";
      image.style.width = "120%";
      image.style.height = "120%";
      image.style.transform = "translateX(-50%)";
      image.style.objectFit = "cover";
      image.style.objectPosition = PORTRAIT_BACKGROUNDS.has(src) ? "82% top" : "center top";
    } else {
      image.style.inset = "0";
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "cover";
      image.style.objectPosition = "center";
    }

    wrap.append(image);
    return image;
  });

  section.prepend(wrap);

  if (frames.length < 2) return;

  const FADE_MS = 900;
  const HOLD_MS = 6200;
  let rafId = 0;
  let active = 0;
  let timer = 0;

  function fadePair(from, to, duration = FADE_MS) {
    cancelAnimationFrame(rafId);
    const fromStart = Number.parseFloat(from.style.opacity || "0") || 0;
    const toStart = Number.parseFloat(to.style.opacity || "0") || 0;
    const started = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - started) / duration);
      from.style.opacity = String(fromStart + (0 - fromStart) * progress);
      to.style.opacity = String(toStart + (1 - toStart) * progress);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        timer = window.setTimeout(nextFrame, HOLD_MS);
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function nextFrame() {
    const next = (active + 1) % frames.length;
    fadePair(frames[active], frames[next]);
    active = next;
  }

  timer = window.setTimeout(nextFrame, HOLD_MS);
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(timer);
  }, { once: true });
}

const pageName = window.location.pathname.split("/").pop() || "index.html";
const pageBackgrounds = CINEMATIC_BACKGROUNDS[pageName] || CINEMATIC_BACKGROUNDS.default;

document.querySelectorAll(".hero").forEach((section) => {
  installFadingBackground(section, pageBackgrounds, "hero");
});

document.querySelectorAll(".dark-band").forEach((section) => {
  installFadingBackground(section, CINEMATIC_BACKGROUNDS.band, "band");
});

const revealItems = document.querySelectorAll("h1, h2, .lead, .eyebrow, .actions, .card, .score-card, .dashboard, .form-card, .resource-panel, .hero-panel, .dark-card, .phase, .decision-card, .service-row, .process-list article, .diagnostic-question, .diagnostic-result");
revealItems.forEach((item, index) => {
  item.setAttribute("data-reveal", "");
  item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealItems.forEach((item) => revealObserver.observe(item));
