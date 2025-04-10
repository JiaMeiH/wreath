function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
}
console.log("是否是手機：", isMobile());

const petalColorSets = {
  "flower1-template": ["#0033CC", "#0099FF", "#C4E1FF", "#FFED97", "#ffff99", "#DCB5FF", "#ff0000", "#FFC1E0", "#ffcccc", "#aed581", "#CCFF99", "#f2f2f2", "#4d4d4d"],
  "flower2-template": ["#f2f2f2", "url(#goldGradient)", "url(#silverGradient)"],
  "flower3-template": ["url(#goldGradient)", "url(#silverGradient)"]
};

const centerColorSets = {
  "flower1-template": ["#0033CC", "#0099FF", "#C4E1FF", "#FFED97", "#ffff99", "#DCB5FF", "#ff0000", "#FFC1E0", "#ffcccc", "#aed581", "#CCFF99", "#f2f2f2", "#4d4d4d", "url(#goldGradient)", "url(#silverGradient)"],
  "flower2-template": ["#f2f2f2", "#ff0000", "#0099FF", "rgb(186, 93, 214)"],
  "flower3-template": ["url(#goldGradient)", "url(#silverGradient)"]
};

const flowerColors = {
  "flower1-template": { petalColor: "#DCB5FF", centerColor: "#f2f2f2" },
  "flower2-template": { petalColor: "#f2f2f2", centerColor: "#0099FF" },
  "flower3-template": { petalColor: "url(#goldGradient)", centerColor: "url(#goldGradient)" }
};

let selectedTemplateId = "flower1-template";

function updateTemplateTip() {
  const tip = document.getElementById("templateTip");
  tip.textContent = "👉 點選模板一次切換，再點一次即可新增花朵";
}

function renderColorSwatches(id, inputId, colors) {
  const container = document.getElementById(id);
  container.innerHTML = "";
  let current =
    document.getElementById(inputId).getAttribute("data-fill") ||
    document.getElementById(inputId).value;

  if (!current && colors.length > 0) {
    current = colors[0];
    setColor(inputId, current);
  }

  colors.forEach((color) => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    if (color === current) swatch.classList.add("selected-color");
    swatch.style.background = color.includes("silver")
      ? "linear-gradient(45deg,#ffffff,#dcdcdc,#a9a9a9)"
      : color.includes("gold")
      ? "linear-gradient(45deg,#fff8dc,#ffd700,#b8860b)"
      : color;
    swatch.onclick = () => setColor(inputId, color);
    container.appendChild(swatch);
  });
}

function setColor(inputId, color) {
  const input = document.getElementById(inputId);
  input.value = color;
  input.setAttribute("data-fill", color);
  flowerColors[selectedTemplateId][
    inputId === "petalColor" ? "petalColor" : "centerColor"
  ] = color;
  input.dispatchEvent(new Event("change"));
  renderColorSwatches(
    inputId === "petalColor" ? "petalSwatches" : "centerSwatches",
    inputId,
    inputId === "petalColor"
      ? petalColorSets[selectedTemplateId]
      : centerColorSets[selectedTemplateId]
  );
  updatePreviewColors();
}

function selectTemplate(id) {
  selectedTemplateId = id;

  ["flower1-template", "flower2-template", "flower3-template"].forEach(tid =>
    document.getElementById(tid).classList.remove("selected")
  );
  document.getElementById(id).classList.add("selected");

  setColor("petalColor", flowerColors[id].petalColor);
  if (id !== "flower3-template") {
    setColor("centerColor", flowerColors[id].centerColor);
  }

  const centerSection = document.querySelector('.color-section:nth-of-type(2)');
  centerSection.style.display = id === "flower3-template" ? "none" : "inline-block";

  updatePreviewColors();
}

function updatePreviewColors() {
  Object.keys(flowerColors).forEach((id) => {
    const petalColor = flowerColors[id].petalColor;
    const centerColor = flowerColors[id].centerColor;
    document.querySelectorAll(`#${id} .petal`).forEach((p) => p.setAttribute("fill", petalColor));
    document.querySelectorAll(`#${id} .center`).forEach((c) => c.setAttribute("fill", centerColor));
  });
}

function addFlower() {
  const petalColor = flowerColors[selectedTemplateId].petalColor;
  const centerColor = flowerColors[selectedTemplateId].centerColor;
  const template = document.getElementById(selectedTemplateId);
  const clone = template.cloneNode(true);
  clone.removeAttribute("id");
  clone.classList.remove("selected");

  clone.querySelectorAll(".petal").forEach((p) => p.setAttribute("fill", petalColor));
  clone.querySelectorAll(".center").forEach((c) => c.setAttribute("fill", centerColor));

  const wrapper = document.createElement("div");
  wrapper.className = "flower-item";
  wrapper.style.width = template.getAttribute("width") / 2 + "px";

  const scaled = document.createElement("div");
  scaled.className = "scaled-flower";
  scaled.appendChild(clone);
  wrapper.appendChild(scaled);

  if (!isMobile()) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.innerHTML = "🗑";
    delBtn.onclick = () => wrapper.remove();
    wrapper.appendChild(delBtn);
  }

  document.getElementById("flowerList").appendChild(wrapper);
}

function clearFlowers() {
  document.getElementById("flowerList").innerHTML = "";
}

function saveFlowersAsImage() {
  const original = document.getElementById("flowerList");
  const clone = original.cloneNode(true);
  clone.querySelectorAll(".flower-item .delete-btn").forEach(btn => btn.remove());

  const defs = document.querySelector("svg defs");
  if (defs) {
    const defsClone = defs.cloneNode(true);
    clone.querySelectorAll("svg").forEach(svg => {
      const defsCopy = defsClone.cloneNode(true);
      svg.insertBefore(defsCopy, svg.firstChild);
    });
  }

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.background = "white";
  container.appendChild(clone);
  document.body.appendChild(container);

  html2canvas(clone, {
    backgroundColor: null,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "flowers.png";
    link.href = canvas.toDataURL();
    link.click();
    document.body.removeChild(container);
  });
}

function previewFlowers() {
  const original = document.getElementById("flowerList");
  const clone = original.cloneNode(true);
  clone.querySelectorAll(".flower-item .delete-btn").forEach(btn => btn.remove());

  const defs = document.querySelector("svg defs");
  if (defs) {
    const defsClone = defs.cloneNode(true);
    clone.querySelectorAll("svg").forEach(svg => {
      const defsCopy = defsClone.cloneNode(true);
      svg.insertBefore(defsCopy, svg.firstChild);
    });
  }

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.appendChild(clone);
  document.body.appendChild(container);

  html2canvas(clone, {
    backgroundColor: null,
    useCORS: true
  }).then(canvas => {
    const previewArea = document.getElementById("previewArea");
    previewArea.innerHTML = "";
    previewArea.appendChild(canvas);
    document.body.removeChild(container);
  });
}

function bindTemplateEvents() {
  ["flower1-template", "flower2-template", "flower3-template"].forEach(id => {
    const el = document.getElementById(id);
    el.onclick = () => {
      const isSelected = selectedTemplateId === id;
      selectTemplate(id);
      if (isSelected) {
        addFlower();
      }
    };
  });
}

window.onload = () => {
  document.getElementById(selectedTemplateId).classList.add("selected");

  setColor("petalColor", flowerColors[selectedTemplateId].petalColor);
  if (selectedTemplateId !== "flower3-template") {
    setColor("centerColor", flowerColors[selectedTemplateId].centerColor);
  }

  updatePreviewColors();
  updateTemplateTip();
  bindTemplateEvents();

  document.querySelector(".add-button").onclick = addFlower;
  document.querySelector(".clear-button").onclick = clearFlowers;
  document.querySelector(".save-button").onclick = saveFlowersAsImage;
  document.querySelector(".preview-button").onclick = previewFlowers;

  let dragY = null;
let pointerMoveHandler = null;

new Sortable(document.getElementById("flowerList"), {
  animation: 150,
  ghostClass: 'drag-ghost',

  onChoose: () => {
    if (!isMobile()) return;

    pointerMoveHandler = (e) => {
      dragY = e.touches ? e.touches[0].clientY : e.clientY;
    };
    window.addEventListener("pointermove", pointerMoveHandler, { passive: true });
  },

  onEnd: (evt) => {
    if (!isMobile()) return;

    window.removeEventListener("pointermove", pointerMoveHandler);
    pointerMoveHandler = null;

    const wrapper = document.querySelector(".flower-list-wrapper");
    const wrapperRect = wrapper.getBoundingClientRect();
    const buffer = 20;

    console.log("🎯 拖曳結束 Y =", dragY, "wrapper top=", wrapperRect.top, "bottom=", wrapperRect.bottom);

    if (dragY !== null && (
      dragY < wrapperRect.top - buffer ||
      dragY > wrapperRect.bottom + buffer
    )) {
      console.log("🗑 拖曳超出上下範圍，刪除花朵");
      evt.item.remove();
    } else {
      console.log("✅ 拖曳未超出範圍，保留花朵");
    }

    dragY = null;
  }
});

  

  document.body.addEventListener("click", () => {
    document.querySelectorAll(".flower-item").forEach(f => f.classList.remove("show-delete"));
  });
};
