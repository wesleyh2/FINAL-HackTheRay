import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Water } from 'three/examples/jsm/objects/Water.js';
import * as dat from 'dat.gui';
import { generateFractal, generateComplex } from './lsystem.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'

// use this to run "parcel src/index.html"

const { Vector3, Geometry, Line, LineBasicMaterial } = THREE;

//SET UP SCENE
const renderer = new THREE.WebGLRenderer;
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const initialLook = new Vector3(0, 2.5, 0);
camera.position.set(0, 4, 9);
camera.lookAt(initialLook);

//Set up OrbitControls
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.copy(initialLook);
orbit.update();

//Set up FlyControls
fly = new FlyControls( camera, renderer.domElement );
fly.movementSpeed = 100;
fly.autoForward = false;
fly.dragToLook = true;

let isOrbitControlsActive = true;

// Toggle flying and orbiting
document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        isOrbitControlsActive = !isOrbitControlsActive;
        // Enable or disable controls based on the mode
        orbit.enabled = isOrbitControlsActive;
        fly.enabled = !isOrbitControlsActive;
    }
});

renderer.setAnimationLoop(animate);

/* GEOMETRY */
// const boxGeometry = new THREE.BoxGeometry();
// const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
// const box = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30, 50, 50);
const planeDimensions = 30;
const planeSegments = 50;
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    wireframe: false,
    side: THREE.DoubleSide
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;


// const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
// const sphereMaterial = new THREE.MeshStandardMaterial({
//     color: 0x0000FF,
//     wireframe: false
// });

// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// scene.add(sphere);
// sphere.castShadow = true;

// sphere.position.set(-10, 10, 0);

/* LIGHTING */
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(dLightHelper);

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

// const spotLight = new THREE.SpotLight(0xFFFFFF, 1000);
// scene.add(spotLight);
// spotLight.position.set(-30, 30, 0);
// spotLight.castShadow = true;
// spotLight.angle = 0.3;

// const sLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(sLightHelper);

/* GUI */
// const gui = new dat.GUI();

// const options = {
//     cubeColor: '#ffea00',
//     speed: 0.01
// };

// gui.addColor(options, 'cubeColor').onChange(function (e) {
//     boxMaterial.color.set(e);
//     sphereMaterial.color.set(e);

// });

// gui.add(options, 'speed', 0, 0.02);

let step = 0;

const mousePos = new THREE.Vector2();

window.addEventListener('mousemove', function (e) {
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = - (e.clientY / this.window.innerHeight) * 2 + 1;
});

const rayCast = new THREE.Raycaster();

const planeID = plane.id;

function animate(time) {
    renderer.render(scene, camera);
    fly.update(0.001);
    // requestAnimationFrame( animate );
}

/* L SYSTEM */
//initializations for L-system
let currentPosition;
let currentDirection = new Vector3(0, 1, 0);
let stack = [];

const barkMaterial = new THREE.MeshStandardMaterial({
    color: '#a5633c',
})

const maxWidth = 0.1;
const minWidth = 0.01;
const decayFactor = 0.8;
//turning
const pitchAxis = new Vector3(1, 0, 0);
const rollAxis = new Vector3(0, 0, 1);
const turnAxis = new Vector3(0, 1, 0);
const angle = 10;

function randomIntFromInterval(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
const words = [generateComplex(2), generateComplex(3), generateComplex(4)];

drawTree(new Vector3(0, 0, 0));
drawTree(new Vector3(5, 0, 0));
drawTree(new Vector3(10, 0, 0));

function drawTree(startingPos) {
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);
    let depth = 0;
    currentPosition = new Vector3(0, 0, 0);
    const word = words[randomIntFromInterval(0, 2)];
    for (let i = 0; i < word.length; i++) {
        const currentSymbol = word[i];

        switch (currentSymbol) {
            case "F": //draw forward
            case "Y":
                if(currentDirection.y > -0.2)
                    drawForward(treeGroup);
                break;
            case "+": //turn left
                turn(-1);
                break;
            case "-": //turn right
                turn(1);
                break;
            case "&": //pitch down
                pitch(1);
                break;
            case "^": //pitch up
                pitch(-1);
                break;
            case "\\": //roll left
                roll(1);
                break;
            case "/": //roll right
                roll(-1);
                break;
            case "|": //turn around
                turnAround(currentDirection);
                break;
            case "[":
                //save current position and direction to stack
                depth += 1;
                stack.push({ 
                    position: currentPosition.clone(), 
                    direction: currentDirection.clone(),
                    depth: depth
                });
                break;
            case "]":
                //pop from the stack and reset position and direction
                const data = stack.pop();
                if (data) {
                    currentPosition.copy(data.position);
                    currentDirection.copy(data.direction);
                    depth = data.depth;
                }
                break;
            default:
                break;
        }
    }
    const randomRotation = Math.random() * Math.PI * 2; 
    treeGroup.rotation.y = randomRotation;

    treeGroup.position.copy(startingPos);
}

function drawForward(treeGroup) {
    let depth = 0;
    if(stack.length > 0) {
        depth = stack[stack.length - 1].depth;
    }
    else {
        depth = 0;
    }
    const newPos = currentPosition.clone().add(currentDirection);
    //const newPos = currentPosition.clone().add(currentDirection.clone().multiplyScalar(2)); //bigger adjustment
    const direction = new Vector3().subVectors(newPos, currentPosition);
    const distance = direction.length()

    //generate cylinder
    const thickness = Math.max(minWidth, maxWidth * Math.pow(decayFactor, depth));
    const cylGeometry = new THREE.CylinderGeometry(thickness, thickness, distance, 16);
    const cyl = new THREE.Mesh(cylGeometry, barkMaterial);
    
    //center cylinder at halfway point
    cyl.position.copy(currentPosition.clone().add(direction.multiplyScalar(0.5)));
    //set rotation
    cyl.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
    if(depth > 4) { //only add leaves to upper branches
        addLeaves(cyl, 3);
    }
    treeGroup.add(cyl);
    currentPosition = newPos;
}

function turn(direction) {
    currentDirection.applyAxisAngle(turnAxis, (direction * angle) * Math.PI / 180);
    currentDirection.normalize();
}

function pitch(direction) {
    currentDirection.applyAxisAngle(pitchAxis, (direction * angle) * Math.PI / 180);
    currentDirection.normalize();
}

function roll(direction) {
    currentDirection.applyAxisAngle(rollAxis, (direction * angle) * Math.PI / 180);
    currentDirection.normalize();
}

function turnAround() {
    currentDirection.applyAxisAngle(turnAxis, Math.PI);
    currentDirection.normalize();
}

function addLeaves(cylinder, numLeaves) {
    const leafSize = 0.1; 
    const increment = 1 / numLeaves;
    
    const leafGeometry = new THREE.ConeGeometry(leafSize, leafSize * 2, 8);
    const leafMaterial = new THREE.MeshStandardMaterial({ 
        color: '#6ec007', 
    });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

    // Position the leaf on the cylinder
    const x = cylinder.geometry.parameters.radiusTop;
    leaf.position.set(x, 0, 0);
    
    // Orient the leaf
    const leafNormal = new THREE.Vector3(x, 0, 0).normalize();
    const leafQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), leafNormal);
    leaf.setRotationFromQuaternion(leafQuaternion);
    const directionVector = new THREE.Vector3(0, 1, 0);
    const leafDirection = directionVector.applyQuaternion(leafQuaternion);

    // Iterate through rest of leaves
    cylinder.add(leaf);
    for (let i = 1; i < numLeaves; i++) {
        const curLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
        curLeaf.position.addScaledVector(leafDirection, i * increment);
        cylinder.add(curLeaf);
    }
}