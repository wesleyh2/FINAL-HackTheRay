// #version 330 core
//     in vec3 worldPos;
// in vec3 worldNorm;

// uniform vec3 lightDir[8];
// uniform vec3 lightColor[8];
// uniform vec3 lightPos[8];
// uniform vec3 lightFunc[8];
// uniform int lightType[8];
// uniform float innerTheta[8];
// uniform float outerTheta[8];


// uniform float lightNum;
// uniform vec3 materialAm;
// uniform vec3 materialDif;
// uniform vec3 materialSpec;


// out vec4 fragColor;
// uniform float ka;
// uniform float kd;
// uniform vec4 camPos;
// uniform float ks;
// uniform float shine;

void main() {
    //     vec3 normal = normalize(worldNorm);
    //     float red = ka * materialAm[0];
    //     float green = ka * materialAm[1];
    //     float blue = ka * materialAm[2];

    //     for (int i = 0; i < lightNum; i++) {
    //         switch (lightType[i]) {
    //             case 0: {
    //             vec3 lightDir1 = normalize(lightPos[i] - worldPos);
    //             vec3 camDir = normalize(vec3(camPos) - worldPos);
    //             float specDot = dot(normalize(reflect(-lightDir1, normal)), camDir);
    //             float diffDot = dot(normal, lightDir1);

    //             float distance = distance(lightPos[i], worldPos);
    //             float att = min(1, 1 / (lightFunc[i][0] +
    //                 distance * lightFunc[i][1] +
    //                 pow(distance, 2) * lightFunc[i][2]));

    //             float specThing;
    //                 if (shine == 0) {
    //                     specThing = 0;
    //                 } else {
    //                     specThing = pow(min(max(specDot, 0), 1), shine);
    //                 }

    //                 red += att * lightColor[i][0] * (kd * materialDif[0] * min(max(diffDot, 0), 1)
    //                     + ks * materialSpec[0] * specThing);
    //                 green += att * lightColor[i][1] * (kd * materialDif[1] * min(max(diffDot, 0), 1)
    //                     + ks * materialSpec[1] * specThing);
    //                 blue += att * lightColor[i][2] * (kd * materialDif[2] * min(max(diffDot, 0), 1)
    //                     + ks * materialSpec[2] * specThing);
    //                 break;
    //             }

    //             case 1: {
    //             vec3 lightDir1 = normalize(-lightDir[i]);
    //             vec3 camDir = normalize(vec3(camPos) - worldPos);
    //             float specDot = dot(normalize(reflect(-lightDir1, normal)), camDir);
    //             float diffDot = dot(normal, lightDir1);
    //             float specThing;
    //                 if (shine == 0) {
    //                     specThing = 0;
    //                 } else {
    //                     specThing = pow(min(max(specDot, 0), 1), shine);
    //                 }
    //                 red += lightColor[i][0] * (kd * materialDif[0] * min(max(diffDot, 0), 1)
    //                     + ks * materialSpec[0] * specThing);
    //                 green += lightColor[i][1] * (kd * materialDif[1] * min(max(diffDot, 0), 1)
    //                     + ks * materialSpec[1] * specThing);
    //                 blue += lightColor[i][2] * (kd * materialDif[2] * min(max(diffDot, 0), 1)
    //                     + ks * materialSpec[2] * specThing);
    //                 break;
    //             }
    //             case 2: {
    //             vec3 lightDir1 = normalize(lightPos[i] - worldPos);
    //             vec3 camDir = normalize(vec3(camPos) - worldPos);
    //             float specDot = dot(normalize(reflect(-lightDir1, normal)), camDir);
    //             float diffDot = dot(normal, lightDir1);

    //             float distance = distance(lightPos[i], worldPos);
    //             float att = min(1, 1 / (lightFunc[i][0] +
    //                 distance * lightFunc[i][1] +
    //                 pow(distance, 2) * lightFunc[i][2]));
    //             float currentAngle = acos(dot(normalize(lightDir[i]), -lightDir1));

    //             float specThing;
    //                 if (shine == 0) {
    //                     specThing = 0;
    //                 } else {
    //                     specThing = pow(min(max(specDot, 0), 1), shine);
    //                 }

    //                 if (currentAngle <= innerTheta[i]) {
    //                     red += att * lightColor[i][0] * (kd * materialDif[0] * min(max(diffDot, 0), 1)
    //                         + ks * materialSpec[0] * specThing);
    //                     green += att * lightColor[i][1] * (kd * materialDif[1] * min(max(diffDot, 0), 1)
    //                         + ks * materialSpec[1] * specThing);
    //                     blue += att * lightColor[i][2] * (kd * materialDif[2] * min(max(diffDot, 0), 1)
    //                         + ks * materialSpec[2] * specThing);
    //                 } else {
    //                     if (currentAngle <= outerTheta[i]) {
    //                     float falloff = (-2) *
    //                             pow((currentAngle - innerTheta[i]) / (outerTheta[i] - innerTheta[i]), 3) +
    //                             3 * pow((currentAngle - innerTheta[i]) / (outerTheta[i] - innerTheta[i]), 2);
    //                         red += (1.0f - falloff) * (att * lightColor[i][0] * (kd * materialDif[0] * min(max(diffDot, 0), 1)
    //                             + ks * materialSpec[0] * specThing));
    //                         green += (1.0f - falloff) * (att * lightColor[i][1] * (kd * materialDif[1] * min(max(diffDot, 0), 1)
    //                             + ks * materialSpec[1] * specThing));
    //                         blue += (1.0f - falloff) * (att * lightColor[i][2] * (kd * materialDif[2] * min(max(diffDot, 0), 1)
    //                             + ks * materialSpec[2] * specThing));

    //                     }
    //                 }

    //         default:
    //                 break;
    //         }
    //     }
    // }


    // fragColor = vec4(min(max(red, 0), 1), max(min(green, 1), 0), max(min(blue, 1), 0), 1);
    gl_FragColor = vec4(1);
}
