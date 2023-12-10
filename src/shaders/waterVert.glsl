layout(location = 1) in vec3 normal3dObj;

out vec3 worldPos;
out vec3 worldNorm;


uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;


void main() {
    worldNorm = mat3(inverse(transpose(model))) * normalize(normal3dObj);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
