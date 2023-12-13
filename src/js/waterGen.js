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


function animate(time) {

    waterUniformList.forEach((x) => x['time'].value += 1.0 / 90.0);


    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);