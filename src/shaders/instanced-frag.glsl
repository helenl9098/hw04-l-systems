#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 seed = vec2(0, 0);

    float a = random1(i, seed);
    float b = random1(i + vec2(1.0, 0.0), seed);
    float c = random1(i + vec2(0.0, 1.0), seed);
    float d = random1(i + vec2(1.0, 1.0), seed);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x)  +
            (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    
    // Loop of octaves
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p);
        p *= 2.;
        amplitude *= .5;
    }

    return value;
}

void main()
{
 
    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(vec4(0.0, 1.0, 5.0, 0.0)));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.4;

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    vec3 diffuseColor = vec3(0.0);
    if (fs_Col.y < 0.5) {
        // Compute final shaded color
        diffuseColor = vec3(fs_Col) * lightIntensity * fbm(vec2(fs_Pos));
   
    }
    else {
        vec3 leavesColor =  vec3(48, 137, 9)/ 255.;
        vec3 yellowleaves = vec3(124, 120, 68) / 255.;
        vec3 color = mix(leavesColor, yellowleaves, (fbm(vec2(fs_Pos * 7.0))) + 0.3);
        diffuseColor = color * (lightIntensity + 0.4);
    }
    out_Col = vec4(diffuseColor, 1.0);
}
