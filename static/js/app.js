let mic, fft;
let pg; // 2D描画用のグラフィックスバッファ
let size = 0.5;
let px = 0, py = 0;
let ripples = []; // 波紋を管理する配列

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pg = createGraphics(windowWidth, windowHeight); // 2D描画用のグラフィックスバッファ

  if (navigator.xr) {
    navigator.xr.requestSession('immersive-ar').then((session) => {
      console.log('AR session started');
      // Set up AR rendering here (attach session to canvas, add 3D effects, etc.)
    }).catch((err) => {
      console.error('Failed to start AR session', err);
    });
  } else {
    console.log('WebXR not supported');
  }

  // マイクを音源にする
  mic = new p5.AudioIn();
  mic.start(); // マイク入力を開始

  fft = new p5.FFT();
  fft.setInput(mic);

  userStartAudio();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 画面リサイズ時にキャンバスサイズを再調整
  pg = createGraphics(windowWidth, windowHeight); // グラフィックスバッファも再調整
}

function draw() {
  background(0);

  if (mic.enabled) {

    // マイクが有効になっていれば、3Dエフェクトと2Dエフェクトを描画
    draw3D();
    pg.clear();
    draw2D(pg);

    // 2D描画を3Dキャンバスに描画
    texture(pg);
    plane(width, height);
  }
}


function draw3D() {
  let spectrum = fft.analyze(); // マイクの音声をスペクトラム解析
  for (let y = -250; y <= 250; y += 500) {
    for (let x = -250; x <= 250; x += 500) {
      push();
      translate(x, y, 0);
      noFill();
      let volume = spectrum[50];
      let boxHeight = map(volume, 0, 255, 0, 200);
      let boxSize = map(volume, 0, 255, 50, 200);
      let colorValue = map(volume, 0, 255, 50, 255);
      stroke(colorValue, 147, 206, 200);
      rotateX(frameCount * 0.01);
      rotateY(frameCount * 0.01);
      box(boxSize, boxSize, boxHeight);
      pop();
    }
  }
}

function draw2D(pg) {
  pg.noFill();
  pg.stroke(255);
  let spectrum = fft.analyze(); // スペクトラムデータ

  // 波紋の描画
  drawRipples(pg, spectrum);

  // バブルの描画
  Bubble(pg, spectrum);
}

function drawRipples(pg, spectrum) {
  let volume = fft.getEnergy(20, 200); // 低周波数帯の音量を取得

  if (volume > 150 && random(1) > 0.7) { 
    ripples.push({ 
      x: random(width), 
      y: random(height), 
      size: 0, 
      alpha: 255, 
      hue: random(360) 
    });
  }

  pg.colorMode(HSL); 

  for (let i = ripples.length - 1; i >= 0; i--) {
    let ripple = ripples[i];
    pg.stroke(ripple.hue, 100, 50, ripple.alpha);
    pg.ellipse(ripple.x, ripple.y, ripple.size);
    ripple.size += 6;
    ripple.alpha -= 7;

    if (ripple.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
}

function Bubble(pg, spectrum) {
  pg.push();
  pg.translate(width * 0.5, height * 0.5);
  for (let i = 125; i < spectrum.length / 4; i++) {
    let x = spectrum[i] * size * 1.3;
    let y = spectrum[i] * size * 1.3;
    pg.rotate(i * 0.01);

    let hue = map(i, 0, spectrum.length / 4, 0, 360);  
    let brightness = map(spectrum[i], 0, 255, 50, 100); 
    pg.colorMode(HSL); 
    pg.fill(hue, 100, brightness);
    
    variableEllipse(pg, x, y, px, py);
    px = x;
    py = y;
  }
  pg.pop();
}

function variableEllipse(pg, x, y, px, py) {
  let speed = abs(x - px) + abs(y - py);
  pg.ellipse(x, y, speed, speed);
}
