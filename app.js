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
