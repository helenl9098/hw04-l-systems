#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
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

void main() {
  vec2 coords = fs_Pos;
  coords.x += (u_Time / 100.0);
  float colorValue = fbm(vec2(fbm(vec2(fbm(coords)))));
  vec3 blue = vec3(0, 147, 145) / 255.;
  vec3 purple = vec3(255, 255, 255) / 255.;
  vec3 color = mix(purple, blue, colorValue);

  out_Col = vec4(color, 1.0);
}
