uniform mat4 textureMatrix;
				uniform float time;
				uniform sampler2D displacementSampler;
				

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					vec4 myPosInit = projectionMatrix * mvPosition + 4.0 * vec4(0,texture2D(displacementSampler, worldPosition.xz/25.0 + vec2(0.1 * time, 0))[2],0,0);
					gl_Position = myPosInit;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}