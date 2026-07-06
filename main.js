// --- Three.js 仙侠法阵与灵气粒子 ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 1. 灵气粒子 (星空/萤火虫)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 800;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // 随机分布在屏幕内外
    posArray[i] = (Math.random() - 0.5) * 15;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xd4af37, // 金色灵气
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

// 2. 底部法阵 (使用圆环和线条模拟)
const circleGeo = new THREE.RingGeometry(3, 3.1, 64);
const circleMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
const magicCircle = new THREE.Mesh(circleGeo, circleMat);
magicCircle.rotation.x = Math.PI / 2 - 0.2; // 倾斜躺平
magicCircle.position.y = -2;
scene.add(magicCircle);

camera.position.z = 5;

// Three.js 动画循环
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();
    requestAnimationFrame(animate);
    
    // 粒子缓慢旋转上升
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.position.y = Math.sin(elapsedTime * 0.2) * 0.2;
    
    // 法阵缓慢逆时针旋转
    magicCircle.rotation.z = -elapsedTime * 0.1;

    renderer.render(scene, camera);
}
animate();

// 窗口自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP UI 交互动画 ---
const cards = document.querySelectorAll('.port-card');

cards.forEach(card => {
    // 鼠标进入：卡片上浮，发光，模拟灵力注入
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -10,
            borderColor: 'rgba(212, 175, 55, 0.8)',
            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
            duration: 0.4,
            ease: "power2.out"
        });
        // 图标放大
        gsap.to(card.querySelector('.port-icon'), {
            scale: 1.2,
            rotation: 15,
            duration: 0.4
        });
    });

    // 鼠标离开：恢复原状
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0,
            borderColor: 'rgba(212, 175, 55, 0.2)',
            boxShadow: 'none',
            duration: 0.4,
            ease: "power2.out"
        });
        gsap.to(card.querySelector('.port-icon'), {
            scale: 1,
            rotation: 0,
            duration: 0.4
        });
    });
});