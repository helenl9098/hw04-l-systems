#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Rotate; // Another instance rendering attribute used to position each quad instance in the scene
in vec3 vs_Scale; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;


// based from http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToMatrix/
mat4 matrixFromAxisAngle() {
	vec3 axis = vec3(vs_Rotate);
	float angle = vs_Rotate.w;
	
	float c = cos(angle);
	float s = sin(angle);
	float t = 1.0 - c;

	axis = normalize(axis);

	float m00 = c + axis.x * axis.x * t;
	float m11 = c + axis.y * axis.y * t;
	float m22 = c + axis.z * axis.z * t;

	float tmp1 = axis.x * axis.y * t;
	float tmp2 = axis.z * s;
	float m10 = tmp1 + tmp2;
    float m01 = tmp1 - tmp2;
    tmp1 = axis.x*axis.z*t;
    tmp2 = axis.y*s;
    float m20 = tmp1 - tmp2;
    float m02 = tmp1 + tmp2;    
    tmp1 = axis.y*axis.z*t;
    tmp2 = axis.x*s;
    float m21 = tmp1 + tmp2;
    float m12 = tmp1 - tmp2;


	return mat4(vec4(m00, m10, m20, 0.0),
		        vec4(m01, m11, m21, 0.0), 
		        vec4(m02, m12, m22, 0.0), 
		        vec4(0.0, 0.0, 0.0, 1.0));
}

mat4 scale() {
	return mat4(vec4(vs_Scale[0], 0, 0, 0.0),
		        vec4(0, vs_Scale[1], 0, 0.0), 
		        vec4(0, 0, vs_Scale[2], 0.0), 
		        vec4(0.0, 0.0, 0.0, 1.0));
}


void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;

    mat4 matrix = matrixFromAxisAngle();

    gl_Position = u_ViewProj * (matrix * scale() * fs_Pos + vec4(vs_Translate, 0.0));
}
