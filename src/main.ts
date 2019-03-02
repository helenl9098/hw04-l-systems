import {vec3, vec4, mat4, mat3, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Turtle from './lsystem/turtle.ts'
import LSystem from './lsystem/LSystem.ts'
import {readTextFile} from './globals';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  thickness: 30,
  leavesAngle: 5,
  seed: 14.4,
};

let square: Square;
let screenQuad: ScreenQuad;
let mesh: Mesh;
let leafMesh: Mesh;
let time: number = 0.0;

function loadVariables(mesh: Mesh, stack: Turtle[], color: number[]) {
  let offsetsArray = [];
  let scaleArray = [];
  let rotationArray = [];
  let colorsArray = [];
  let n: number = stack.length;
  for(let i = 0; i < n; i++) {
      
      var currentTurtle = stack[i];

      var tPosition = currentTurtle.position;
      offsetsArray.push(tPosition[0]);
      offsetsArray.push(tPosition[1]);
      offsetsArray.push(tPosition[2]);

      var tScale = currentTurtle.scale;
      scaleArray.push(tScale[0]);
      scaleArray.push(tScale[1]);
      scaleArray.push(tScale[2]);


      let tRotationAxis: vec3 = vec3.create();
      let tRotationAngle: number = quat.getAxisAngle(tRotationAxis,
                                            currentTurtle.quaternion);
      rotationArray.push(tRotationAxis[0]);
      rotationArray.push(tRotationAxis[1]);
      rotationArray.push(tRotationAxis[2]);
      rotationArray.push(tRotationAngle);

      colorsArray.push(color[0] / 255.);
      colorsArray.push(color[1] / 255.);
      colorsArray.push(color[2] / 255.);
      colorsArray.push(1.0); // Alpha channel
    
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let rotations: Float32Array = new Float32Array(rotationArray);
  let scales: Float32Array = new Float32Array(scaleArray);
  mesh.setInstanceVBOs(offsets, colors, rotations, scales);
  mesh.setNumInstances(n); // grid of "particles"
}

function loadScene() {

  let lsystem: LSystem = new LSystem("FX", 6, controls.thickness, controls.seed, controls.leavesAngle);

  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  let obj0: string = readTextFile('https://raw.githubusercontent.com/helenl9098/hw04-l-systems/blob/master/resources/obj/cylinder.obj');
  mesh = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  mesh.create();

  let obj1: string = readTextFile('https://raw.githubusercontent.com/helenl9098/hw04-l-systems/blob/master/resources/obj/leaf.obj');
  leafMesh = new Mesh(obj1, vec3.fromValues(0, 0, 0));
  leafMesh.create();

  loadVariables(mesh, lsystem.turtleStack, [119, 91, 70]);
  loadVariables(leafMesh, lsystem.leafStack, [0, 255, 0]);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  var guiT = gui.add(controls, 'thickness', 25, 50);
  var guiC = gui.add(controls, 'leavesAngle', 0, 30);
  var guiS = gui.add(controls, 'seed', 0, 25);

  guiT.onChange(function(value: number) {
    loadScene();
  });

  guiC.onChange(function(value: number) {
    loadScene();
  });

  guiS.onChange(function(value: number) {
    loadScene();
  });
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0));
 
  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      mesh, leafMesh
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
