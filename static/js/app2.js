let mic, fft;
let pg; // 2D描画用のグラフィックスバッファ
let size = 0.5;
let px, py, rectx, recty, shapex;
let swith = true;
let l = 400;


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pg = createGraphics(windowWidth, windowHeight); // P2Dで2D描画を有効化
  // マイクを音源にする
  mic = new p5.AudioIn();
  mic.start(); // マイク入力を開始
  fft = new p5.FFT();
  fft.setInput(mic);
}
function draw() {
  // 3D描画部分
  background(0);
  draw3D();
  // 2D描画部分
  pg.clear();
  draw2D(pg);
  // 2D描画を3Dキャンバスに描画
  texture(pg);
  plane(width, height);
}
function draw3D() {
  let spectrum = fft.analyze(); // マイクの音声をスペクトラム解析
  // 3Dボックスの描画
  for (let y = -250; y <= 250; y += 500) {
    for (let x = -250; x <= 250; x += 500) {
      push(); // 新しい座標系を保存
      translate(x, y, 0); // 各ボックスの位置を設定
      noFill();
      // 音声スペクトラムに基づいてボックスの色とサイズを調整
      let volume = spectrum[50]; // 音の強さを取得
      let boxHeight = map(volume, 0, 255, 0, 200); // スペクトラムに基づく高さ
      let boxSize = map(volume, 0, 255, 50, 200); // サイズを調整
      let colorValue = map(volume, 0, 255, 50, 255); // 色の透明度を調整
      // 色を設定
      stroke(colorValue, 147, 206, 200); // 色を設定（アルファ値で透明度を調整）
      // 回転を適用
      rotateX(frameCount * 0.01);
      rotateY(frameCount * 0.01);
      // ボックスを描画
      box(boxSize, boxSize, boxHeight); // サイズを変化させたボックスを描画
      pop(); // 座標系をリセット
    }
  }
}
function draw2D(pg) {
  pg.noFill();
  pg.stroke(255);
  let spectrum = fft.analyze(); // マイクの音声をスペクトラム解析
  // 回転するバブル描画
  Bubble(pg, spectrum);
  if (spectrum[50] > 90) {
    TheWave(pg, spectrum);
  } else if ((spectrum[50] > 40 && spectrum[50] < 60)) {
    Rects(pg);
  }
  if (frameCount % 120 == 0) {
    swith = !swith;
  }
}
function Diagoal(pg) {
  pg.push();
  pg.translate(width * 0.5, height * 0.5);
  pg.fill(255);
  if (frameCount % 24 == 0) {
    shapex = random(width * 0.1, width * 0.9);
  }
  if (shapex != undefined) {
    pg.rotate(shapex);
    for (var i = 1; i < 6; i++) {
      pg.rect(width * 0.05 * i, 0, 5, width * 0.1);
      pg.push();
      pg.rotate(radians(90));
      pg.rect(width * 0.05 * i, 0, 5, width * 0.1);
      pg.pop();
    }
  }
  pg.pop();
}
function Rects(pg) {
  pg.fill(255);
  if (frameCount % 14 == 0) {
    rectx = random(-height * 0.3, height * 0.3);
    recty = random(-height * 0.3, height * 0.3);
  }
  pg.push();
  pg.translate(width * 0.5, height * 0.5);
  if (rectx != undefined) {
    pg.rect(rectx, recty, width * 0.02, height * 0.1);
    pg.rect(0.2 * width * cos(rectx), 0.2 * width * sin(rectx), width * 0.1 + width * 0.3 * sin(recty), width * 0.1);
  }
  pg.pop();
}
function TheWave(pg, spectrum) {
  pg.noFill();
  pg.push();
  pg.translate(width * 0.5, height * 0.5);
  pg.rotate(frameCount * 0.001);
  let z = (frameCount % 500) / 500;
  for (let i = 0; i < 6; i++) {
    let n = floor(random(1, 3)) * random([-1, 1]);
    let h = random(5, l / 6);
    h = -sq(2 *z - 1) + 1;
    let col = pg.color(map(i, 0, 5, 0, 255), 80, 150);
    pg.stroke(col);
    pg.strokeWeight(i);
    makeWave(pg, n, spectrum[i] * size, spectrum[i] / 100);
  }
  pg.pop();
}
function makeWave(pg, n, h, sp) {
  pg.push();
  let t = (TWO_PI * (frameCount % 500)) / 500;
  pg.beginShape();
  for (let x = -l / 2; x < l / 2; x++) {
    let z = map(x, -l / 2, l / 2, 0, 1);
    let alpha = -sq(2 * z - 1) + 1;
    let off = sin((n * TWO_PI * (x + l / 2)) / l + sp * t) * h * alpha;
    pg.curveVertex(x, off);
  }
  pg.endShape();
  pg.pop();
}
function Bubble(pg, spectrum) {
  pg.push();
  pg.translate(width * 0.5, height * 0.5);
  for (i = 125; i < spectrum.length / 4; i++) {
    let x = spectrum[i] * size;
    let y = spectrum[i] * size;
    pg.rotate(i * 0.01);
    pg.fill(map(i, 0, spectrum.length / 4, 0, 300));
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