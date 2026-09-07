import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    200,
);
camera.position.z = 7.5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function updateSize() {
    const wrapper = document.getElementById('top-section-wrapper');
    if (!wrapper) return;

    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

updateSize();

const container = document.getElementById('three-bg-container');
if (container) {
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
}

const globeGroup = new THREE.Group();

const sphereGeom = new THREE.SphereGeometry(3, 15, 15); 
const sphereMat = new THREE.MeshPhongMaterial({ 
    color: 'white',
    emissive: 'white',
    shininess: 100,
    wireframe: true, 
    transparent: true, 
    opacity: 0.4
});


const globe = new THREE.Mesh(sphereGeom, sphereMat);
globeGroup.add(globe);

const totalLines = 35;
const xRange = 1.4;
const rRange = 3;

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
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});

const starCore = new THREE.LineSegments(starLinesGeom, starLinesMat);
globeGroup.add(starCore);

globeGroup.rotation.x = -Math.PI / 1.07;

function adaptiveGlobe() {
    const width = window.innerWidth;
    if(width >= 768) {
        globeGroup.position.set(4, 0.3, 3);
    } else {
        globeGroup.position.set(2.4, 0.3, 2.5);
    }
}

scene.add(globeGroup);
adaptiveGlobe();

const cols = 16, rows = 15;
const planeGeom = new THREE.PlaneGeometry(40, 30, cols, rows);
const planePos = planeGeom.attributes.position;

const segCount = (cols + 1) * rows * 2 + cols * (rows + 1) * 2;
const linePositions = new Float32Array(segCount * 2 * 3);
const lineIdx = new Uint32Array(segCount * 2);
let li = 0, vIdx = 0;

for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
        const idx = j * (cols + 1) + i;
        lineIdx[vIdx * 2] = li;
        lineIdx[vIdx * 2 + 1] = li + 1;
        if (i < cols) {
            linePositions[li * 3] = planePos.getX(idx);
            linePositions[li * 3 + 1] = planePos.getY(idx);
            linePositions[li * 3 + 2] = planePos.getZ(idx);
            linePositions[li * 3 + 3] = planePos.getX(idx + 1);
            linePositions[li * 3 + 4] = planePos.getY(idx + 1);
            linePositions[li * 3 + 5] = planePos.getZ(idx + 1);
            li += 2;
        }
        if (j < rows) {
            lineIdx[vIdx * 2] = li;
            lineIdx[vIdx * 2 + 1] = li + 1;
            linePositions[li * 3] = planePos.getX(idx);
            linePositions[li * 3 + 1] = planePos.getY(idx);
            linePositions[li * 3 + 2] = planePos.getZ(idx);
            linePositions[li * 3 + 3] = planePos.getX(idx + cols + 1);
            linePositions[li * 3 + 4] = planePos.getY(idx + cols + 1);
            linePositions[li * 3 + 5] = planePos.getZ(idx + cols + 1);
            li += 2;
        }
        vIdx++;
    }
}

const lineGeom = new THREE.BufferGeometry();
lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

const lineMat = new THREE.LineBasicMaterial({ 
    color: 0xffffff,
    transparent: true, 
    opacity: 0.2
});
const planeLines = new THREE.LineSegments(lineGeom, lineMat);
planeLines.renderOrder = 1;

const pointsMat = new THREE.PointsMaterial({ 
    color: 'white', 
    size: 0.1, 
    transparent: true, 
    opacity: 0.8
});
const planePoints = new THREE.Points(planeGeom, pointsMat);
planePoints.renderOrder = 0;

const floorGroup = new THREE.Group();
floorGroup.add(planeLines);
floorGroup.add(planePoints);
floorGroup.rotation.x = -Math.PI / 5;
floorGroup.rotation.y = -Math.PI / 20;
floorGroup.rotation.z = -Math.PI / 10;
floorGroup.position.set(1, -8.5, 5);
scene.add(floorGroup);

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    globe.rotation.y += 0.005;
    starCore.rotation.y += 0.005;

    const positions = planePos.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.3 + time) * 0.6 + Math.cos(y * 0.6 + time) * 0.6;
    }
    planePos.needsUpdate = true;

    const linePos = lineGeom.attributes.position.array;
    li = 0;
    for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
            const idx = j * (cols + 1) + i;
            if (i < cols) {
                linePos[li * 3] = planePos.getX(idx);
                linePos[li * 3 + 1] = planePos.getY(idx);
                linePos[li * 3 + 2] = planePos.getZ(idx);
                linePos[li * 3 + 3] = planePos.getX(idx + 1);
                linePos[li * 3 + 4] = planePos.getY(idx + 1);
                linePos[li * 3 + 5] = planePos.getZ(idx + 1);
                li += 2;
            }
            if (j < rows) {
                linePos[li * 3] = planePos.getX(idx);
                linePos[li * 3 + 1] = planePos.getY(idx);
                linePos[li * 3 + 2] = planePos.getZ(idx);
                linePos[li * 3 + 3] = planePos.getX(idx + cols + 1);
                linePos[li * 3 + 4] = planePos.getY(idx + cols + 1);
                linePos[li * 3 + 5] = planePos.getZ(idx + cols + 1);
                li += 2;
            }
        }
    }
    lineGeom.attributes.position.needsUpdate = true;
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    updateSize();
    adaptiveGlobe();
});
animate();