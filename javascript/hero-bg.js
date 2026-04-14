import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    100,
);
camera.position.z = 5;

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

const sphereGeom = new THREE.SphereGeometry(2.7, 10, 10); 
const sphereMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.4
});
const globe = new THREE.Mesh(sphereGeom, sphereMat);
globeGroup.add(globe);

const totalLines = 45;
const xRange = 1.4;
const rRange = 3.5;

const p1 = 0.4;
const p2 = 2.0;

let countLines = 0;
for (let j = 0; j < totalLines; j++) {
    const t = j / (totalLines - 1);
    const x = (t - 0.5) * 2 * xRange;
    
    const shape = Math.max(0, 1.0 - Math.pow(Math.abs(x) / xRange, p1)); 
    const yBoundary = Math.pow(shape, p2) * rRange; 

    if (yBoundary > 0.01) countLines++;
}

const starVertices = new Float32Array(countLines * 2 * 2 * 3); 

let finalIdx = 0;
for (let j = 0; j < totalLines; j++) {
    const t = j / (totalLines - 1);
    const val = (t - 0.5) * 2 * xRange;
    
    const shape = Math.max(0, 1.0 - Math.pow(Math.abs(val) / xRange, p1));
    const yBoundary = Math.pow(shape, p2) * rRange;

    if (yBoundary > 0.01) {

        starVertices[finalIdx++] = val;
        starVertices[finalIdx++] = -yBoundary; 
        starVertices[finalIdx++] = 0;

        starVertices[finalIdx++] = val; 
        starVertices[finalIdx++] = yBoundary;  
        starVertices[finalIdx++] = 0;

        starVertices[finalIdx++] = 0; 
        starVertices[finalIdx++] = -yBoundary; 
        starVertices[finalIdx++] = val;

        starVertices[finalIdx++] = 0; 
        starVertices[finalIdx++] = yBoundary;  
        starVertices[finalIdx++] = val;
    }
}

const starLinesGeom = new THREE.BufferGeometry();
starLinesGeom.setAttribute('position', new THREE.BufferAttribute(starVertices, 3));

const starLinesMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const starCore = new THREE.LineSegments(starLinesGeom, starLinesMat);
globeGroup.add(starCore);

globeGroup.position.set(4, 0.3, 1);
globeGroup.rotation.x = -Math.PI / 1.1;
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

    starCore.rotation.y += 0.001;
    starCore.material.opacity = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;

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

animate();