import * as THREE from "three";

/* -------------------------------------------------------------------- */
/*  Datos de los planetas (valores reales usados solo como proporción)  */
/* -------------------------------------------------------------------- */
// distancia: UA reales comprimidas con raíz cuadrada para que sea navegable
// periodo: días reales -> usados SOLO para la relación de velocidades angulares
// radio: km reales comprimidos con raíz cúbica para que todos sean visibles
const AU = 22; // unidades tres.js por raíz(UA)
const EARTH_YEAR_SECONDS = 26; // segundos que tarda la Tierra en orbitar a timeScale=1
const MOON_SLOWDOWN = 16; // ralentiza solo a las lunas, manteniendo su velocidad relativa real

const PLANETS = [
  {
    key: "1", name: "Mercurio", color: 0x9c9591, distanceAU: 0.39, periodDays: 88, radiusKm: 2440, rotationHours: 1408, tilt: 0.03,
    notableMoons: [], gravity: 0.38, orbitalSpeedKms: 47.4, avgTempC: 167, meanLongitudeJ2000: 252.25,
    fact: "El planeta más cercano al Sol y el más pequeño del sistema solar. Sufre las mayores variaciones de temperatura: hasta 600°C entre el día y la noche.",
    structure: [
      { name: "Núcleo de hierro", to: 0.85, color: 0xc9c2b4 },
      { name: "Manto de silicatos", to: 0.97, color: 0x8a6a52 },
      { name: "Corteza", to: 1.0, color: 0x9c9591 },
    ],
  },
  {
    key: "2", name: "Venus", color: 0xe0c185, distanceAU: 0.72, periodDays: 224.7, radiusKm: 6052, rotationHours: -5832, tilt: 3.1,
    notableMoons: [], gravity: 0.91, orbitalSpeedKms: 35.0, avgTempC: 464, meanLongitudeJ2000: 181.98,
    fact: "El planeta más caliente del sistema solar por su densa atmósfera de CO2. Gira en sentido retrógrado y tan despacio que su día dura más que su año.",
    structure: [
      { name: "Núcleo metálico", to: 0.5, color: 0xdba15c },
      { name: "Manto rocoso", to: 0.97, color: 0xb97a3f },
      { name: "Corteza", to: 1.0, color: 0xe0c185 },
    ],
  },
  {
    key: "3", name: "Tierra", color: 0x3a7bd5, distanceAU: 1.0, periodDays: 365.25, radiusKm: 6371, rotationHours: 24, tilt: 0.41,
    notableMoons: [{ name: "Luna", sizeFactor: 0.27, orbitFactor: 2.0, periodDays: 27.3 }],
    gravity: 1.0, orbitalSpeedKms: 29.8, avgTempC: 15, meanLongitudeJ2000: 100.46,
    fact: "El único planeta conocido con vida. El 71% de su superficie está cubierta de agua líquida.",
    structure: [
      { name: "Núcleo interno (sólido)", to: 0.19, color: 0xfff0c2 },
      { name: "Núcleo externo (líquido)", to: 0.55, color: 0xffb066 },
      { name: "Manto", to: 0.97, color: 0xb0523a },
      { name: "Corteza (continentes y océanos)", to: 1.0, color: 0x3a7bd5, continents: 0x2e7d32 },
    ],
  },
  {
    key: "4", name: "Marte", color: 0xc1440e, distanceAU: 1.52, periodDays: 687, radiusKm: 3390, rotationHours: 24.6, tilt: 0.44,
    notableMoons: [
      { name: "Fobos", sizeFactor: 0.14, orbitFactor: 1.8, periodDays: 0.32 },
      { name: "Deimos", sizeFactor: 0.1, orbitFactor: 2.6, periodDays: 1.26 },
    ],
    gravity: 0.38, orbitalSpeedKms: 24.1, avgTempC: -65, meanLongitudeJ2000: 355.45,
    fact: "Conocido como el planeta rojo por el óxido de hierro de su superficie. Alberga el Monte Olimpo, el volcán más grande del sistema solar.",
    structure: [
      { name: "Núcleo de hierro y azufre", to: 0.53, color: 0xd8935c },
      { name: "Manto rocoso", to: 0.98, color: 0xa14a26 },
      { name: "Corteza", to: 1.0, color: 0xc1440e },
    ],
  },
  {
    key: "5", name: "Júpiter", color: 0xd9b98a, distanceAU: 5.2, periodDays: 4331, radiusKm: 69911, rotationHours: 9.9, tilt: 0.05,
    notableMoons: [
      { name: "Ío", sizeFactor: 0.16, orbitFactor: 3.0, periodDays: 1.77 },
      { name: "Europa", sizeFactor: 0.14, orbitFactor: 3.8, periodDays: 3.55 },
      { name: "Ganímedes", sizeFactor: 0.22, orbitFactor: 4.8, periodDays: 7.15 },
      { name: "Calisto", sizeFactor: 0.2, orbitFactor: 5.6, periodDays: 16.69 },
    ],
    gravity: 2.53, orbitalSpeedKms: 13.1, avgTempC: -110, meanLongitudeJ2000: 34.4,
    fact: "El planeta más grande del sistema solar. Su Gran Mancha Roja es una tormenta anticiclónica mayor que la Tierra.",
    structure: [
      { name: "Núcleo rocoso/metálico", to: 0.15, color: 0x7a5c3e },
      { name: "Hidrógeno metálico", to: 0.8, color: 0xcf9f6e },
      { name: "Hidrógeno/helio líquido", to: 0.97, color: 0xe0c49a },
      { name: "Atmósfera", to: 1.0, color: 0xd9b98a },
    ],
  },
  {
    key: "6", name: "Saturno", color: 0xe3c17f, distanceAU: 9.58, periodDays: 10747, radiusKm: 58232, rotationHours: 10.7, tilt: 0.47, rings: true,
    notableMoons: [
      { name: "Mimas", sizeFactor: 0.09, orbitFactor: 3.3, periodDays: 0.94 },
      { name: "Encélado", sizeFactor: 0.1, orbitFactor: 3.7, periodDays: 1.37 },
      { name: "Rea", sizeFactor: 0.15, orbitFactor: 4.3, periodDays: 4.5 },
      { name: "Titán", sizeFactor: 0.24, orbitFactor: 5.0, periodDays: 15.95 },
      { name: "Jápeto", sizeFactor: 0.13, orbitFactor: 6.0, periodDays: 79.3 },
    ],
    gravity: 1.06, orbitalSpeedKms: 9.7, avgTempC: -140, meanLongitudeJ2000: 49.95,
    fact: "Famoso por su espectacular sistema de anillos, compuestos principalmente de hielo y roca.",
    structure: [
      { name: "Núcleo rocoso/metálico", to: 0.15, color: 0x7a6248 },
      { name: "Hidrógeno metálico", to: 0.6, color: 0xcaa76d },
      { name: "Hidrógeno/helio líquido", to: 0.97, color: 0xdfc38f },
      { name: "Atmósfera", to: 1.0, color: 0xe3c17f },
    ],
  },
  {
    key: "7", name: "Urano", color: 0x9fd6e0, distanceAU: 19.2, periodDays: 30589, radiusKm: 25362, rotationHours: -17.2, tilt: 1.71,
    notableMoons: [
      { name: "Miranda", sizeFactor: 0.1, orbitFactor: 3.0, periodDays: 1.41 },
      { name: "Ariel", sizeFactor: 0.15, orbitFactor: 3.8, periodDays: 2.52 },
      { name: "Umbriel", sizeFactor: 0.15, orbitFactor: 4.6, periodDays: 4.14 },
      { name: "Titania", sizeFactor: 0.2, orbitFactor: 5.6, periodDays: 8.71 },
      { name: "Oberón", sizeFactor: 0.19, orbitFactor: 6.6, periodDays: 13.46 },
    ],
    gravity: 0.89, orbitalSpeedKms: 6.8, avgTempC: -195, meanLongitudeJ2000: 313.24,
    fact: "Gira prácticamente 'tumbado de lado', con un eje de rotación casi paralelo a su órbita.",
    structure: [
      { name: "Núcleo rocoso", to: 0.2, color: 0x5c4a3e },
      { name: "Manto helado", to: 0.8, color: 0x4fa3ad },
      { name: "Atmósfera", to: 1.0, color: 0x9fd6e0 },
    ],
  },
  {
    key: "8", name: "Neptuno", color: 0x4166f5, distanceAU: 30.05, periodDays: 59800, radiusKm: 24622, rotationHours: 16.1, tilt: 0.49,
    notableMoons: [{ name: "Tritón", sizeFactor: 0.24, orbitFactor: 3.5, periodDays: 5.88, retrograde: true }],
    gravity: 1.14, orbitalSpeedKms: 5.4, avgTempC: -200, meanLongitudeJ2000: 304.88,
    fact: "El planeta más lejano y ventoso: sus vientos pueden superar los 2000 km/h.",
    structure: [
      { name: "Núcleo rocoso", to: 0.2, color: 0x4a3c52 },
      { name: "Manto helado", to: 0.8, color: 0x2f4fb0 },
      { name: "Atmósfera", to: 1.0, color: 0x4166f5 },
    ],
  },
];

const SUN_INFO = {
  name: "Sol",
  color: 0xffcc55,
  radiusKm: 696000,
  fact: "Una estrella enana amarilla que concentra el 99.8% de la masa del sistema solar. Su luz tarda unos 8 minutos en llegar a la Tierra.",
  structure: [
    { name: "Núcleo", to: 0.25, color: 0xfff6d0 },
    { name: "Zona radiativa", to: 0.7, color: 0xffd35c },
    { name: "Zona convectiva", to: 0.98, color: 0xff9d1f },
    { name: "Fotosfera", to: 1.0, color: 0xffcc55 },
  ],
};

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
  resizeStructureView();
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
  const { bands = false, spots = 60, seed = 1, continents = null } = options;
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

  if (continents) {
    const land = new THREE.Color(continents);
    const clusters = 8;
    for (let c = 0; c < clusters; c++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const blobCount = 8 + Math.floor(rand() * 8);
      for (let b = 0; b < blobCount; b++) {
        const x = cx + (rand() - 0.5) * 80;
        const y = cy + (rand() - 0.5) * 80;
        const r = rand() * 20 + 9;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${land.r * 255},${land.g * 255},${land.b * 255},${0.6 + rand() * 0.3})`;
        ctx.fill();
      }
    }
  }

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
const bodies = []; // { name, pivot, mesh, distance, angularSpeed, spinSpeed, radius, moons }

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
    map: surfaceTexture(color, {
      bands: isGasGiant,
      spots: 50,
      seed: index * 13 + 3,
      continents: data.name === "Tierra" ? 0x2e7d32 : null,
    }),
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

  const moons = data.notableMoons.map((moonData, moonIndex) => {
    // se cuelga de `pivot` (traslación anual), no de `mesh` (rotación diaria),
    // para que el giro axial del planeta no arrastre la órbita de la luna
    const moonPivot = new THREE.Object3D();
    moonPivot.position.copy(mesh.position);
    moonPivot.rotation.y = Math.random() * Math.PI * 2; // fase inicial variada
    pivot.add(moonPivot);
    const moonRadius = radius * moonData.sizeFactor;
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(moonRadius, 18, 18),
      new THREE.MeshStandardMaterial({
        map: surfaceTexture(0xb9b9b9, { spots: 35, seed: index * 31 + moonIndex * 7 + 11 }),
        roughness: 0.9,
      })
    );
    moonMesh.position.set(radius * moonData.orbitFactor, 0, 0);
    moonMesh.userData.name = moonData.name;
    moonMesh.userData.detail = `Satélite de ${data.name}`;
    moonPivot.add(moonMesh);
    const moonPeriodSimSeconds = (moonData.periodDays / 365.25) * EARTH_YEAR_SECONDS * MOON_SLOWDOWN;
    const moonAngularSpeed = ((Math.PI * 2) / moonPeriodSimSeconds) * (moonData.retrograde ? -1 : 1);
    return { name: moonData.name, pivot: moonPivot, angularSpeed: moonAngularSpeed };
  });

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
    moons,
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
let timeScale = 0.3;
let paused = false;
let travelTarget = null; // { position: Vector3, lookAt: Vector3 } easing helper

const speedValueEl = document.getElementById("speed-value");
const targetNameEl = document.getElementById("target-name");
const targetDetailEl = document.getElementById("target-detail");
const helpPanel = document.getElementById("help-panel");
const helpToggle = document.getElementById("help-toggle");
const resetViewButton = document.getElementById("reset-view");
const planetSearchInput = document.getElementById("planet-search");
const planetOptionsList = document.getElementById("planet-options");

helpToggle.addEventListener("click", () => helpPanel.classList.toggle("hidden"));
resetViewButton.addEventListener("click", resetView);

function normalizeName(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

[{ name: "Sol" }, ...PLANETS].forEach((data) => {
  const option = document.createElement("option");
  option.value = data.name;
  planetOptionsList.appendChild(option);
});

/* -------------------------------------------------------------------- */
/*  Panel de información detallada del planeta buscado                  */
/* -------------------------------------------------------------------- */
const planetPanel = document.getElementById("planet-panel");
const planetPanelClose = document.getElementById("planet-panel-close");
const planetPanelSwatch = document.getElementById("planet-panel-swatch");
const planetPanelName = document.getElementById("planet-panel-name");
const planetPanelStats = document.getElementById("planet-panel-stats");
const planetPanelFact = document.getElementById("planet-panel-fact");
const planetPanelCenter = document.getElementById("planet-panel-center");

let panelFocusTarget = null; // { object3d, offset }

/* Visor 3D de la estructura interna (mini escena Three.js aparte) */
const structureViewEl = document.getElementById("planet-structure-view");
const structureLegendEl = document.getElementById("planet-structure-legend");

const structureScene = new THREE.Scene();
const structureCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
structureCamera.position.set(0, 0.4, 3.2);
structureCamera.lookAt(0, 0, 0);

const structureRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
structureRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
structureViewEl.appendChild(structureRenderer.domElement);

structureScene.add(new THREE.AmbientLight(0xffffff, 0.55));
const structureLight = new THREE.DirectionalLight(0xffffff, 1.1);
structureLight.position.set(2, 2, 3);
structureScene.add(structureLight);

let structureGroup = null;

function disposeStructureGroup() {
  if (!structureGroup) return;
  structureGroup.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
    }
  });
  structureScene.remove(structureGroup);
  structureGroup = null;
}

function buildStructureView(layers) {
  disposeStructureGroup();
  structureGroup = new THREE.Group();
  // capas de mayor a menor radio: el z-buffer resuelve la oclusión correctamente
  [...layers]
    .sort((a, b) => b.to - a.to)
    .forEach((layer) => {
      const geometry = new THREE.SphereGeometry(layer.to, 40, 24, 0, Math.PI);
      const materialOptions = {
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.05,
      };
      if (layer.continents) {
        materialOptions.map = surfaceTexture(layer.color, { continents: layer.continents, spots: 0 });
      } else {
        materialOptions.color = layer.color;
      }
      const material = new THREE.MeshStandardMaterial(materialOptions);
      structureGroup.add(new THREE.Mesh(geometry, material));
    });
  structureGroup.scale.setScalar(1.15);
  structureGroup.rotation.y = -Math.PI / 2.4;
  structureScene.add(structureGroup);

  structureLegendEl.innerHTML = "";
  layers.forEach((layer) => {
    const li = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = "legend-dot";
    const baseHex = `#${layer.color.toString(16).padStart(6, "0")}`;
    dot.style.background = layer.continents
      ? `linear-gradient(135deg, ${baseHex} 50%, #${layer.continents.toString(16).padStart(6, "0")} 50%)`
      : baseHex;
    li.append(dot, document.createTextNode(layer.name));
    structureLegendEl.appendChild(li);
  });
}

function resizeStructureView() {
  const w = structureViewEl.clientWidth || 260;
  const h = structureViewEl.clientHeight || 180;
  structureCamera.aspect = w / h;
  structureCamera.updateProjectionMatrix();
  structureRenderer.setSize(w, h);
}
resizeStructureView();

function renderStructureView(dt) {
  if (planetPanel.classList.contains("hidden") || !structureGroup) return;
  structureGroup.rotation.y += dt * 0.35;
  structureRenderer.render(structureScene, structureCamera);
}

function renderPlanetPanel({ name, color, stats, fact, structure, focusObject, focusOffset }) {
  planetPanelName.textContent = name;
  planetPanelSwatch.style.background = `#${color.toString(16).padStart(6, "0")}`;
  planetPanelSwatch.style.color = `#${color.toString(16).padStart(6, "0")}`;
  planetPanelStats.innerHTML = "";
  for (const [label, value] of stats) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    planetPanelStats.append(dt, dd);
  }
  planetPanelFact.textContent = fact;
  buildStructureView(structure);
  panelFocusTarget = { object3d: focusObject, offset: focusOffset };
  planetPanel.classList.remove("hidden");
}

function formatRotation(rotationHours) {
  const abs = Math.abs(rotationHours);
  const retro = rotationHours < 0 ? " (retrógrada)" : "";
  if (abs > 48) return `${(abs / 24).toFixed(1)} días terrestres${retro}`;
  return `${abs.toFixed(1)} horas${retro}`;
}

function formatHoursValue(hours) {
  return hours.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

const J2000_UTC_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

// Posición orbital aproximada: usa la longitud media real en J2000 y una
// órbita circular (movimiento medio constante) para estimar en qué punto
// de la vuelta al Sol está el planeta HOY, con la fecha real del sistema.
function formatOrbitProgress(periodDays, meanLongitudeJ2000) {
  const daysSinceJ2000 = (Date.now() - J2000_UTC_MS) / 86400000;
  const longitudeToday = meanLongitudeJ2000 + (360 * daysSinceJ2000) / periodDays;
  const normalized = ((longitudeToday % 360) + 360) % 360;
  const dayOfOrbit = Math.floor((normalized / 360) * periodDays) + 1;
  const daysRemaining = Math.max(0, Math.round(periodDays - (normalized / 360) * periodDays));
  return `Día ${dayOfOrbit} de ${Math.round(periodDays)} — quedan ${daysRemaining} días para completar la vuelta`;
}

function showPlanetInfoPanel(body) {
  const data = PLANETS.find((p) => p.key === body.key);
  renderPlanetPanel({
    name: data.name,
    color: data.colorOverride ?? data.color,
    stats: [
      ["Progreso orbital hoy", formatOrbitProgress(data.periodDays, data.meanLongitudeJ2000)],
      ["Distancia al Sol", `${data.distanceAU} UA (${Math.round(data.distanceAU * 149597870).toLocaleString("es-ES")} km)`],
      ["Radio", `${data.radiusKm.toLocaleString("es-ES")} km (${(data.radiusKm / 6371).toFixed(2)}× la Tierra)`],
      ["Periodo orbital", `${data.periodDays.toLocaleString("es-ES")} días (${formatOrbitYears(data.periodDays)})`],
      ["Velocidad orbital media", `${data.orbitalSpeedKms} km/s`],
      ["Rotación", formatRotation(data.rotationHours)],
      ["Duración del día", `${formatHoursValue(Math.abs(data.rotationHours))} horas`],
      ["Horas de luz", `${formatHoursValue(Math.abs(data.rotationHours) / 2)} horas`],
      ["Horas de noche", `${formatHoursValue(Math.abs(data.rotationHours) / 2)} horas`],
      ["Inclinación axial", `${((data.tilt * 180) / Math.PI).toFixed(1)}°`],
      ["Gravedad superficial", `${data.gravity}× la Tierra`],
      ["Temperatura media", `${data.avgTempC > 0 ? "+" : ""}${data.avgTempC} °C`],
      ["Satélites más conocidos", data.notableMoons.length ? data.notableMoons.map((m) => m.name).join(", ") : "Ninguno"],
    ],
    fact: data.fact,
    structure: data.structure,
    focusObject: body.mesh,
    focusOffset: body.radius * 10 + 4,
  });
}

function showSunInfoPanel() {
  renderPlanetPanel({
    name: SUN_INFO.name,
    color: SUN_INFO.color,
    stats: [
      ["Radio", `${SUN_INFO.radiusKm.toLocaleString("es-ES")} km (109× la Tierra)`],
      ["Masa", "≈333 000× la masa terrestre"],
      ["Temperatura superficial", "≈5 500 °C"],
      ["Distancia media a la Tierra", "149.6 millones de km (1 UA)"],
    ],
    fact: SUN_INFO.fact,
    structure: SUN_INFO.structure,
    focusObject: sun,
    focusOffset: sunRadius * 8,
  });
}

planetPanelClose.addEventListener("click", () => planetPanel.classList.add("hidden"));
planetPanelCenter.addEventListener("click", () => {
  if (panelFocusTarget) flyTo(panelFocusTarget.object3d, panelFocusTarget.offset);
});

function findBodyMatch(query) {
  const q = normalizeName(query);
  if (!q) return null;
  if (normalizeName("Sol").startsWith(q)) return { type: "sun" };
  const body =
    bodies.find((b) => normalizeName(b.name).startsWith(q)) ||
    bodies.find((b) => normalizeName(b.name).includes(q));
  return body ? { type: "planet", body } : null;
}

function handleSearchSubmit() {
  const match = findBodyMatch(planetSearchInput.value);
  planetSearchInput.classList.toggle("search-error", !match);
  if (match) {
    if (match.type === "sun") showSunInfoPanel();
    else showPlanetInfoPanel(match.body);
    planetSearchInput.value = "";
    planetSearchInput.blur();
  }
}

planetSearchInput.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key === "Enter") handleSearchSubmit();
  if (e.key === "Escape") planetSearchInput.blur();
});
planetSearchInput.addEventListener("input", () => planetSearchInput.classList.remove("search-error"));
planetSearchInput.addEventListener("change", handleSearchSubmit);

window.addEventListener("keydown", (e) => {
  if (document.activeElement === planetSearchInput) return;
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
    for (const moon of body.moons) {
      moon.pivot.rotation.y = moon.angularSpeed * simTime;
    }
  }
  sun.rotation.y += dt * 0.02;

  updateMovement(dt);
  updateLabels();
  updateProximityInfo();
  renderStructureView(dt);

  speedValueEl.textContent = moveSpeed.toFixed(1);

  renderer.render(scene, camera);
}

const loadingEl = document.getElementById("loading");
requestAnimationFrame(() => {
  loadingEl.classList.add("hidden");
});

animate();
