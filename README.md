# FINAL-HackTheRay

## Our Realtime 3D Landscape using Three.js

https://github.com/wesleyh2/FINAL-HackTheRay/assets/91110327/84a38e08-12e4-4503-b9b5-106d39a7b6c1

### Trees 
- Used a Lindenmayer system to simulate natural branching of trees at various degrees of complexity
- Tree's branches become progressively thinner with each branching

https://github.com/wesleyh2/FINAL-HackTheRay/assets/91110327/93c3b6f0-0992-4181-855c-5ec1fcb278fa

### Terrain
- Procedurally generated using Perlin noise
- Used a modified dijkstra’s algorithm for depressions in ground for rivers

https://github.com/wesleyh2/FINAL-HackTheRay/assets/91110327/9f0bd450-d09a-4268-98bd-bd48672330bc

### Water 
- Base water shader is based on https://29a.ch/slides/2012/webglwater/#slide-53 and https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Water.js 
- Implements a water shader with waves created from normal maps.
- The normal map is sampled using time-dependent noise algorithm from 29a.ch to create moving waves
- The geometry of the water is modified in the y dimension using a scrolling height map
- The other aspects of the shader like reflections & refraction are taken from the three.js water shader

https://github.com/wesleyh2/FINAL-HackTheRay/assets/91110327/18b48df0-4ed2-417f-a144-291201fb6dcb



