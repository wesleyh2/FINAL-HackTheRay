import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Water } from 'three/examples/jsm/objects/Water.js';
import * as dat from 'dat.gui';
import { generateFractal, generateComplex } from './lsystem.js';

// use this to run "parcel src/index.html"

const { Vector3, Geometry, Line, LineBasicMaterial } = THREE;

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

const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);
orbit.update();

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


const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: false
});

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.castShadow = true;

sphere.position.set(-10, 10, 0);

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
const gui = new dat.GUI();

const options = {
    cubeColor: '#ffea00',
    speed: 0.01
};

gui.addColor(options, 'cubeColor').onChange(function (e) {
    boxMaterial.color.set(e);
    sphereMaterial.color.set(e);

});

gui.add(options, 'speed', 0, 0.02);

let step = 0;

const mousePos = new THREE.Vector2();

window.addEventListener('mousemove', function (e) {
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = - (e.clientY / this.window.innerHeight) * 2 + 1;
});

const rayCast = new THREE.Raycaster();

const planeID = plane.id;

function animate(time) {
    // box.rotation.x = time / 1000;
    // box.rotation.y = time / 1000;

    // step += options.speed;
    // sphere.position.y = 10 * Math.abs(Math.sin(step))

    // if (plane.geometry.attributes.position.array[2] > 10) {
    //     plane.geometry.attributes.position.array[2] = 0.01 * time;
    // }
    // plane.geometry.attributes.position.needsUpdate = true;

    // rayCast.setFromCamera(mousePos, camera);
    // const intersects = rayCast.intersectObjects(scene.children);
    // // console.log(intersects);
    // intersectIndex = intersects.length - 1;
    // if (intersects.length != 0 && intersects[intersectIndex].object.id === planeID) {
    //     for (let j = -9; j < 10; j++) {
    //         setTimeout(() => {
    //             // for (let i = -j + 1; i < j; i++) {
    //             faceNum = planeSegments * planeSegments * 2;
    //             faceIn = intersects[intersectIndex].faceIndex + 2;
    //             vertIndex = (Math.floor((faceIn / 2) / planeSegments) * (planeSegments + 1) + (faceIn / 2) % planeSegments);
    //             plane.geometry.attributes.position.array[(vertIndex + j * (planeSegments + 1)) * 3 - 1] = 1;
    //             plane.geometry.attributes.position.array[(vertIndex + j) * 3 - 1] = 1;

    //             plane.geometry.attributes.position.needsUpdate = true;
    //             // }
    //         }, 70);
    //     }
    // }
    // for (let i = 0; i < plane.geometry.attributes.position.array.length / 3; i++) {
    //     if (plane.geometry.attributes.position.array[i * 3 - 1] > 0) {
    //         plane.geometry.attributes.position.array[i * 3 - 1] -= 0.01;
    //         plane.geometry.attributes.position.needsUpdate = true;
    //     }
    // }

    // console.log(intersects);
    renderer.render(scene, camera);
}

/* L SYSTEM */
//initializations for L-system
let currentPosition;
let currentDirection = new Vector3(0, 1, 0);
let stack = [];

//TEXTURING
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

drawFractal(3, new Vector3(0, 5, 0));

function drawFractal(n, startingPos) {
    let depth = 0;
    currentPosition = startingPos;
    const word = generateComplex(n);
    for (let i = 0; i < word.length; i++) {
        const currentSymbol = word[i];

        switch (currentSymbol) {
            case "F": //draw forward
            case "Y":
                drawForward();
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
}

function drawForward() {
    let depth = 0;
    if(stack.length > 0) {
        depth = stack[stack.length - 1].depth;
    }
    else {
        depth = 0;
    }
    const newPos = currentPosition.clone().add(currentDirection);
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
    scene.add(cyl);
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

function getRandomAngle() {
    return (Math.floor(Math.random() * 20 + 15)) * Math.PI / 180;
}

renderer.setAnimationLoop(animate);