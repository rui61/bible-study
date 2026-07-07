const canvas = document.querySelector('#bg-three');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 800;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 15;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
  size: 0.02,
  color: 0xd4af37,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

const circleGeo = new THREE.RingGeometry(3, 3.1, 64);
const circleMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
const magicCircle = new THREE.Mesh(circleGeo, circleMat);
magicCircle.rotation.x = Math.PI / 2 - 0.2;
magicCircle.position.y = -2;
scene.add(magicCircle);

camera.position.z = 5;

const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  requestAnimationFrame(animate);

  particlesMesh.rotation.y = elapsedTime * 0.05;
  particlesMesh.position.y = Math.sin(elapsedTime * 0.2) * 0.2;

  magicCircle.rotation.z = -elapsedTime * 0.1;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
