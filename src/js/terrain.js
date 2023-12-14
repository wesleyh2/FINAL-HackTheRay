import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui';
import { generateFractal } from './lsystem.js';
import { PriorityQueue } from './priorityqueue.js';
import { Water } from '../classes/myWater.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
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
const tLoader = new THREE.TextureLoader();
const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);
orbit.update();
const Perlin = require('./perlin.js').Perlin;

/* L SYSTEM */
//initializations for L-system
let currentPosition;
let currentDirection = new Vector3(0, 1, 0);
let stack = [];

const barkMaterial = new THREE.MeshStandardMaterial({
    color: '#a5633c',
})

const maxWidth = 1;
const minWidth = 0.1;
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

//drawTree(new Vector3(0, 50, 0));
//drawTree(new Vector3(50, 100, 0));

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
    const newPos = currentPosition.clone().add(currentDirection.clone().multiplyScalar(10)); //bigger adjustment
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
    const leafSize = 1; 
    const increment = 9 / numLeaves;
    
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
//after l system

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
const planeGeometry = new THREE.PlaneGeometry(480, 480, 50, 50);

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
const texture = new THREE.TextureLoader().load( "https://threejs.org/examples/textures/terrain/grasslight-big.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 4, 4 );

var terrain_width = 200;
var terrain_height = 200;
var geometry = new THREE.PlaneGeometry(500, 500, terrain_width - 1, terrain_height - 1);
var material = new THREE.MeshLambertMaterial({ color: 0x3c3951 });
material.map = texture;
var terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);


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
    for (let i = 0; i < h; i++) {
        arr[i] = [];
        for (let j = 0; j < w; j++) {
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


    vertices[i + 2] = Math.max(5, peak * Math.abs(perlin.noise(
        (terrain.position.x + vertices[i]) / smoothing,
        (terrain.position.z + vertices[i + 1]) / smoothing
    )) + peak1 * perlin.noise(
        (terrain.position.x + vertices[i]) / smoothing1,
        (terrain.position.z + vertices[i + 1]) / smoothing1
    ) + peak2 * perlin.noise(
        (terrain.position.x + vertices[i]) / smoothing2,
        (terrain.position.z + vertices[i + 1]) / smoothing2
    ) + peak3 * perlin.noise(
        (terrain.position.x + vertices[i]) / smoothing3,
        (terrain.position.z + vertices[i + 1]) / smoothing3
    ));


    
    

    var vertex_num = i / 3;
    var y = Math.floor(vertex_num / terrain_width);
    var x = (vertex_num % (terrain_width));
    height_map[x][y] = vertices[i + 2];

}

var startPercentageX = 0.8
var startPercentageY = 0.05
var endPercentageX = 0.05
var endPercentageY = 0.8
var startX = Math.round((terrain_width - 1) * startPercentageX);
var startY = Math.round((terrain_height - 1) * startPercentageY);
var endX = Math.round((terrain_width - 1) * endPercentageX);
var endY = Math.round((terrain_height - 1) * endPercentageY);
cost_arr[startX][startY] = 0;
var x = startX;
var y = startY;
var count = 0;
//console.log(startX, startY);
//console.log(endX, endY);
while (true) {

    count++;

    //x+1 case
    if (x + 1 < terrain_width && visited[x + 1][y] == 0) {
        if (cost_arr[x][y] + (height_map[x + 1][y] - height_map[x][y]) < cost_arr[x + 1][y]) {
            cost_arr[x + 1][y] = cost_arr[x][y] + (height_map[x + 1][y] - height_map[x][y]);
            pairwiseQueue.push([[x + 1, y], cost_arr[x + 1][y]]);
            origin_map[x + 1][y] = [x, y];
        }
    }
    //x-1 case
    if (x - 1 >= 0 && visited[x - 1][y] == 0) {
        if (cost_arr[x][y] + (height_map[x - 1][y] - height_map[x][y]) < cost_arr[x - 1][y]) {
            cost_arr[x - 1][y] = cost_arr[x][y] + (height_map[x - 1][y] - height_map[x][y]);
            pairwiseQueue.push([[x - 1, y], cost_arr[x - 1][y]]);
            origin_map[x - 1][y] = [x, y];
        }
    }
    //y+1 case
    if (y + 1 < terrain_height && visited[x][y + 1] == 0) {
        if (cost_arr[x][y] + (height_map[x][y + 1] - height_map[x][y]) < cost_arr[x][y + 1]) {
            cost_arr[x][y + 1] = cost_arr[x][y] + (height_map[x][y + 1] - height_map[x][y]);
            pairwiseQueue.push([[x, y + 1], cost_arr[x][y + 1]]);
            origin_map[x][y + 1] = [x, y];
        }
    }
    //y-1 case
    if (y - 1 >= 0 && visited[x][y - 1] == 0) {
        if (cost_arr[x][y] + (height_map[x][y - 1] - height_map[x][y]) < cost_arr[x][y - 1]) {
            cost_arr[x][y - 1] = cost_arr[x][y] + (height_map[x][y - 1] - height_map[x][y]);
            pairwiseQueue.push([[x, y - 1], cost_arr[x][y - 1]]);
            origin_map[x][y - 1] = [x, y];
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
    if (x == endX && y == endY) {
        break;
    }
}
//backtrack to create river
var backtrack_x = endX;
var backtrack_y = endY;
while (true) {
    //console.log(backtrack_x, backtrack_y);
    var origin = origin_map[backtrack_x][backtrack_y];
    //console.log(origin);


    backtrack_x = origin[0];
    backtrack_y = origin[1];
    for (let i = -3; i < 3; i++) {
        for (let j = -3; j < 3; j++) {
            var vertex_index = ((backtrack_y + i) * terrain_width + (backtrack_x + j)) * 3;
            vertices[vertex_index + 2] = -20;
        }


    }
    if (backtrack_x == startX && backtrack_y == startY) {
        //vertices[vertex_index+2] = 200;
        break;
    }



}
//vertices[(40*20+20)*3+2] = 200;
//console.log(vertices.length);


for (let i = 0; i<vertices.length; i+= 3){
    if(vertices[i+2] > 20){
        //console.log("drawing a tree");
        //console.log(vertices[i], vertices[i+1]);
        if(Math.random() > 0.999){
             
            drawTree(new Vector3(vertices[i], vertices[i+2], -vertices[i+1]));
        }
        
    }
}


terrain.geometry.attributes.position.needsUpdate = true;
terrain.geometry.computeVertexNormals();



/* LIGHTING */
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 10);
scene.add(directionalLight);

directionalLight.castShadow = true;
//directionalLight.shadow.camera.bottom = -12;


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
//drawTree(new Vector3(0, 0, 0));

gui.add(options, 'speed', 0, 0.02);

let step = 0;
function animate() {
    step += options.speed;
    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);

