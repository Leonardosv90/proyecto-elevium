"use strict";

document.querySelectorAll(".mobile-nav").forEach((menu) => {
  const toggle = menu.querySelector("summary");

  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      toggle.focus();
    }
  });

  menu.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.open = false;
    });
  });
});

const comparison = document.querySelector("[data-compare]");

if (comparison) {
  const descriptions = {
    before: ["Toma base con luz suave y color natural.", "La luz uniforme registra el producto y el ambiente con tonos neutros."],
    after: ["Luz y color para destacar el producto.", "La edición usa tonos cálidos y mayor contraste para dirigir la mirada al vaso."]
  };
  const title = comparison.querySelector("[data-compare-title]");
  const description = comparison.querySelector("[data-compare-description]");
  const buttons = comparison.querySelectorAll("[data-stage]");
  const beforePhoto = comparison.querySelector("[data-before]");
  const afterPhoto = comparison.querySelector("[data-after]");

  buttons.forEach((button) => button.addEventListener("click", () => {
    if (button.getAttribute("aria-pressed") === "true") return;

    const stage = button.dataset.stage;
    const [heading, detail] = descriptions[stage];
    beforePhoto.hidden = stage !== "before";
    afterPhoto.hidden = stage !== "after";
    buttons.forEach((control) => {
      control.setAttribute("aria-pressed", String(control.dataset.stage === stage));
    });
    title.textContent = heading;
    description.textContent = detail;
  }));

  comparison.querySelector("[data-compare-controls]").hidden = false;
}

const quote = document.querySelector("[data-quote]");

if (quote) {
  const items = quote.querySelector("[data-items]");
  const firstSelect = items.querySelector("select");
  const initialRow = items.querySelector(".quote-item").cloneNode(true);
  const productNames = new Map(
    Array.from(firstSelect.options)
      .filter((option) => option.value)
      .map((option) => [option.value, option.text])
  );
  const add = quote.querySelector("[data-add]");
  const date = quote.elements.fecha;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  date.min = `${year}-${month}-${day}`;

  const selected = new URLSearchParams(window.location.search).get("producto");
  if (productNames.has(selected)) firstSelect.value = selected;

  function refreshProducts() {
    const selects = Array.from(items.querySelectorAll("select"));
    const selectedProducts = new Set(selects.map((select) => select.value));
    selects.forEach((select) => {
      Array.from(select.options).forEach((option) => {
        option.disabled = option.value !== select.value && selectedProducts.has(option.value) && option.value !== "";
      });
    });
    add.hidden = selects.length >= productNames.size;
  }

  items.addEventListener("change", refreshProducts);
  items.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove]");
    if (!remove) return;
    remove.closest(".quote-item").remove();
    refreshProducts();
    add.focus();
  });

  add.addEventListener("click", () => {
    if (items.children.length >= productNames.size) return;
    const row = initialRow.cloneNode(true);
    const select = row.querySelector("select");
    row.querySelector("[data-remove]").hidden = false;
    items.append(row);
    refreshProducts();
    select.focus();
  });

  quote.addEventListener("submit", (event) => {
    event.preventDefault();

    const [deliveryYear, deliveryMonth, deliveryDay] = date.value.split("-").map(Number);
    const deliveryDate = new Date(deliveryYear, deliveryMonth - 1, deliveryDay);
    const formattedDate = new Intl.DateTimeFormat("es-SV", { dateStyle: "long" }).format(deliveryDate);
    const lines = Array.from(items.querySelectorAll(".quote-item"), (row) => {
      const product = productNames.get(row.querySelector("select").value);
      const quantity = row.querySelector("input").valueAsNumber;
      return `• ${product}: ${quantity} unidades`;
    });
    const message = [
      "Hola, Elevium. Quisiera cotizar estos promocionales para mi empresa:",
      ...lines,
      `Fecha requerida: ${formattedDate}.`,
      "Puedo compartir el logo o el diseño de referencia."
    ].join("\n");
    const url = new URL("https://wa.me/50377582172");
    url.searchParams.set("text", message);
    window.location.assign(url);
  });

  refreshProducts();
  quote.hidden = false;
}
