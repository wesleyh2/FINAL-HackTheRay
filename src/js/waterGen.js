import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Water } from '../classes/myWater.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { Refractor } from 'three/examples/jsm/objects/Refractor.js';


import * as dat from 'dat.gui';
import { generateFractal } from './lsystem.js';



// use this to run parcel: "./src/index.html"

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

const tLoader = new THREE.TextureLoader();



// /* GEOMETRY */


const planeGeometry = new THREE.PlaneGeometry(30, 30, 50, 50);
const planeSegments = 50;

const water = new Water(planeGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: tLoader.load('https://threejs.org/examples/textures/waternormals.jpg', function (texture) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        }),
        waterDisp: tLoader.load('https://threejs.org/examples/textures/water.jpg', function (texture) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        })
    });

water.rotation.x = -Math.PI / 2;
scene.add(water);
water.receiveShadow = true;

const water2 = new Water(planeGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: tLoader.load('https://ibb.co/YDFz5df', function (texture) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        }),
        sunDirection: new THREE.Vector3(),
        waterColor: 0x001e0f
    });

water2.rotation.x = -Math.PI / 2;


water2.scale.x = 0.5;
water2.scale.y = 0.5;

water2.position.x = 20;


scene.add(water2);
water2.receiveShadow = true;

const point1 = new THREE.Vector3(0, 4, 0);
const point2 = new THREE.Vector3(15, 0, 3);

const inputPoints = [point1, point2, 4];

function createWater(input) {
    const distance = Math.abs(input[0].distanceTo(input[1]));
    const center = input[1].sub(input[0]).multiplyScalar(0.5).add(input[0]);
    console.log(center);

    const myPlaneGeometry = new THREE.PlaneGeometry(distance, input[2], 50, 50);


    const myWater = new Water(myPlaneGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: tLoader.load('https://threejs.org/examples/textures/waternormals.jpg', function (texture) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            }),
            sunDirection: new THREE.Vector3(),
            waterColor: 0x001e0f,

        });

    const a1 = point1.y - point2.y;
    const b1 = point1.x - point2.x;
    const yAngle = -Math.asin(a1 / b1);

    let a2 = point2.z - point1.z;
    let b2 = point2.x - point1.x;
    if (!(isFinite(a2 / b2))) {
        b2 = 1;
        a2 = 0;
    }
    const zAngle = -Math.atan(a2 / b2);
    console.log(Math.atan(5));

    myWater.rotation.x = -Math.PI / 2;
    myWater.rotation.y = yAngle;
    myWater.rotation.z = zAngle;


    myWater.position.x = center.x;
    myWater.position.y = center.y;
    myWater.position.z = center.z;

    scene.add(myWater);
    myWater.receiveShadow = true;

    return (myWater.material.uniforms);

}



waterUniformList = [createWater(inputPoints), water.material.uniforms, water2.material.uniforms];

// // skybox

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;

skyUniforms['turbidity'].value = 10;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

const parameters = {
    elevation: 2,
    azimuth: 180
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);
let renderTarget;

function updateSun() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    sun = new THREE.Vector3();

    const theta = Math.PI * (0.49 - 0.5);
    const phi = 2 * Math.PI * (0.205 - 0.5);
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    if (renderTarget !== undefined) renderTarget.dispose();

    renderTarget = pmremGenerator.fromScene(sky);

    scene.environment = renderTarget.texture;
    return sun;
}

updateSun();

// // sphere gen
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: false
});

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.castShadow = true;

sphere.position.set(-10, 10, 0);

const sphereGeometry1 = new THREE.SphereGeometry(1, 50, 50);
const sphereMaterial1 = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: false
});

const sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
scene.add(sphere1);
sphere1.castShadow = true;

sphere1.position.set(0, 4, 0);

const sphereGeometry2 = new THREE.SphereGeometry(1, 50, 50);
const sphereMaterial2 = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: false
});

const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
scene.add(sphere2);
sphere2.castShadow = true;

sphere2.position.set(15, 0, 3);



// /* LIGHTING */
// // const ambientLight = new THREE.AmbientLight(0x333333);
// // scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;

// /* GUI */
const gui = new dat.GUI();

const options = {
    waterColor: '#ffea90',
    speed: 0.01
};

gui.addColor(options, 'waterColor').onChange(function (e) {
    water.waterColor = e;
    sphereMaterial.color.set(e);
});

gui.add(options, 'speed', 0, 0.02);

let step = 0;

// // Ray casting

const mousePos = new THREE.Vector2();

window.addEventListener('mousemove', function (e) {
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = - (e.clientY / this.window.innerHeight) * 2 + 1;
});

const rayCast = new THREE.Raycaster();

const waterID = water.id;

function raisedWater() {
    rayCast.setFromCamera(mousePos, camera);
    const intersects = rayCast.intersectObjects(scene.children);
    if (intersects.length != 0 && intersects[0].object.id === waterID) {
        for (let j = -3; j < 4; j++) {
            faceNum = planeSegments * planeSegments * 2;
            faceIn = intersects[0].faceIndex + 2;
            vertIndex = (Math.floor((faceIn / 2) / planeSegments) * (planeSegments + 1) + (faceIn / 2) % planeSegments);
            water.geometry.attributes.position.array[(vertIndex + j * (planeSegments + 1)) * 3 - 1] = 1;
            water.geometry.attributes.position.array[(vertIndex + j) * 3 - 1] = 1;
            water.geometry.attributes.position.needsUpdate = true;

        }
    }
    for (let i = 0; i < water.geometry.attributes.position.array.length / 3; i++) {
        if (water.geometry.attributes.position.array[i * 3 - 1] > 0) {
            water.geometry.attributes.position.array[i * 3 - 1] -= 0.01;
            water.geometry.attributes.position.needsUpdate = true;
        }
    }
}

function animate(time) {

    step += options.speed;

    waterUniformList.forEach((x) => x['time'].value += 1.0 / 90.0);

    raisedWater();




    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
