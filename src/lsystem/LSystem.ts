import Turtle from './turtle.ts'
import {vec3, vec4, mat4, mat3, quat} from 'gl-matrix';

export class CharacterNode {
	str: string = ""; 
	next: CharacterNode = null;

	constructor(val: string) {
		this.str = val;
	}
}

export function stringToNode(str: string) {
	var head = new CharacterNode(str.charAt(0));
	var previous = head;
	for (var i = 1; i < str.length; i++) {
		var newNode = new CharacterNode(str.charAt(i));
		previous.next = newNode;
		previous = newNode;
	}
	return head;
}

// prints out entire string from head node
export function nodeToString(head: CharacterNode) {
	var current = head;
	while (current.next != null) {
		console.log(current.str);
		current = current.next;
	}
	console.log(current.str);
}

export function rng(x: vec3) {
  	let n: number = x[0] * 137 + x[1] * 122237 + x[2] * 13;
 	var result = Math.abs(Math.sin(n) * 43758.5453123) - Math.floor(Math.abs(Math.sin(n) * 43758.5453123));
 	x[0] ++;
 	return result;
}

export class ExpansionRule {
	expansionString: string;
	prob: number[];
	str: string[];

	constructor(prob: number[], str: string[]) {
		this.expansionString = str[0];
		this.prob = prob;
		this.str = str;
	}

	getExpansion(rand: number) {
		var randomNum = rand;
		let cumulative: number = 0;
		if (this.prob[0] != 1.0) {
			for (var i = 0; i < this.prob.length; i++) {
				if (cumulative < 1.0) {
					cumulative += this.prob[i] + 0.00001;
					if (randomNum < cumulative) {
						this.expansionString = this.str[i];
						break;
					}
				}
				else {
					this.expansionString = this.str[i];
				}
			}
		}
	}
}

export class DrawRule {
	probability: number; 
	drawFunction: any;

	constructor(prob: number, t: any) {
		this.probability = prob;
		this.drawFunction = t;
	}
}

export default class LSystem {
	axiom: string; 
	grammar: Map<string, ExpansionRule[]> = new Map();
	drawRules : Map<string, any> = new Map();
	iterations: number = 0;
	axiomHeadNode: CharacterNode;

	turtleStack: Turtle[] = new Array();
	leafStack: Turtle[] = new Array();
	currentTurtle: Turtle;
	lastTurtleState: Turtle[] = new Array();

	seed: vec3;
	thickness: number;
	leavesAngle: number;

	tempDepth = 1.0;

	constructor(axiom: string, iterations: number, thickness: number, seed: number, angle: number)  {
		this.axiom = axiom;
		this.iterations = iterations;
		this.thickness = thickness;
		this.seed = vec3.fromValues(seed, 0, 0);
		this.leavesAngle = angle;


		this.grammar.set('F', [new ExpansionRule([0.9, 0.1], ['FF', 'F'])]);
		this.grammar.set('X', [new ExpansionRule([0.40, 0.2, 0.1, 0.3], ['a[-FX][+FX][-FX][+FX]b', 
																		 'a[-FX][+FX]b',
																		 'a[-FX][+FX][-FX][+FX][+FX][-FX]b',
																		 'a[-FX][+FX][-FX]b'])]);

		this.axiomHeadNode = this.expansion();

		// starting turtle
		this.currentTurtle = new Turtle();
		let firstTurtle: Turtle = new Turtle();
		let base: Turtle = new Turtle();
		this.currentTurtle.moveForward(-20.0);
		this.currentTurtle.scale = vec3.fromValues(15.0, 2.0, 15.0);
		base.copy(this.currentTurtle);
		this.turtleStack.push(base);

		this.currentTurtle.moveForward(2.0);
		this.currentTurtle.scale = vec3.fromValues(2.0, 1.0, 2.0);
		firstTurtle.copy(this.currentTurtle);
		this.turtleStack.push(firstTurtle);



	    this.makeStack();

	}

	makeStack() {
		var currentNode = this.axiomHeadNode;
		var currentWidth = 1.0;
		while (currentNode != null) {

			var currentCharacter = currentNode.str;
			var randomNum = rng(this.seed);

			if (this.currentTurtle.forward[1] < 0.0) {
				this.currentTurtle.forward[1] = 0.0;
			}

			if (currentCharacter == 'F') {
				
				this.currentTurtle.scale = vec3.fromValues(this.currentTurtle.scale[0] / (1.0 + this.tempDepth / this.thickness),
													       this.currentTurtle.scale[1], 
													       this.currentTurtle.scale[2] / (1.0 + this.tempDepth / this.thickness));
				
				
				var randomAngle = rng(this.seed) * 2;
				var randomAngle1 = rng(this.seed) * 7;
				var randNumber = rng(this.seed);
				if (randomNum > 0.5) {
					this.currentTurtle.rotate(vec3.fromValues(0, 0, 1), 7);
					if (randNumber > 0.5) {
						this.currentTurtle.rotate(vec3.fromValues(1, 0, 0), randomAngle);
					}
					else {
						this.currentTurtle.rotate(vec3.fromValues(1, 0, 0), -randomAngle);
					}
				} else {
					this.currentTurtle.rotate(vec3.fromValues(0, 0, 1), -7);
					if (randNumber > 0.5) {
						this.currentTurtle.rotate(vec3.fromValues(1, 0, 0), randomAngle);
					}
					else {
						this.currentTurtle.rotate(vec3.fromValues(1, 0, 0), -randomAngle);
					}
				}
				this.currentTurtle.moveForward(1.0);
				let newT: Turtle = new Turtle();
				newT.copy(this.currentTurtle);
				this.turtleStack.push(newT);
				
			}
			else if (currentCharacter == 'a') {
				this.tempDepth ++;
			}
			else if (currentCharacter == 'b') {
				this.tempDepth --;
			}
			else if (currentCharacter == 'X' && this.tempDepth == this.iterations) {
				if (randomNum < 0.5) {
					let newT: Turtle = new Turtle();
					newT.copy(this.currentTurtle);
					newT.scale = vec3.fromValues(0.1, 0.1, 0.1);
					newT.rotate(vec3.fromValues(0, 0, 1), randomNum * this.leavesAngle);
					this.leafStack.push(newT);
				}
			}
			else if (currentCharacter == '+') {
				if (this.currentTurtle.scale[0] < 0.3) {
					this.currentTurtle.moveForward(this.currentTurtle.scale[0]);
				}
				this.currentTurtle.moveForward(1.0);
				this.currentTurtle.forward = vec3.fromValues(0, 1, 0);
				var randomA = rng(this.seed) * 30 + 40;
				var randomB = rng(this.seed) * 30 + 10;

				var random1 = rng(this.seed);
				var random2 = rng(this.seed);


				if (random1 > 0.5) {
					randomA *= -1;
				}
				if (random2 > 0.5) {
					randomB *= -1;
				}
				this.currentTurtle.rotate(vec3.fromValues(1, 0, 0), randomA);
				this.currentTurtle.rotate(vec3.fromValues(0, 1, 0), randomB);
				this.currentTurtle.moveForward(this.currentTurtle.scale[0]);
				let newT: Turtle = new Turtle();
				newT.copy(this.currentTurtle);
				this.turtleStack.push(newT);
			}
			else if (currentCharacter == '-') {
				if (this.currentTurtle.scale[0] < 0.3) {
					this.currentTurtle.moveForward(this.currentTurtle.scale[0]);
				}
				this.currentTurtle.moveForward(1.0);
				this.currentTurtle.forward = vec3.fromValues(0, 1, 0);
				var randomA = rng(this.seed) * 30 + 40;
				var randomB = rng(this.seed) * 30 + 10;

				var random1 = rng(this.seed);
				var random2 = rng(this.seed);


				if (random1 > 0.5) {
					randomA *= -1;
				}
				if (random2 > 0.5) {
					randomB *= -1;
				}
				this.currentTurtle.rotate(vec3.fromValues(0, 0, 1), randomA);
				this.currentTurtle.rotate(vec3.fromValues(0, 1, 0), randomB);
				this.currentTurtle.moveForward(this.currentTurtle.scale[0]);
				let newT: Turtle = new Turtle();
				newT.copy(this.currentTurtle);
				this.turtleStack.push(newT);
			}
			else if (currentCharacter == '[') {
				this.currentTurtle.depth += 0.1;
				let newT: Turtle = new Turtle();
				newT.copy(this.currentTurtle);
				this.lastTurtleState.push(newT);
			}
			else if (currentCharacter == ']') {
				currentWidth --;
				this.currentTurtle.depth -= 0.1;
				let newT: Turtle = new Turtle();
				newT.copy(this.lastTurtleState.pop());
				this.currentTurtle = newT;
			}

			currentNode = currentNode.next;
		}
	}

	expansion() {
		var currentIteration = 0; 
		var axiomHeadNode = stringToNode(this.axiom);

		for (var i = 1; i < this.iterations; i++) {
			var startOfCurrentIteration = null;
			var endOfLastExpansion = null;
			var currentNode = axiomHeadNode;
			while (currentNode != null) {
				var character = currentNode.str;
				let rules = this.grammar.get(character);
				if (rules) {
					for (var j = 0; j < rules.length; j++) {
						var randomNum = rng(this.seed);
						rules[j].getExpansion(randomNum);
						var grammarExpansionString = rules[j].expansionString;
						var headOfExpandedAxiom = stringToNode(grammarExpansionString);
						

						if (endOfLastExpansion == null) {
							startOfCurrentIteration = headOfExpandedAxiom;
						}
						else {
							endOfLastExpansion.next = headOfExpandedAxiom;
						}

						// find and store tail
						var tailNode = headOfExpandedAxiom;
						while (tailNode.next != null) {
							tailNode = tailNode.next;
						}
						endOfLastExpansion = tailNode;

					}
				}
				else {
					var headOfExpandedAxiom = stringToNode(character);
						
					endOfLastExpansion.next = headOfExpandedAxiom;
					endOfLastExpansion = headOfExpandedAxiom;
				}
				currentNode = currentNode.next;
			}
			axiomHeadNode = startOfCurrentIteration;
		}

		return axiomHeadNode;
	}



}
