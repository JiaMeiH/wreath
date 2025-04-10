const petalColorSets = {
  "flower1-template": [
    " #0033CC"," #0099FF", " #C4E1FF", "	#FFED97"," #ffff99", " #DCB5FF", " #ff0000", " #FFC1E0"," #ffcccc"," #aed581", " #CCFF99"," #f2f2f2"," #4d4d4d"
  ],
  "flower2-template": [
    " #f2f2f2", "url(#goldGradient)", "url(#silverGradient)"
  ],
  "flower3-template": [
    "url(#goldGradient)", "url(#silverGradient)"
  ]
};

const centerColorSets = {
  "flower1-template": [
    " #0033CC"," #0099FF", " #C4E1FF", "	#FFED97"," #ffff99", " #DCB5FF", " #ff0000", " #FFC1E0"," #ffcccc"," #aed581", " #CCFF99"," #f2f2f2"," #4d4d4d", "url(#goldGradient)", "url(#silverGradient)"
  ],
  "flower2-template": [
    " #f2f2f2"," #ff0000"," #0099FF", "rgb(186, 93, 214)"
  ],
  "flower3-template": [
    "url(#goldGradient)", "url(#silverGradient)"
  ]
};

const flowerColors = {
  "flower1-template": {
    petalColor: " #DCB5FF",
    centerColor: " #f2f2f2"
  },
  "flower2-template": {
    petalColor: " #f2f2f2",
    centerColor: " #0099FF"
  },
  "flower3-template": {
    petalColor: "url(#goldGradient)",
    centerColor: "url(#goldGradient)"
  }
};

let selectedTemplateId = "flower1-template";

function renderColorSwatches(id, inputId, colors) {
  const container = document.getElementById(id);
  container.innerHTML = "";
  let current =
    document.getElementById(inputId).getAttribute("data-fill") ||
    document.getElementById(inputId).value;

  // 若目前顏色未設（空字串），就預設選第一個
  if (!current && colors.length > 0) {
    current = colors[0];
    setColor(inputId, current); // 設定並更新狀態
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

  // 移除舊的選取樣式
  ["flower1-template", "flower2-template", "flower3-template"].forEach(tid =>
    document.getElementById(tid).classList.remove("selected")
  );
  document.getElementById(id).classList.add("selected");

  // 設定顏色為 flowerColors 的預設值
  const petal = flowerColors[id].petalColor;
  const center = flowerColors[id].centerColor;

  setColor("petalColor", petal);
  if (id !== "flower3-template") {
    setColor("centerColor", center);
  }

  // 顯示/隱藏花蕊選項
  const centerSection = document.querySelector('.color-section:nth-of-type(2)');
  if (id === "flower3-template") {
    centerSection.style.display = "none";
  } else {
    centerSection.style.display = "inline-block";
  }

  updatePreviewColors();
}



function updatePreviewColors() {
  Object.keys(flowerColors).forEach((id) => {
    const petalColor = flowerColors[id].petalColor;
    const centerColor = flowerColors[id].centerColor;
    document
      .querySelectorAll(`#${id} .petal`)
      .forEach((p) => p.setAttribute("fill", petalColor));
    document
      .querySelectorAll(`#${id} .center`)
      .forEach((c) => c.setAttribute("fill", centerColor));
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

  const delBtn = document.createElement("button");
  delBtn.className = "delete-btn";
  delBtn.innerHTML = "🗑";
  delBtn.onclick = () => wrapper.remove();
  wrapper.appendChild(delBtn);

  document.getElementById("flowerList").appendChild(wrapper);
}

function clearFlowers() {
  document.getElementById("flowerList").innerHTML = "";
}

function saveFlowersAsImage() {
  const original = document.getElementById("flowerList");
  const clone = original.cloneNode(true);

  // 移除按鈕但保留原樣（保留縮放比例，確保顯示一致）
  clone.querySelectorAll(".flower-item").forEach(item => {
    const btn = item.querySelector(".delete-btn");
    if (btn) btn.remove();
  });

  // 將 defs 複製進 clone 的每一個 svg 裡
  const defs = document.querySelector("svg defs");
  if (defs) {
    const defsClone = defs.cloneNode(true);
    clone.querySelectorAll("svg").forEach(svg => {
      const defsCopy = defsClone.cloneNode(true);
      svg.insertBefore(defsCopy, svg.firstChild);
    });
  }

  // 建立隱藏容器來渲染圖片
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.background = "white"; // 或 transparent
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

  // 移除刪除按鈕
  clone.querySelectorAll(".flower-item").forEach(item => {
    const btn = item.querySelector(".delete-btn");
    if (btn) btn.remove();
  });

  // 加上 defs 給每個 svg
  const defs = document.querySelector("svg defs");
  if (defs) {
    const defsClone = defs.cloneNode(true);
    clone.querySelectorAll("svg").forEach(svg => {
      const defsCopy = defsClone.cloneNode(true);
      svg.insertBefore(defsCopy, svg.firstChild);
    });
  }

  // 建立離畫面外的容器
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
    previewArea.innerHTML = ""; // 清空先前預覽
    previewArea.appendChild(canvas);
    document.body.removeChild(container);
  });
}



window.onload = () => {
  document.getElementById(selectedTemplateId).classList.add("selected");

  const petal = flowerColors[selectedTemplateId].petalColor;
  const center = flowerColors[selectedTemplateId].centerColor;

  setColor("petalColor", petal);
  if (selectedTemplateId !== "flower3-template") {
    setColor("centerColor", center);
  }

  updatePreviewColors();

  // 👉 啟用拖曳排序
  new Sortable(document.getElementById("flowerList"), {
    animation: 150,
    ghostClass: 'drag-ghost'
  });
};

