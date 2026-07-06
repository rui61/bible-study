const PORTS = [
  { realm: "灵 脉 总 纲", items: [
      { name: "Ollama", host: "localhost", port: 11434, desc: "本地模型推理", status: "online", icon: "⚔️" },
      { name: "OpenRouter", host: "localhost", port: 8080, desc: "模型路由 API", status: "online", icon: "🌌" },
      { name: "Baseten", host: "localhost", port: 8081, desc: "云端部署引擎", status: "online", icon: "🔥" },
  ]},
  { realm: "藏 经 阁", items: [
      { name: "GitLab", host: "localhost", port: 8929, desc: "代码仓库", status: "standby", icon: "📜" },
      { name: "Hugging Face", host: "localhost", port: 8082, desc: "开源社区 / 模型", status: "online", icon: "🌊" },
  ]},
];

function renderGates() {
  const root = document.getElementById('panelRoot');
  root.innerHTML = '';
  PORTS.forEach(section => {
    const sec = document.createElement('div');
    sec.className = 'realm';

    const head = document.createElement('div');
    head.className = 'realm-head';
    head.innerHTML = `<span class="name">${section.realm}</span><span class="line"></span>`;
    sec.appendChild(head);

    const row = document.createElement('div');
    row.className = 'gate-row';

    section.items.forEach(it => {
      const a = document.createElement('a');
      a.className = 'gate';
      a.href = `http://${it.host}:${it.port}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `
        <div class="wall">
          <div class="portal"></div>
          <div class="portal-icon">${it.icon}</div>
          <div class="seal ${it.status}">${it.status === 'online' ? '开' : (it.status === 'standby' ? '候' : '闭')}</div>
        </div>
        <div class="gate-name">${it.name}</div>
        <div class="gate-port">:${it.port}</div>
        <div class="gate-desc">${it.desc}</div>
      `;
      a.addEventListener('click', () => flySwordAt(a));
      row.appendChild(a);
    });

    sec.appendChild(row);
    root.appendChild(sec);
  });
}
renderGates();

function flySwordAt(targetEl) {
  const rect = targetEl.getBoundingClientRect();
  const sword = document.createElement('div');
  sword.className = 'flying-sword';
  document.body.appendChild(sword);
  gsap.set(sword, { left: -100, top: rect.top + rect.height / 2 - 3, rotate: 15, opacity: 1 });
  gsap.to(sword, {
    left: rect.left + rect.width / 2 - 35,
    top: rect.top + rect.height / 2 - 3,
    rotate: 0,
    duration: 0.4,
    ease: 'power3.in',
    onComplete: () => {
      gsap.to(sword, { opacity: 0, scale: 1.8, duration: 0.35, onComplete: () => sword.remove() });
    }
  });
}

gsap.from('.head-title .brand', { opacity: 0, y: -18, duration: 1, ease: 'power2.out' });
gsap.from('.head-title .sub', { opacity: 0, y: 8, duration: 0.8, delay: 0.25 });
gsap.from('.head-clock', { opacity: 0, duration: 0.8, delay: 0.4 });
gsap.to('.realm', {
  opacity: 1, y: 0, duration: 0.9, stagger: 0.18, delay: 0.5, ease: 'power2.out',
  onStart: function () {
    document.querySelectorAll('.realm').forEach(el => el.style.transform = 'translateY(24px)');
  }
});
gsap.from('.gate', { opacity: 0, y: 26, scale: 0.92, duration: 0.7, stagger: 0.06, delay: 0.9, ease: 'back.out(1.5)' });

const SHICHEN = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
function tick() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('clockTime').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const idx = Math.floor(((now.getHours() + 1) % 24) / 2);
  document.getElementById('shichen').textContent = `${SHICHEN[idx]}时`;
}
tick();
setInterval(tick, 1000);

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});
const layers = document.querySelectorAll('.parallax-layer');
function parallaxLoop() {
  layers.forEach(l => {
    const depth = parseFloat(l.dataset.depth);
    const tx = mouseX * depth * 100;
    const ty = mouseY * depth * 60;
    l.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  });
  requestAnimationFrame(parallaxLoop);
}
parallaxLoop();

const canvas = document.getElementById('bg-three');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x080c0b, 0.045);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.5, 11);

scene.add(new THREE.AmbientLight(0x6f9c86, 0.6));
const dirLight = new THREE.DirectionalLight(0xe8c97d, 0.5);
dirLight.position.set(3, 4, 5);
scene.add(dirLight);

const starGeo = new THREE.BufferGeometry();
const starCount = 1000;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 40;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 24 + 4;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 6;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0xE8DFC9, size: 0.05, transparent: true, opacity: 0.75 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

function createFormationTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;
  ctx.strokeStyle = 'rgba(232,201,125,0.85)';
  ctx.lineWidth = 1.4;
  [55, 100, 150, 200].forEach(r => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.globalAlpha = i % 3 === 0 ? 0.55 : 0.15;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 55, cy + Math.sin(a) * 55);
    ctx.lineTo(cx + Math.cos(a) * 200, cy + Math.sin(a) * 200);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.8;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * 175, y = cy + Math.sin(a) * 175;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
    for (let l = 0; l < 3; l++) {
      ctx.beginPath(); ctx.moveTo(-11, l * 8 - 8); ctx.lineTo(11, l * 8 - 8); ctx.stroke();
    }
    ctx.restore();
  }
  return new THREE.CanvasTexture(c);
}
const formationTex = createFormationTexture();
const formation = new THREE.Mesh(
  new THREE.PlaneGeometry(9, 9),
  new THREE.MeshBasicMaterial({ map: formationTex, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })
);
formation.position.set(0, 0.5, -7);
scene.add(formation);

const peaks = [];
const peakColors = [0x14211d, 0x0e1917, 0x182a24];
for (let i = 0; i < 4; i++) {
  const geo = new THREE.ConeGeometry(1.1 + Math.random() * 0.8, 1.6 + Math.random() * 1.2, 5);
  const mat = new THREE.MeshLambertMaterial({ color: peakColors[i % peakColors.length] });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((i - 1.5) * 3.2 + (Math.random() - 0.5), -1.2 - Math.random() * 0.6, -4 - i * 1.3);
  mesh.rotation.y = Math.random() * Math.PI;
  scene.add(mesh);
  peaks.push({ mesh, base: mesh.position.y, phase: Math.random() * Math.PI * 2 });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

let camMouseX = 0, camMouseY = 0;
window.addEventListener('mousemove', e => {
  camMouseX = (e.clientX / window.innerWidth - 0.5);
  camMouseY = (e.clientY / window.innerHeight - 0.5);
});

const clock3 = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock3.getElapsedTime();

  stars.rotation.y = t * 0.006;
  formation.rotation.z = t * 0.05;

  peaks.forEach(p => {
    p.mesh.position.y = p.base + Math.sin(t * 0.4 + p.phase) * 0.15;
  });

  camera.position.x += (camMouseX * 1.2 - camera.position.x) * 0.02;
  camera.position.y += (0.5 - camMouseY * 0.6 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, -5);

  renderer.render(scene, camera);
}
animate();
