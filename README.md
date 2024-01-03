# FINAL-HackTheRay

## Our Realtime 3D Landscape using Three.js

### Trees 
- Used a Lindenmayer system to simulate natural branching of trees at various degrees of complexity
- Tree's branches become progressively thinner with each branching
- Referenced https://www.researchgate.net/profile/Noppadon-Khiripet/publication/268380530_Real-time_3D_Plant_Structure_Modeling_by_L-System_with_Actual_Measurement_Parameters/links/551b9d030cf2fdce8438a1bd/Real-time-3D-Plant-Structure-Modeling-by-L-System-with-Actual-Measurement-Parameters.pdf

### Terrain
- Procedurally generated using Perlin noise
- Used a modified dijkstra’s algorithm for depressions in ground for rivers

### Water 
- Base water shader is based on https://29a.ch/slides/2012/webglwater/#slide-53 and https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Water.js 
- Implements a water shader with waves created from normal maps.
- The normal map is sampled using time-dependent noise algorithm from 29a.ch to create moving waves
- The geometry of the water is modified in the y dimension using a scrolling height map
- The other aspects of the shader like reflections & refraction are taken from the three.js water shader

