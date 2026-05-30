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

const methodDetails = [
  {
    letter: "E",
    title: "Explorar",
    eyebrow: "Fase 01",
    summary: "Entendemos la marca, la oferta, el publico y las prioridades antes de proponer contenido o acciones.",
    detail: "Esta fase evita empezar por piezas sueltas. Primero aclaramos que vendes, a quien quieres atraer, que te diferencia, que percepcion tienes hoy y que objetivo comercial debe sostener la comunicacion.",
    includes: [
      "Lectura de marca, oferta y propuesta de valor.",
      "Identificacion del publico ideal y sus dolores reales.",
      "Revision de objetivos, prioridades y oportunidades inmediatas."
    ],
    output: "Un mapa inicial de direccion para saber que debe comunicar la marca y que debe evitar.",
    signals: [
      "Cuando no tienes claro que decir o a quien hablarle.",
      "Cuando tu oferta existe, pero no se entiende rapido.",
      "Cuando quieres crecer sin copiar lo que hacen otros."
    ],
    questions: [
      "Que problema concreto resuelve tu marca?",
      "Que tipo de cliente quieres atraer?",
      "Que debe pensar una persona despues de ver tu contenido?"
    ],
    nextStep: "Con esta base pasamos a Leer: revisar como se ve tu presencia actual frente al mercado."
  },
  {
    letter: "L",
    title: "Leer",
    eyebrow: "Fase 02",
    summary: "Diagnosticamos presencia digital, competencia, mensajes, canales y puntos de mejora.",
    detail: "Aqui observamos lo que la marca ya muestra al mercado: perfiles, contenido, coherencia visual, confianza, llamados a la accion y oportunidades frente a competidores o referentes.",
    includes: [
      "Auditoria de presencia digital y contenido.",
      "Lectura de competidores, referentes y oportunidades.",
      "Identificacion de brechas de claridad, autoridad y conversion."
    ],
    output: "Un diagnostico claro de lo que funciona, lo que confunde y lo que conviene corregir primero.",
    signals: [
      "Cuando publicas, pero no sabes si estas avanzando.",
      "Cuando tu imagen se ve activa, pero no necesariamente posicionada.",
      "Cuando necesitas saber que esta frenando confianza o conversion."
    ],
    questions: [
      "Que percibe alguien nuevo al entrar a tus perfiles?",
      "Tu contenido demuestra experiencia o solo actividad?",
      "Que oportunidades estan aprovechando otros y tu marca todavia no?"
    ],
    nextStep: "Con el diagnostico claro, estructuramos la comunicacion para dejar de improvisar."
  },
  {
    letter: "E",
    title: "Estructurar",
    eyebrow: "Fase 03",
    summary: "Convertimos la informacion en pilares, narrativa, tono, mensajes y sistema de publicacion.",
    detail: "Esta fase ordena las ideas para que la marca no dependa de ocurrencias. Se define que temas sostienen la autoridad, como se habla, que argumentos se repiten y como se conecta el contenido con objetivos.",
    includes: [
      "Pilares de contenido y mensajes principales.",
      "Tono, narrativa y enfoque visual.",
      "Sistema editorial conectado a objetivos comerciales."
    ],
    output: "Una estructura de comunicacion que permite producir con coherencia y menos improvisacion.",
    signals: [
      "Cuando cada publicacion parece una idea aislada.",
      "Cuando no hay temas base para sostener la autoridad.",
      "Cuando tu equipo o proveedor necesita una guia clara para producir."
    ],
    questions: [
      "Que pilares deben repetirse para posicionar la marca?",
      "Que tono transmite confianza sin sonar generico?",
      "Que mensajes deben aparecer una y otra vez en distintos formatos?"
    ],
    nextStep: "Con la estructura lista, pasamos a convertirla en contenido, diseno y recursos visibles."
  },
  {
    letter: "V",
    title: "Visibilizar",
    eyebrow: "Fase 04",
    summary: "Creamos contenido, diseno y recursos que muestran el valor de la marca con claridad.",
    detail: "La visibilidad no es solo aparecer. Es aparecer con una presencia que se entienda, se recuerde y genere confianza. Aqui se producen piezas, recursos y activos digitales alineados al sistema.",
    includes: [
      "Contenido educativo, comercial y de autoridad.",
      "Diseno visual coherente con la marca.",
      "Recursos para captar interes y abrir conversaciones."
    ],
    output: "Activos digitales listos para comunicar valor y sostener presencia profesional.",
    signals: [
      "Cuando ya hay estrategia, pero falta material para mostrarla.",
      "Cuando necesitas contenido que eduque, atraiga y genere confianza.",
      "Cuando quieres que tu presencia se vea mas profesional y consistente."
    ],
    questions: [
      "Que piezas ayudan al cliente a entender tu valor?",
      "Que formatos conectan mejor con tu audiencia?",
      "Que recurso puede iniciar una conversacion comercial?"
    ],
    nextStep: "Cuando la presencia ya tiene forma, buscamos acelerar produccion, seguimiento y procesos."
  },
  {
    letter: "A",
    title: "Acelerar",
    eyebrow: "Fase 05",
    summary: "Usamos IA, automatizacion y procesos para producir mejor, responder mas rapido y escalar.",
    detail: "Cuando la base esta ordenada, la IA puede acelerar sin volver caotica la comunicacion. Se crean flujos, plantillas, asistentes o procesos que ahorran tiempo y mantienen criterio.",
    includes: [
      "Flujos de respuesta y seguimiento.",
      "Plantillas, prompts y sistemas asistidos por IA.",
      "Automatizaciones para captacion, contenido o atencion."
    ],
    output: "Un sistema mas eficiente que permite crecer sin depender de trabajo manual para todo.",
    signals: [
      "Cuando ya hay demanda, pero el seguimiento se vuelve lento.",
      "Cuando el contenido consume demasiado tiempo operativo.",
      "Cuando quieres usar IA sin perder voz, criterio ni estrategia."
    ],
    questions: [
      "Que tareas se repiten cada semana?",
      "Que respuestas o procesos podrian automatizarse?",
      "Donde la IA puede ayudar sin reemplazar el criterio humano?"
    ],
    nextStep: "Despues de acelerar, medimos para ajustar lo que realmente genera claridad, confianza y oportunidades."
  },
  {
    letter: "R",
    title: "Refinar",
    eyebrow: "Fase 06",
    summary: "Medimos, aprendemos y optimizamos para mejorar claridad, conversion y resultados.",
    detail: "La estrategia no termina al publicar. Se revisan datos, preguntas frecuentes, respuestas del mercado y oportunidades de mejora para ajustar contenido, procesos y ofertas.",
    includes: [
      "Revision de metricas y comportamiento.",
      "Ajustes de mensajes, piezas y embudos.",
      "Mejora continua de contenido, captacion y posicionamiento."
    ],
    output: "Un ciclo de aprendizaje para que la marca no solo publique, sino mejore con direccion.",
    signals: [
      "Cuando ya tienes contenido, pero necesitas saber que mejorar.",
      "Cuando hay leads o interacciones, pero falta lectura comercial.",
      "Cuando quieres convertir la presencia digital en un sistema que aprende."
    ],
    questions: [
      "Que contenido genera mas confianza o conversaciones?",
      "Donde se pierde la atencion del prospecto?",
      "Que ajustes pueden mejorar conversion sin cambiar toda la estrategia?"
    ],
    nextStep: "El metodo vuelve a iniciar con nuevos aprendizajes: explorar mejor, leer mejor y ajustar con mas precision."
  }
];

const serviceDetails = [
  {
    title: "Marca personal y autoridad digital",
    category: "Autoridad",
    image: "mpfs3onp-ChatGPT-Image-20-may-2026_-10_39_30-p.m.-_1_.webp",
    intro: "Para profesionales que venden confianza, experiencia y criterio, pero necesitan comunicarlo con mas claridad.",
    sections: [
      ["Para quien es", "Consultores, especialistas, coaches, medicos, abogados, asesores, formadores y lideres que necesitan posicionarse como referentes."],
      ["Problema que resuelve", "Evita que tu experiencia se perciba dispersa, poco diferenciada o dificil de entender. Ordena tu voz, tu valor y tu forma de presentarte."],
      ["Que trabajamos", "Mensaje central, propuesta de valor, pilares de contenido, narrativa personal, imagen profesional y ruta de autoridad."],
      ["Resultado esperado", "Una marca personal mas clara, confiable y preparada para atraer oportunidades, clientes, alianzas o invitaciones."]
    ],
    process: ["Diagnostico de percepcion", "Definicion de posicionamiento", "Pilares y narrativa", "Sistema visual y contenido base"],
    deliverables: ["Mapa de marca personal", "Pilares de contenido", "Bio y mensajes clave", "Guia inicial de autoridad"],
    bullets: ["Diagnostico de autoridad", "Pilares de contenido", "Narrativa profesional", "Sistema visual inicial"]
  },
  {
    title: "Estrategia y gestion de contenido",
    category: "Contenido",
    image: "mpfs46n7-ChatGPT-Image-20-may-2026_-10_28_19-p.m.-_1_.webp",
    intro: "Para marcas que ya publican o quieren publicar, pero necesitan un sistema que conecte contenido con objetivos.",
    sections: [
      ["Para quien es", "Negocios que sienten que publican al azar, dependen de ideas de ultimo momento o no logran sostener constancia."],
      ["Problema que resuelve", "Reduce la improvisacion y convierte el contenido en una herramienta de educacion, confianza, posicionamiento y captacion."],
      ["Que trabajamos", "Calendario editorial, temas estrategicos, copywriting, formatos, publicaciones, reportes y ajustes."],
      ["Resultado esperado", "Contenido mas coherente, facil de sostener y alineado a confianza, educacion y conversion."]
    ],
    process: ["Lectura de objetivos", "Definicion de pilares", "Calendario y guiones", "Publicacion, medicion y ajustes"],
    deliverables: ["Calendario editorial", "Copys y guiones", "Piezas de contenido", "Reporte de aprendizaje"],
    bullets: ["Calendario editorial", "Copy y guiones", "Piezas para redes", "Revision y optimizacion"]
  },
  {
    title: "Branding y diseño digital",
    category: "Imagen",
    image: "mpfs46pk-ChatGPT-Image-20-may-2026_-10_28_19-p.m.-_2_.webp",
    intro: "Para elevar la percepcion visual de la marca y hacer que cada punto de contacto se sienta mas profesional.",
    sections: [
      ["Para quien es", "Marcas que tienen una buena oferta, pero su imagen no transmite el mismo nivel de calidad o confianza."],
      ["Problema que resuelve", "Evita que la comunicacion se vea improvisada, inconsistente o poco memorable aunque el servicio sea bueno."],
      ["Que trabajamos", "Linea grafica, plantillas, piezas comerciales, recursos visuales, presentaciones y coherencia de marca."],
      ["Resultado esperado", "Una presencia visual mas ordenada, elegante y facil de reconocer."]
    ],
    process: ["Revision de identidad actual", "Direccion visual", "Diseno de sistema grafico", "Aplicacion en piezas clave"],
    deliverables: ["Linea visual", "Plantillas", "Piezas comerciales", "Guia de uso inicial"],
    bullets: ["Linea grafica", "Plantillas digitales", "Material comercial", "Sistema visual"]
  },
  {
    title: "Producción audiovisual",
    category: "Producción",
    image: "mpfrznvw-ChatGPT-Image-20-may-2026_-09_42_54-p.m..webp",
    intro: "Para mostrar el lado humano, experto y profesional de la marca con fotos, videos y piezas de contenido.",
    sections: [
      ["Para quien es", "Profesionales y negocios que necesitan verse confiables, actuales y cercanos sin perder formalidad."],
      ["Problema que resuelve", "Ayuda a dejar de depender solo de artes genericos y mostrar personas, procesos, ambientes, prueba y experiencia real."],
      ["Que trabajamos", "Fotografia, reels, videos educativos, piezas de autoridad, contenido para campanas y material institucional."],
      ["Resultado esperado", "Una biblioteca visual que permite comunicar mejor y producir contenido con mas fuerza."]
    ],
    process: ["Plan de produccion", "Guiones o shotlist", "Sesion de foto/video", "Edicion y entrega por formatos"],
    deliverables: ["Fotografias editadas", "Videos o reels", "Piezas educativas", "Material para campanas"],
    bullets: ["Fotografia profesional", "Reels", "Videos educativos", "Contenido para campanas"]
  },
  {
    title: "Web y captación digital",
    category: "Captación",
    image: "mpg0bp42-ChatGPT-Image-21-may-2026_-03_32_21-p.m..webp",
    intro: "Para convertir visitas e interes en conversaciones, solicitudes, descargas o leads reales.",
    sections: [
      ["Para quien es", "Marcas que ya generan atencion, pero no tienen una ruta clara para captar prospectos o medir oportunidades."],
      ["Problema que resuelve", "Crea un camino practico para que el visitante no solo vea la marca, sino que avance hacia diagnostico, contacto o recurso."],
      ["Que trabajamos", "Landing pages, formularios, lead magnets, paginas de servicio, diagnosticos, medicion y rutas a WhatsApp."],
      ["Resultado esperado", "Un sistema de captacion mas claro que no dependa solo de mensajes sueltos en redes."]
    ],
    process: ["Mapa del embudo", "Oferta o recurso de entrada", "Pagina y formulario", "Medicion y seguimiento"],
    deliverables: ["Landing o pagina de captacion", "Formulario conectado", "Lead magnet", "Eventos basicos de conversion"],
    bullets: ["Landing pages", "Formularios", "Lead magnets", "Medicion de conversion"]
  },
  {
    title: "IA y automatización",
    category: "IA",
    image: "mpfs475y-ChatGPT-Image-20-may-2026_-10_28_21-p.m.-_6_.webp",
    intro: "Para ahorrar tiempo, ordenar procesos y usar inteligencia artificial con criterio comercial.",
    sections: [
      ["Para quien es", "Negocios que quieren responder mejor, crear mas rapido, organizar tareas o automatizar procesos repetitivos."],
      ["Problema que resuelve", "Evita usar IA de forma aislada o improvisada. La integra a tareas concretas donde puede ahorrar tiempo y mejorar seguimiento."],
      ["Que trabajamos", "Chatbots, asistentes IA, flujos de respuesta, prompts, automatizaciones y procesos internos."],
      ["Resultado esperado", "Mas eficiencia sin perder control, criterio ni calidad en la comunicacion."]
    ],
    process: ["Identificacion de procesos", "Diseno del flujo", "Base de conocimiento o prompts", "Prueba, ajustes e implementacion"],
    deliverables: ["Mapa de automatizacion", "Prompts o asistente inicial", "Flujos de respuesta", "Guia de uso para el equipo"],
    bullets: ["Chatbots", "Asistentes IA", "Flujos de respuesta", "Automatizaciones"]
  }
];

let activeModalItems = [];
let activeModalIndex = 0;

function getOrCreateDetailModal() {
  let modal = document.querySelector("[data-detail-modal]");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "detail-modal";
  modal.setAttribute("data-detail-modal", "");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="detail-modal__overlay" data-modal-close></div>
    <section class="detail-modal__panel" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <button class="detail-modal__close" type="button" data-modal-close aria-label="Cerrar">×</button>
      <div class="detail-modal__media" data-modal-media></div>
      <div class="detail-modal__content">
        <span class="eyebrow" data-modal-eyebrow></span>
        <h2 id="detail-modal-title" data-modal-title></h2>
        <p class="lead" data-modal-summary></p>
        <div class="detail-modal__body" data-modal-body></div>
        <div class="detail-modal__nav">
          <button class="btn btn-ghost" type="button" data-modal-prev>Anterior</button>
          <a class="btn btn-primary" href="diagnostico.html">Solicitar diagnóstico</a>
          <button class="btn btn-ghost" type="button" data-modal-next>Siguiente</button>
        </div>
      </div>
    </section>
  `;
  document.body.append(modal);

  modal.querySelectorAll("[data-modal-close]").forEach((item) => {
    item.addEventListener("click", closeDetailModal);
  });
  modal.querySelector("[data-modal-prev]").addEventListener("click", () => openDetailModal(activeModalItems, activeModalIndex - 1));
  modal.querySelector("[data-modal-next]").addEventListener("click", () => openDetailModal(activeModalItems, activeModalIndex + 1));

  window.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("detail-modal-open")) return;
    if (event.key === "Escape") closeDetailModal();
    if (event.key === "ArrowLeft" && activeModalIndex > 0) openDetailModal(activeModalItems, activeModalIndex - 1);
    if (event.key === "ArrowRight" && activeModalIndex < activeModalItems.length - 1) openDetailModal(activeModalItems, activeModalIndex + 1);
  });

  return modal;
}

function renderMethodBody(item) {
  return `
    <p>${item.detail}</p>
    <div class="detail-modal__columns">
      <div>
        <h3>Qué hacemos</h3>
        <ul>${item.includes.map((point) => `<li>${point}</li>`).join("")}</ul>
      </div>
      <div>
        <h3>Entregable</h3>
        <p>${item.output}</p>
      </div>
    </div>
    <div class="detail-modal__sections detail-modal__sections--compact">
      <article>
        <h3>Cuándo aplica</h3>
        <ul>${item.signals.map((point) => `<li>${point}</li>`).join("")}</ul>
      </article>
      <article>
        <h3>Preguntas clave</h3>
        <ul>${item.questions.map((point) => `<li>${point}</li>`).join("")}</ul>
      </article>
    </div>
    <div class="detail-modal__note">
      <strong>Siguiente movimiento</strong>
      <p>${item.nextStep}</p>
    </div>
  `;
}

function renderServiceBody(item) {
  return `
    <div class="detail-modal__chips">${item.bullets.map((point) => `<span>${point}</span>`).join("")}</div>
    <div class="detail-modal__sections">
      ${item.sections.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}
    </div>
    <div class="detail-modal__columns">
      <div>
        <h3>Proceso de trabajo</h3>
        <ol>${item.process.map((point) => `<li>${point}</li>`).join("")}</ol>
      </div>
      <div>
        <h3>Entregables posibles</h3>
        <ul>${item.deliverables.map((point) => `<li>${point}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="detail-modal__note">
      <strong>Recomendación</strong>
      <p>Si no tienes claro si esta es tu ruta, el diagnostico ayuda a priorizar antes de invertir en una solucion completa.</p>
    </div>
  `;
}

function openDetailModal(items, index) {
  const modal = getOrCreateDetailModal();
  activeModalItems = items;
  activeModalIndex = Math.min(Math.max(index, 0), items.length - 1);
  const item = activeModalItems[activeModalIndex];
  const isService = Boolean(item.image);
  const media = modal.querySelector("[data-modal-media]");

  modal.querySelector("[data-modal-eyebrow]").textContent = item.eyebrow || item.category;
  modal.querySelector("[data-modal-title]").textContent = isService ? item.title : `${item.letter} · ${item.title}`;
  modal.querySelector("[data-modal-summary]").textContent = item.summary || item.intro;
  modal.querySelector("[data-modal-body]").innerHTML = isService ? renderServiceBody(item) : renderMethodBody(item);

  if (isService) {
    media.innerHTML = `<img src="${item.image}" alt="${item.title}">`;
    media.hidden = false;
  } else {
    media.innerHTML = `<strong>${item.letter}</strong><span>${item.title}</span>`;
    media.hidden = false;
  }

  modal.querySelector("[data-modal-prev]").hidden = activeModalIndex === 0;
  modal.querySelector("[data-modal-next]").hidden = activeModalIndex === activeModalItems.length - 1;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("detail-modal-open");
  modal.querySelector(".detail-modal__close").focus();
}

function closeDetailModal() {
  const modal = document.querySelector("[data-detail-modal]");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("detail-modal-open");
}

document.querySelectorAll(".method-rail .phase").forEach((phase, index) => {
  phase.setAttribute("role", "button");
  phase.setAttribute("tabindex", "0");
  phase.setAttribute("aria-label", `Ver fase ${methodDetails[index]?.title || index + 1}`);
  phase.addEventListener("click", () => openDetailModal(methodDetails, index));
  phase.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetailModal(methodDetails, index);
    }
  });
});

document.querySelectorAll(".service-matrix .service-row").forEach((row, index) => {
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  row.setAttribute("aria-label", `Ver detalle de ${serviceDetails[index]?.title || "servicio"}`);
  row.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    openDetailModal(serviceDetails, index);
  });
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetailModal(serviceDetails, index);
    }
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
