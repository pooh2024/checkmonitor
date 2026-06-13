// ===== カメラ起動 =====
async function startCamera() {
  const video = document.getElementById("camera");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;
}

// ===== 枠ドラッグ処理 =====
function makeDraggable(element) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  element.addEventListener("touchstart", (e) => {
    isDragging = true;
    const rect = element.getBoundingClientRect();
    offsetX = e.touches[0].clientX - rect.left;
    offsetY = e.touches[0].clientY - rect.top;
  });

  element.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const container = document.getElementById("camera-container");
    const rect = container.getBoundingClientRect();

    let x = e.touches[0].clientX - rect.left - offsetX;
    let y = e.touches[0].clientY - rect.top - offsetY;

    x = Math.max(0, Math.min(x, rect.width - element.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - element.offsetHeight));

    element.style.left = x + "px";
    element.style.top = y + "px";
  });

  element.addEventListener("touchend", () => {
    isDragging = false;
  });
}

makeDraggable(document.getElementById("box1"));
makeDraggable(document.getElementById("box2"));

// ===== OCR処理（枠1内だけ） =====
const worker = Tesseract.createWorker();

async function startOCR() {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const video = document.getElementById("camera");
  const capture = document.createElement("canvas");
  const ctx = capture.getContext("2d");

  let previousValue = null;

  setInterval(async () => {
    if (video.videoWidth === 0) return;

    capture.width = video.videoWidth;
    capture.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const box1 = document.getElementById("box1");
    const rect = box1.getBoundingClientRect();
    const container = document.getElementById("camera-container").getBoundingClientRect();

    const x = rect.left - container.left;
    const y = rect.top - container.top;
    const w = box1.offsetWidth;
    const h = box1.offsetHeight;

    const imageData = ctx.getImageData(x, y, w, h);

    const { data } = await worker.recognize(imageData);
    const text = data.text;

    const match = text.match(/\d+/);
    if (!match) return;

    const value = Number(match[0]);

    document.getElementById("current").textContent = value;

    if (previousValue !== null) {
      document.getElementById("previous").textContent = previousValue;
      document.getElementById("diff").textContent = value - previousValue;
    }

    previousValue = value;
  }, 1000);
}

// ===== ボタンから開始（iPhone対策） =====
document.getElementById("startBtn").addEventListener("click", () => {
  startCamera();
  startOCR();
});

function makeResizable(element) {
  const handle = element.querySelector(".resize-handle");

  let isResizing = false;

  handle.addEventListener("touchstart", () => {
    isResizing = true;
  });

  handle.addEventListener("touchmove", (e) => {
    if (!isResizing) return;

    const rect = element.getBoundingClientRect();
    const container = document.getElementById("camera-container").getBoundingClientRect();

    const newWidth = e.touches[0].clientX - rect.left;
    const newHeight = e.touches[0].clientY - rect.top;

    element.style.width = newWidth + "px";
    element.style.height = newHeight + "px";
  });

  handle.addEventListener("touchend", () => {
    isResizing = false;
  });
}

makeResizable(document.getElementById("box1"));
makeResizable(document.getElementById("box2"));
