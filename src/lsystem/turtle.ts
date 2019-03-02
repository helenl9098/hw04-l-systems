import {vec3, vec4, mat4, mat3, quat} from 'gl-matrix';
import {gl} from '../globals';

export default class Turtle {
	position: vec3;
	quaternion: quat;
	depth: number;
	up: vec3;
	forward: vec3;
	scale: vec3;

	constructor() {
		// initial values
		let initialRotation: quat = quat.create();
		let initialRotationDegrees: number = Math.PI * 0 / 180.0;
		let initialRotationAxis: vec3 = vec3.fromValues(0, 0, 1);
		quat.setAxisAngle(initialRotation, 
					      initialRotationAxis, 
					      initialRotationDegrees);
    	quat.normalize(initialRotation, initialRotation);

    	let initialPosition: vec3 = vec3.fromValues(0, 0, 0);
    	let initialScale: vec3 = vec3.fromValues(1, 1, 1);
    	let initialDepth: number = 1;
    	let initialUp: vec3 = vec3.fromValues(0, 1, 0);
    	let initialForward: vec3 = vec3.fromValues(0, 1, 0);

		this.position = initialPosition;
		this.quaternion = initialRotation;
		this.depth = initialDepth;
		this.up = initialUp;
		this.forward = initialForward;
		this.scale = initialScale;
	}

	copy(turtle: Turtle)
    {
    	Object.assign(this.position, turtle.position);
    	Object.assign(this.quaternion, turtle.quaternion);
    	Object.assign(this.depth, turtle.depth);
    	Object.assign(this.up, turtle.up);
    	Object.assign(this.forward, turtle.forward);
    	Object.assign(this.scale, turtle.scale);

    }

	rotate(axis: vec3, angle: number) {
		vec3.normalize(axis, axis);

		let q: quat = quat.create();
		let a: number = Math.PI * angle / 180.0;
		quat.setAxisAngle(q, axis, a);
    	quat.normalize(q, q);

    	let tempForward: vec4 = vec4.fromValues(this.forward[0],
    											this.forward[1],
    											this.forward[2], 0);
    	vec4.transformQuat(tempForward, tempForward, q);
    	this.forward = vec3.fromValues(tempForward[0],
    								   tempForward[1],
    								   tempForward[2]);
    	quat.rotationTo(this.quaternion, this.up, this.forward);
    	quat.normalize(this.quaternion, this.quaternion);
	}

	setScale() {
		if (this.scale[0] == 1.0) {
			this.scale[0] == 2.0;
		}
		else {
			this.scale[0] += 2.0;
		}

		if (this.scale[1] == 1.0) {
			this.scale[1] == 2.0;
		}
		else {
			this.scale[1] += 2.0;
		}

		if (this.scale[1] == 1.0) {
			this.scale[1] == 2.0;
		}
		else {
			this.scale[1] += 2.0;
		}
	}

	rotateMat() {
		let result: mat4 = mat4.create();
		return mat4.fromQuat(result, this.quaternion);
	}

	transformationMat(vector: vec3) {
		let rotation: mat4 = mat4.create();
		mat4.fromQuat(rotation, this.quaternion);

		let translation: mat4 = mat4.create();
		mat4.fromTranslation(translation, this.position);

		let scale: mat4 = mat4.create();
		mat4.fromScaling(scale, this.scale);

		var tempVec = vec4.fromValues(vector[0],
    							      vector[1],
    							      vector[2], 1);
		let scaledResult: vec4 = vec4.create();
		vec4.transformMat4(scaledResult, tempVec, scale);
		let rotatedResult: vec4 = vec4.create();
		vec4.transformMat4(rotatedResult, scaledResult, rotation);
		let translatedResult: vec4 = vec4.create();
		vec4.transformMat4(translatedResult, rotatedResult, translation);
		
		console.log(translatedResult[0]);
		console.log(translatedResult[1]);
		console.log(translatedResult[2]);
		return translatedResult;
	}

	moveForward(dist: number) {
		vec3.normalize(this.forward, this.forward);
		let d: vec3 = vec3.fromValues(this.forward[0] * dist,
									  this.forward[1] * dist, 
									  this.forward[2] * dist);
		vec3.add(this.position, this.position, d);
	}

}