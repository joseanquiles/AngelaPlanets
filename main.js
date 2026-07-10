import * as THREE from "three";

/* -------------------------------------------------------------------- */
/*  Datos de los planetas (valores reales usados solo como proporción)  */
/* -------------------------------------------------------------------- */
// distancia: UA reales comprimidas con raíz cuadrada para que sea navegable
// periodo: días reales -> usados SOLO para la relación de velocidades angulares
// radio: km reales comprimidos con raíz cúbica para que todos sean visibles
const AU = 22; // unidades tres.js por raíz(UA)
const EARTH_YEAR_SECONDS = 26; // segundos que tarda la Tierra en orbitar a timeScale=1

const PLANETS = [
  { key: "1", name: "Mercurio", color: 0x9c9591, distanceAU: 0.39, periodDays: 88, radiusKm: 2440, rotationHours: 1408, tilt: 0.03 },
  { key: "2", name: "Venus", color: 0xe0c185, distanceAU: 0.72, periodDays: 224.7, radiusKm: 6052, rotationHours: -5832, tilt: 3.1 },
  { key: "3", name: "Tierra", color: 0x3a7bd5, distanceAU: 1.0, periodDays: 365.25, radiusKm: 6371, rotationHours: 24, tilt: 0.41, moon: true },
  { key: "4", name: "Marte", color: 0xc1440e, distanceAU: 1.52, periodDays: 687, radiusKm: 3390, rotationHours: 24.6, tilt: 0.44 },
  { key: "5", name: "Júpiter", color: 0xd9b98a, distanceAU: 5.2, periodDays: 4331, radiusKm: 69911, rotationHours: 9.9, tilt: 0.05 },
  { key: "6", name: "Saturno", color: 0xe3c17f, distanceAU: 9.58, periodDays: 10747, radiusKm: 58232, rotationHours: 10.7, tilt: 0.47, rings: true },
  { key: "7", name: "Urano", color: 0x9fd6e0, distanceAU: 19.2, periodDays: 30589, radiusKm: 25362, rotationHours: -17.2, tilt: 1.71 },
  { key: "8", name: "Neptuno", color: 0x4166f5, distanceAU: 30.05, periodDays: 59800, radiusKm: 24622, rotationHours: 16.1, tilt: 0.49 },
];

function scaleDistance(au) {
  return Math.sqrt(au) * AU + 6;
}
function scaleRadius(km) {
  return Math.cbrt(km) * 0.045 + 0.35;
}
function formatOrbitYears(periodDays) {
  const years = periodDays / 365.25;
  if (Math.abs(years - 1) < 0.005) return "1 año terrestre";
  const decimals = years < 10 ? 2 : 1;
  return `${years.toFixed(decimals)} años terrestres`;
}

/* -------------------------------------------------------------------- */
/*  Escena básica                                                       */
/* -------------------------------------------------------------------- */
const app = document.getElementById("app");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 20000);
const INITIAL_CAMERA_POSITION = new THREE.Vector3(0, 40, 140);
const INITIAL_LOOKAT = new THREE.Vector3(0, 0, 0);
camera.position.copy(INITIAL_CAMERA_POSITION);

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
app.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* -------------------------------------------------------------------- */
/*  Estrellas de fondo                                                  */
/* -------------------------------------------------------------------- */
function createStarfield() {
  const counts = [4000, 2500];
  const radii = [1800, 6000];
  const sizes = [1.1, 2.2];
  const group = new THREE.Group();

  for (let layer = 0; layer < counts.length; layer++) {
    const count = counts[layer];
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radii[layer] * (0.35 + Math.random() * 0.65);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const tint = 0.75 + Math.random() * 0.25;
      const warm = Math.random() < 0.15;
      colors[i * 3] = tint * (warm ? 1 : 0.85 + Math.random() * 0.15);
      colors[i * 3 + 1] = tint * (warm ? 0.85 : 0.9 + Math.random() * 0.1);
      colors[i * 3 + 2] = tint * (warm ? 0.7 : 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: sizes[layer],
      vertexColors: true,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.9,
    });
    group.add(new THREE.Points(geometry, material));
  }
  return group;
}
scene.add(createStarfield());

/* -------------------------------------------------------------------- */
/*  Texturas procedurales (sin dependencias externas)                   */
/* -------------------------------------------------------------------- */
function makeCanvas(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  return canvas;
}

function surfaceTexture(baseColor, options = {}) {
  const { bands = false, spots = 60, seed = 1 } = options;
  const size = 256;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(baseColor);

  ctx.fillStyle = `rgb(${base.r * 255},${base.g * 255},${base.b * 255})`;
  ctx.fillRect(0, 0, size, size);

  let rnd = seed;
  const rand = () => {
    rnd = (rnd * 9301 + 49297) % 233280;
    return rnd / 233280;
  };

  if (bands) {
    for (let y = 0; y < size; y++) {
      const t = (Math.sin(y * 0.09) + Math.sin(y * 0.021 + 2)) * 0.5;
      const shade = 1 + t * 0.18;
      ctx.fillStyle = `rgba(255,255,255,${t > 0 ? t * 0.12 : 0})`;
      ctx.fillRect(0, y, size, 1);
      if (t < -0.1) {
        ctx.fillStyle = `rgba(0,0,0,${-t * 0.15})`;
        ctx.fillRect(0, y, size, 1);
      }
    }
  } else {
    for (let i = 0; i < spots; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = rand() * size * 0.12 + 4;
      const light = rand() > 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = light
        ? `rgba(255,255,255,${rand() * 0.1})`
        : `rgba(0,0,0,${rand() * 0.12})`;
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function sunTexture() {
  const size = 256;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "#fff6d0");
  gradient.addColorStop(0.5, "#ffd35c");
  gradient.addColorStop(1, "#ff9d1f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  let rnd = 7;
  const rand = () => {
    rnd = (rnd * 9301 + 49297) % 233280;
    return rnd / 233280;
  };
  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, rand() * 10 + 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,150,30,${rand() * 0.15})`;
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function glowSprite(color, size) {
  const canvas = makeCanvas(128);
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  const c = new THREE.Color(color);
  gradient.addColorStop(0, `rgba(${c.r * 255},${c.g * 255},${c.b * 255},0.9)`);
  gradient.addColorStop(0.4, `rgba(${c.r * 255},${c.g * 255},${c.b * 255},0.25)`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, 1);
  return sprite;
}

function ringTexture(baseColor) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = 4;
  const ctx = canvas.getContext("2d");
  const c = new THREE.Color(baseColor);
  for (let x = 0; x < size; x++) {
    const t = x / size;
    const noise = Math.sin(t * 60) * 0.5 + Math.sin(t * 130 + 1) * 0.3;
    const alpha = Math.max(0, Math.min(1, 0.35 + noise * 0.4)) * (t < 0.06 || t > 0.94 ? 0.2 : 1);
    ctx.fillStyle = `rgba(${c.r * 255},${c.g * 255},${c.b * 255},${alpha})`;
    ctx.fillRect(x, 0, 1, 4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/* -------------------------------------------------------------------- */
/*  Sol                                                                  */
/* -------------------------------------------------------------------- */
const sunRadius = 5.5;
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(sunRadius, 48, 48),
  new THREE.MeshBasicMaterial({ map: sunTexture() })
);
sun.userData.name = "Sol";
sun.userData.detail = "Estrella central · 333 000 masas terrestres";
scene.add(sun);
sun.add(glowSprite(0xffcc66, sunRadius * 7));

const sunLight = new THREE.PointLight(0xfff4d6, 3.2, 0, 0);
sun.add(sunLight);
scene.add(new THREE.AmbientLight(0x223344, 0.35));

/* -------------------------------------------------------------------- */
/*  Planetas                                                            */
/* -------------------------------------------------------------------- */
const hud = document.getElementById("hud");
const bodies = []; // { name, pivot, mesh, distance, angularSpeed, spinSpeed, radius }

function buildOrbitLine(radius) {
  const points = [];
  const segments = 180;
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x3a5680, transparent: true, opacity: 0.35 });
  return new THREE.LineLoop(geometry, material);
}

PLANETS.forEach((data, index) => {
  const distance = scaleDistance(data.distanceAU);
  const radius = scaleRadius(data.radiusKm);
  const color = data.colorOverride ?? data.color;

  scene.add(buildOrbitLine(distance));

  const pivot = new THREE.Object3D();
  pivot.rotation.y = Math.random() * Math.PI * 2; // fase inicial variada
  scene.add(pivot);

  const isGasGiant = data.radiusKm > 20000;
  const material = new THREE.MeshStandardMaterial({
    map: surfaceTexture(color, { bands: isGasGiant, spots: 50, seed: index * 13 + 3 }),
    roughness: 0.85,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 40), material);
  mesh.position.set(distance, 0, 0);
  mesh.rotation.z = data.tilt;
  mesh.userData.name = data.name;
  mesh.userData.detail =
    `Distancia: ${data.distanceAU} UA\n` +
    `Radio: ${data.radiusKm.toLocaleString("es-ES")} km\n` +
    `Órbita: ${data.periodDays.toLocaleString("es-ES")} días terrestres\n` +
    `Vuelta al Sol: ${formatOrbitYears(data.periodDays)}`;
  pivot.add(mesh);

  if (data.rings) {
    const inner = radius * 1.4;
    const outer = radius * 2.5;
    const ringGeo = new THREE.RingGeometry(inner, outer, 96, 4);
    // remapea UVs de forma radial para que la textura de anillo se vea correcta
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const t = (v3.length() - inner) / (outer - inner);
      uv.setXY(i, t, 0.5);
    }
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTexture(color),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 - 0.4;
    mesh.add(ring);
  }

  let moon = null;
  if (data.moon) {
    const moonPivot = new THREE.Object3D();
    mesh.add(moonPivot);
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.27, 20, 20),
      new THREE.MeshStandardMaterial({ map: surfaceTexture(0xb9b9b9, { spots: 40, seed: 99 }), roughness: 0.9 })
    );
    moonMesh.position.set(radius * 3.2, 0, 0);
    moonMesh.userData.name = "Luna";
    moonMesh.userData.detail = "Satélite natural de la Tierra";
    moonPivot.add(moonMesh);
    moon = { pivot: moonPivot, angularSpeed: (Math.PI * 2) / (27.3 / 365.25 * EARTH_YEAR_SECONDS) };
  }

  const periodSimSeconds = (data.periodDays / 365.25) * EARTH_YEAR_SECONDS;
  const angularSpeed = (Math.PI * 2) / periodSimSeconds;
  const spinSpeed = data.rotationHours ? (Math.PI * 2) / (Math.abs(data.rotationHours) / 24 * 4) * Math.sign(data.rotationHours) : 0;

  bodies.push({
    key: data.key,
    name: data.name,
    pivot,
    mesh,
    distance,
    radius,
    angularSpeed,
    spinSpeed,
    moon,
  });
});

/* -------------------------------------------------------------------- */
/*  Etiquetas HTML flotantes                                            */
/* -------------------------------------------------------------------- */
const labelObjects = [sun, ...bodies.map((b) => b.mesh)].map((obj) => {
  const el = document.createElement("div");
  el.className = "planet-label";
  el.textContent = obj.userData.name;
  hud.appendChild(el);
  return { obj, el };
});

const projectVector = new THREE.Vector3();
function updateLabels() {
  for (const { obj, el } of labelObjects) {
    obj.getWorldPosition(projectVector);
    const distToCam = projectVector.distanceTo(camera.position);
    projectVector.project(camera);
    const behind = projectVector.z > 1;
    if (behind || distToCam > 3200) {
      el.style.display = "none";
      continue;
    }
    const x = (projectVector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projectVector.y * 0.5 + 0.5) * window.innerHeight;
    el.style.display = "block";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.opacity = distToCam > 1600 ? String(1 - (distToCam - 1600) / 1600) : "1";
  }
}

/* -------------------------------------------------------------------- */
/*  Navegación libre por el espacio (pointer lock + WASD)               */
/* -------------------------------------------------------------------- */
let yaw = 0;
let pitch = -0.15;
let isLocked = false;

const canvasEl = renderer.domElement;
const clickHint = document.getElementById("click-hint");

canvasEl.addEventListener("click", () => {
  canvasEl.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  isLocked = document.pointerLockElement === canvasEl;
  clickHint.classList.toggle("hidden", isLocked);
});

document.addEventListener("mousemove", (e) => {
  if (!isLocked) return;
  const sensitivity = 0.0022;
  yaw -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;
  const limit = Math.PI / 2 - 0.01;
  pitch = Math.max(-limit, Math.min(limit, pitch));
});

const keys = new Set();
let moveSpeed = 5;
const MIN_SPEED = 0.2;
const MAX_SPEED = 400;
let timeScale = 1;
let paused = false;
let travelTarget = null; // { position: Vector3, lookAt: Vector3 } easing helper

const speedValueEl = document.getElementById("speed-value");
const targetNameEl = document.getElementById("target-name");
const targetDetailEl = document.getElementById("target-detail");
const helpPanel = document.getElementById("help-panel");
const helpToggle = document.getElementById("help-toggle");
const resetViewButton = document.getElementById("reset-view");

helpToggle.addEventListener("click", () => helpPanel.classList.toggle("hidden"));
resetViewButton.addEventListener("click", resetView);

window.addEventListener("keydown", (e) => {
  keys.add(e.code);

  if (e.code === "KeyP") paused = !paused;
  if (e.code === "Equal" || e.code === "NumpadAdd") timeScale = Math.min(timeScale * 1.6, 400);
  if (e.code === "Minus" || e.code === "NumpadSubtract") timeScale = Math.max(timeScale / 1.6, 0.02);
  if (e.code === "KeyQ") moveSpeed = Math.max(MIN_SPEED, moveSpeed / 1.2);
  if (e.code === "KeyE") moveSpeed = Math.min(MAX_SPEED, moveSpeed * 1.2);

  if (e.code === "Digit0") flyTo(sun, sunRadius * 8);
  if (e.code === "Home") resetView();
  const num = e.code.match(/^Digit([1-9])$/);
  if (num) {
    if (num[1] === "9") {
      overviewCamera();
    } else {
      const body = bodies.find((b) => b.key === num[1]);
      if (body) flyTo(body.mesh, body.radius * 10 + 4);
    }
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.code));

canvasEl.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.93 : 1.08;
    moveSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, moveSpeed * factor));
  },
  { passive: false }
);

function flyTo(object3d, offsetDistance) {
  const targetPos = new THREE.Vector3();
  object3d.getWorldPosition(targetPos);
  const dir = new THREE.Vector3(0.55, 0.35, 0.75).normalize();
  const destination = targetPos.clone().add(dir.multiplyScalar(offsetDistance));
  travelTarget = { destination, lookAt: targetPos, name: object3d.userData.name, detail: object3d.userData.detail };
}

function overviewCamera() {
  const destination = new THREE.Vector3(0, 260, 420);
  travelTarget = { destination, lookAt: new THREE.Vector3(0, 0, 0), name: "Vista general", detail: "Sistema Solar completo" };
}

function resetView() {
  travelTarget = {
    destination: INITIAL_CAMERA_POSITION.clone(),
    lookAt: INITIAL_LOOKAT.clone(),
    name: "Sistema Solar",
    detail: "Vista inicial",
  };
}

function lookAtToEuler(fromPos, toPos) {
  const dir = toPos.clone().sub(fromPos).normalize();
  const newPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
  const newYaw = Math.atan2(-dir.x, -dir.z);
  return { newYaw, newPitch };
}

const forwardVec = new THREE.Vector3();
const rightVec = new THREE.Vector3();
const upVec = new THREE.Vector3(0, 1, 0);
const moveVec = new THREE.Vector3();

function updateMovement(dt) {
  if (travelTarget) {
    const dist = camera.position.distanceTo(travelTarget.destination);
    camera.position.lerp(travelTarget.destination, Math.min(1, dt * 2.2));
    const { newYaw, newPitch } = lookAtToEuler(camera.position, travelTarget.lookAt);
    yaw += (newYaw - yaw) * Math.min(1, dt * 3);
    pitch += (newPitch - pitch) * Math.min(1, dt * 3);
    if (dist < 0.5) {
      targetNameEl.textContent = travelTarget.name;
      targetDetailEl.textContent = travelTarget.detail || "";
      travelTarget = null;
    }
    return;
  }

  camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));

  if (!isLocked) return;

  moveVec.set(0, 0, 0);
  camera.getWorldDirection(forwardVec);
  rightVec.crossVectors(forwardVec, camera.up).normalize();

  if (keys.has("KeyW") || keys.has("ArrowUp")) moveVec.add(forwardVec);
  if (keys.has("KeyS") || keys.has("ArrowDown")) moveVec.sub(forwardVec);
  if (keys.has("KeyD") || keys.has("ArrowRight")) moveVec.add(rightVec);
  if (keys.has("KeyA") || keys.has("ArrowLeft")) moveVec.sub(rightVec);
  if (keys.has("Space")) moveVec.add(upVec);
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) moveVec.sub(upVec);

  if (moveVec.lengthSq() > 0) {
    moveVec.normalize().multiplyScalar(moveSpeed * dt);
    camera.position.add(moveVec);
  }
}

/* -------------------------------------------------------------------- */
/*  Detección de proximidad para el panel de información                */
/* -------------------------------------------------------------------- */
const nearVector = new THREE.Vector3();
function updateProximityInfo() {
  if (travelTarget) return;
  let closest = null;
  let closestDist = Infinity;

  sun.getWorldPosition(nearVector);
  let d = camera.position.distanceTo(nearVector) - sunRadius;
  if (d < closestDist) {
    closestDist = d;
    closest = { name: sun.userData.name, detail: sun.userData.detail };
  }

  for (const body of bodies) {
    body.mesh.getWorldPosition(nearVector);
    d = camera.position.distanceTo(nearVector) - body.radius;
    if (d < closestDist) {
      closestDist = d;
      closest = { name: body.name, detail: body.mesh.userData.detail };
    }
  }

  if (closest && closestDist < 60) {
    targetNameEl.textContent = closest.name;
    targetDetailEl.textContent = closest.detail;
  } else {
    targetNameEl.textContent = "Sistema Solar";
    targetDetailEl.textContent = "Explora libremente con W A S D + ratón";
  }
}

/* -------------------------------------------------------------------- */
/*  Bucle de animación                                                  */
/* -------------------------------------------------------------------- */
const clock = new THREE.Clock();
let simTime = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  if (!paused) simTime += dt * timeScale;

  for (const body of bodies) {
    body.pivot.rotation.y = body.angularSpeed * simTime;
    body.mesh.rotation.y = body.spinSpeed * simTime;
    if (body.moon) body.moon.pivot.rotation.y = body.moon.angularSpeed * simTime;
  }
  sun.rotation.y += dt * 0.02;

  updateMovement(dt);
  updateLabels();
  updateProximityInfo();

  speedValueEl.textContent = moveSpeed.toFixed(1);

  renderer.render(scene, camera);
}

const loadingEl = document.getElementById("loading");
requestAnimationFrame(() => {
  loadingEl.classList.add("hidden");
});

animate();
