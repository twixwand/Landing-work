import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function updateSize() {
    const wrapper = document.getElementById('top-section-wrapper');
    if (wrapper) {
        const width = window.innerWidth;
        const height = wrapper.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
}

const container = document.getElementById('three-bg-container');
if (container) {
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
}

const globeGroup = new THREE.Group();

const sphereGeom = new THREE.SphereGeometry(2, 12, 12); 
const sphereMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.4
});
const globe = new THREE.Mesh(sphereGeom, sphereMat);
globeGroup.add(globe);

const innerGeom = new THREE.IcosahedronGeometry(0.8, 1); 
const innerMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.4 
});
const innerCore = new THREE.Mesh(innerGeom, innerMat);
globeGroup.add(innerCore);

globeGroup.position.set(3, 0.5, 1); 
scene.add(globeGroup);

const planeGeom = new THREE.PlaneGeometry(40, 30, 15, 15);
const edgesGeom = new THREE.EdgesGeometry(planeGeom);
const lineMat = new THREE.LineBasicMaterial({ 
    color: 0xffffff,
    transparent: true, 
    opacity: 0.5
});
const planeLines = new THREE.LineSegments(edgesGeom, lineMat);

const pointsMat = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 0.1, 
    transparent: true, 
    opacity: 0.8
});
const planePoints = new THREE.Points(planeGeom, pointsMat);

const floorGroup = new THREE.Group();
floorGroup.add(planeLines);
floorGroup.add(planePoints);
floorGroup.rotation.x = -Math.PI / 5;
floorGroup.rotation.y = -Math.PI / 20;
floorGroup.rotation.z = -Math.PI / 10;
floorGroup.position.set(1, -8.5, 1);
scene.add(floorGroup);

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    globe.rotation.y += 0.0005;
    innerCore.rotation.y -= 0.001;

    const positions = planeGeom.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.3 + time) * 0.6 + Math.cos(y * 0.6 + time) * 0.6;
    }
    planeGeom.attributes.position.needsUpdate = true;

    planeLines.geometry.dispose();
    planeLines.geometry = new THREE.EdgesGeometry(planeGeom);

    renderer.render(scene, camera);
}

window.addEventListener('resize', updateSize);
updateSize();
camera.position.z = 4;
animate();