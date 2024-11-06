let mic, fft;
let pg; // Graphics buffer for 2D rendering
let size = 0.5;
let px = 0, py = 0;
let ripples = []; // Array to manage ripple effects
let arButton;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pg = createGraphics(windowWidth, windowHeight); // Graphics buffer for 2D rendering
 

  // Set up microphone input
  mic = new p5.AudioIn();
  mic.start(); // Start microphone input

  fft = new p5.FFT();
  fft.setInput(mic);

  userStartAudio();
}

// Function to start AR session upon button click
function startARSession() {
  if (navigator.xr) {
    navigator.xr.requestSession('immersive-ar')
      .then((session) => {
        // Commented out to avoid console output in AR
        // console.log('AR session started');
        arButton.style('visibility', 'hidden'); // Hide button once AR starts
        // Setup AR rendering here (e.g., attach session to canvas)
      })
      .catch((err) => {
        console.error('Failed to start AR session', err);
      });
  } else {
    console.log('WebXR not supported');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg = createGraphics(windowWidth, windowHeight); // Resize graphics buffer as well
}

function draw() {
  clear(); // Use clear to keep the background transparent

  if (mic.enabled) {
    // Draw 3D effects and 2D effects if microphone is active
    draw3D();
    pg.clear(); // Clear pg buffer for transparency
    draw2D(pg);

    // Display 2D graphics buffer on 3D canvas
    texture(pg);
    plane(width, height);
  }
}

// 3D effect rendering function
function draw3D() {
  let spectrum = fft.analyze();
  let volume = spectrum[50]; // スペクトルからのボリューム取得

  let boxSize = map(volume, 0, 255, 50, 200);
  let boxHeight = map(volume, 0, 255, 0, 200);
  let colorValue = map(volume, 0, 255, 50, 255);

  // 画面の四隅の座標を計算
  const positions = [
    { x: -width / 2 + boxSize / 2, y: -height / 2 + boxSize / 2 },
    { x: width / 2 - boxSize / 2, y: -height / 2 + boxSize / 2 },
    { x: -width / 2 + boxSize / 2, y: height / 2 - boxSize / 2 },
    { x: width / 2 - boxSize / 2, y: height / 2 - boxSize / 2 }
  ];

  positions.forEach((pos) => {
    push();
    translate(pos.x, pos.y, 0);
    noFill();
    stroke(colorValue, 147, 206, 200);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    box(boxSize, boxSize, boxHeight);
    pop();
  });
}

// 2D effect rendering function
function draw2D(pg) {
  pg.clear(); // バッファを透明背景でクリア
  pg.noFill();
  pg.stroke(255);
  let spectrum = fft.analyze();

  // Draw ripple and bubble effects
  drawRipples(pg, spectrum);
  Bubble(pg, spectrum);
}

// Ripple effect function
function drawRipples(pg, spectrum) {
  let volume = fft.getEnergy(20, 200);

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

// Bubble effect function
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

// Variable ellipse function for bubble effect
function variableEllipse(pg, x, y, px, py) {
  let speed = abs(x - px) + abs(y - py);
  pg.ellipse(x, y, speed, speed);
}
