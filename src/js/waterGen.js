import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Water } from 'three/examples/jsm/objects/Water.js';
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


/* GEOMETRY */
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30, 50, 50);
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

const water = new Water(planeGeometry, {
    scale: 1,
    textureWidth: 512,
    textureHeight: 512,
    flowSpeed: 0.04,
    reflectivity: 0.35,

});

water.position.y = 1.2;
water.rotation.x = -Math.PI / 2;
// scene.add(water);




// sphere gen
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

const spotLight = new THREE.SpotLight(0xFFFFFF, 1000);
scene.add(spotLight);
spotLight.position.set(-30, 30, 0);
spotLight.castShadow = true;
spotLight.angle = 0.3;

// const sLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(sLightHelper);

/* GUI */
const gui = new dat.GUI();

const options = {
    waterColor: '#ffea90',
    speed: 0.01
};

gui.addColor(options, 'waterColor').onChange(function (e) {
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

    step += options.speed;


    rayCast.setFromCamera(mousePos, camera);
    const intersects = rayCast.intersectObjects(scene.children);
    console.log(intersects);

    if (intersects.length != 0 && intersects[0].object.id === planeID) {
        for (let i = -3; i < 4; i++) {
            faceNum = planeSegments * planeSegments * 2;
            faceIn = intersects[0].faceIndex + 2;
            vertIndex = (Math.floor((faceIn / 2) / planeSegments) * (planeSegments + 1) + (faceIn / 2) % planeSegments);
            plane.geometry.attributes.position.array[(vertIndex + j * (planeSegments + 1)) * 3 - 1] = 1;
            plane.geometry.attributes.position.array[(vertIndex + j) * 3 - 1] = 1;
            plane.geometry.attributes.position.needsUpdate = true;

        }
    }
    // for (let i = 0; i < plane.geometry.attributes.position.array.length / 3; i++) {
    //     if (plane.geometry.attributes.position.array[i * 3 - 1] > 0) {
    //         plane.geometry.attributes.position.array[i * 3 - 1] -= 0.01;
    //         plane.geometry.attributes.position.needsUpdate = true;
    //     }
    // }

    console.log(intersects);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
