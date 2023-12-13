import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Water } from 'three/examples/jsm/objects/Water.js';
import * as dat from 'dat.gui';
import { generateFractal } from './lsystem.js';
import { PriorityQueue } from './priorityqueue.js';
import { Water } from '../classes/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

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
const tLoader = new THREE.TextureLoader();
const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);
orbit.update();
const Perlin = require('./perlin.js').Perlin;
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


/* GEOMETRY */
//water
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
//terrain
var terrain_width = 200;
var terrain_height = 200;
var geometry = new THREE.PlaneGeometry(500, 500, terrain_width-1, terrain_height-1 );
var material = new THREE.MeshLambertMaterial({color: 0x3c3951});
var terrain = new THREE.Mesh( geometry, material );
terrain.rotation.x = -Math.PI / 2;
scene.add( terrain );


/*var peak = 60;
var vertices = terrain.geometry.attributes.position.array;
for (var i = 0; i <= vertices.length; i += 3) {
    vertices[i+2] = peak * Math.random();
}
terrain.geometry.attributes.position.needsUpdate = true;
terrain.geometry.computeVertexNormals();*/

var perlin = new Perlin();
var peak = 50;
var peak1 = 10
var peak2 = 5;
var peak3 = 2.5;

var smoothing = 300;
var smoothing1 = 75;
var smoothing2 = 25;
var smoothing3 = 10;
var vertices = terrain.geometry.attributes.position.array;
//console.log(vertices.length);

function makeArray(w, h, val) {
    var arr = [];
    for(let i = 0; i < h; i++) {
        arr[i] = [];
        for(let j = 0; j < w; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}
var cost_arr = makeArray(terrain_width, terrain_height, Infinity);
var visited = makeArray(terrain_width, terrain_height, 0);
var height_map = makeArray(terrain_width, terrain_height, 0);
var origin_map = makeArray(terrain_width, terrain_height, []);
var pairwiseQueue = new PriorityQueue((a, b) => a[1] < b[1]);

for (var i = 0; i <= vertices.length; i += 3) {
    

    vertices[i+2] = Math.max(5, peak * Math.abs(perlin.noise(
        (terrain.position.x + vertices[i])/smoothing, 
        (terrain.position.z + vertices[i+1])/smoothing
    ))+ peak1 * perlin.noise(
        (terrain.position.x + vertices[i])/smoothing1, 
        (terrain.position.z + vertices[i+1])/smoothing1
    )+ peak2 * perlin.noise(
        (terrain.position.x + vertices[i])/smoothing2, 
        (terrain.position.z + vertices[i+1])/smoothing2
    )+ peak3 * perlin.noise(
        (terrain.position.x + vertices[i])/smoothing3, 
        (terrain.position.z + vertices[i+1])/smoothing3
    ));

    var vertex_num = i/3;
    var y = Math.floor(vertex_num/terrain_width);
    var x = (vertex_num%(terrain_width));
    height_map[x][y] = vertices[i+2];

}

var startPercentageX = 0.8
var startPercentageY = 0.05
var endPercentageX = 0.05
var endPercentageY = 0.8
var startX = Math.round((terrain_width-1) * startPercentageX);
var startY = Math.round((terrain_height-1) * startPercentageY);
var endX = Math.round((terrain_width-1) * endPercentageX);
var endY = Math.round((terrain_height-1) * endPercentageY);
cost_arr[startX][startY] = 0;
var x = startX;
var y = startY;
var count = 0;
//console.log(startX, startY);
//console.log(endX, endY);
while(true){
    
    count++;
    
    //x+1 case
    if(x+1 < terrain_width && visited[x+1][y] == 0){
        if(cost_arr[x][y] + (height_map[x+1][y]-height_map[x][y]) < cost_arr[x+1][y]){
            cost_arr[x+1][y] = cost_arr[x][y] + (height_map[x+1][y]-height_map[x][y]);
            pairwiseQueue.push([[x+1,y], cost_arr[x+1][y]]);
            origin_map[x+1][y] = [x,y];
        }
    }
    //x-1 case
    if(x-1 >= 0 && visited[x-1][y] == 0){
        if(cost_arr[x][y] + (height_map[x-1][y]-height_map[x][y]) < cost_arr[x-1][y]){
            cost_arr[x-1][y] = cost_arr[x][y] + (height_map[x-1][y]-height_map[x][y]);
            pairwiseQueue.push([[x-1,y], cost_arr[x-1][y]]);
            origin_map[x-1][y] = [x,y];
        }
    }
    //y+1 case
    if(y+1 < terrain_height && visited[x][y+1] == 0){
        if(cost_arr[x][y] + (height_map[x][y+1]-height_map[x][y]) < cost_arr[x][y+1]){
            cost_arr[x][y+1] = cost_arr[x][y] + (height_map[x][y+1]-height_map[x][y]);
            pairwiseQueue.push([[x,y+1], cost_arr[x][y+1]]);
            origin_map[x][y+1] = [x,y];
        }
    }
    //y-1 case
    if(y-1 >= 0 && visited[x][y-1] == 0){
        if(cost_arr[x][y] + (height_map[x][y-1]-height_map[x][y]) < cost_arr[x][y-1]){
            cost_arr[x][y-1] = cost_arr[x][y] + (height_map[x][y-1]-height_map[x][y]);
            pairwiseQueue.push([[x,y-1], cost_arr[x][y-1]]);
            origin_map[x][y-1] = [x,y];
        }
    }
    visited[x][y] = 1;
    //pairwiseQueue.push([0,0]);
    //console.log(x,y);
    
    if (!pairwiseQueue.isEmpty()) {
        var result = pairwiseQueue.pop();
        //console.log(result);
        x = result[0][0];
        y = result[0][1];
        
    }
    
    
    //console.log(result);
    if(x == endX && y == endY){
        break;
    }
}
//backtrack to create river
var backtrack_x = endX;
var backtrack_y = endY;
while(true){
    //console.log(backtrack_x, backtrack_y);
    var origin = origin_map[backtrack_x][backtrack_y];
    //console.log(origin);
    
    
    backtrack_x = origin[0];
    backtrack_y = origin[1];
    for(let i = -3; i<3; i++){
        for(let j = -3; j<3; j++){
            var vertex_index = ((backtrack_y+i)*terrain_width+(backtrack_x+j))*3;
            vertices[vertex_index+2] = -20;
        }
        
        
    }
    if(backtrack_x == startX && backtrack_y == startY){
        //vertices[vertex_index+2] = 200;
        break;
    }
    
    

}
//vertices[(40*20+20)*3+2] = 200;
//console.log(vertices.length);





terrain.geometry.attributes.position.needsUpdate = true;
terrain.geometry.computeVertexNormals();



/* LIGHTING */
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;


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
function animate() {
    step += options.speed;
    //waterUniformList.forEach((x) => x['time'].value += 1.0 / 90.0);
    water.material.uniforms['time'].value += 1.0 / 60.0;
    
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);
