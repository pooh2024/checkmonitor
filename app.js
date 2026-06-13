// カメラ起動
async function startCamera() {
  const video = document.getElementById("camera");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;
}
startCamera();

// ドラッグ処理
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

    // 枠がはみ出さないように制限
    x = Math.max(0, Math.min(x, rect.width - element.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - element.offsetHeight));

    element.style.left = x + "px";
    element.style.top = y + "px";
  });

  element.addEventListener("touchend", () => {
    isDragging = false;
  });
}

// 枠1・枠2をドラッグ可能に
makeDraggable(document.getElementById("box1"));
makeDraggable(document.getElementById("box2"));

// ======== OCR処理 ========

// Tesseractワーカー準備
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

    // canvas を動画サイズに合わせる
    capture.width = video.videoWidth;
    capture.height = video.videoHeight;

    // 1フレーム描画
    ctx.drawImage(video, 0, 0);

    // 枠1の位置とサイズを取得
    const box1 = document.getElementById("box1");
    const rect = box1.getBoundingClientRect();
    const container = document.getElementById("camera-container").getBoundingClientRect();

    const x = rect.left - container.left;
    const y = rect.top - container.top;
    const w = box1.offsetWidth;
    const h = box1.offsetHeight;

    // 枠1の部分だけ切り出し
    const imageData = ctx.getImageData(x, y, w, h);

    // OCR実行
    const { data } = await worker.recognize(imageData);
    const text = data.text;

    // 数字だけ抽出
    const match = text.match(/\d+/);
    if (!match) return;

    const value = Number(match[0]);

    // 表示
    console.log("OCR:", value);

    // 差分
    if (previousValue !== null) {
      console.log("差分:", value - previousValue);
    }

    previousValue = value;

  }, 1000);
}

startOCR();
