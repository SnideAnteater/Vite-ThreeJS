import './style.css'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

class ThreeJs{
  constructor() {
    this._Initialize();
  }

  _Initialize(){
    this.clock = new THREE.Clock;
    //get canvas
    this._canvas = document.querySelector('canvas.webgl')

    //Create Scene and Renderer
    this._scene = new THREE.Scene()
    this._threejs = new THREE.WebGLRenderer({
      alpha: true,
      canvas: this._canvas
    });

    //Add Camera
    // this._camera = new THREE.PerspectiveCamera(80, 250/350)
    // this._camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight)
    this._camera = new THREE.OrthographicCamera( -0.7, 0.7, 1, -1, 0.1, 1000 );
    this._camera.position.set(0,0.5,1);
    this._scene.add(this._camera)

    //set Renderer Size
    // this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._threejs.setSize(250, 350);

    //CODES TO ADD IN LIGHT

    //create light variable
    let light = null;

    // light = new THREE.AmbientLight(0xFFFFFF);
    // light.position.set(0,0,0)
    // light.intensity = 0.3;
    // this._scene.add(light);

    // light = new THREE.PointLight(0xFAADFF);
    // light.position.set(-97.223, -99.560, 144.446);
    // light.intensity = 0.1;
    // this._scene.add(light);

    // light = new THREE.PointLight(0xF1B7FF);
    // light.position.set(1126.105, 343.326, 106.287);
    // light.intensity = 0.5;
    // this._scene.add(light);

    // light = new THREE.PointLight(0xDEE9FF);
    // light.position.set(-368.682, 106.122, 338.934);
    // light.intensity = 0.6;
    // this._scene.add(light);

    // light = new THREE.DirectionalLight(0xFFB2F8);
    // light.position.set(341.216, -90.017, 434.576);
    // light.intensity = 0.1;
    // this._scene.add(light);

    //SPOTLIGHT
    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 100, 1000, 100 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    this._scene.add( spotLight );

    //POINT LIGHT
    light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.set( 50, 50, 50 );
    this._scene.add( light );

    //HEMISPHERE LIGHT
    light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    this._scene.add( light );

    //End Light code section

    //When window is resized Resize the renderer
    window.addEventListener('resize', () => {
      // this._OnWindowResize();
    }, false)

    //Declare animation mixer for multiple animations
    this._mixers = [];
    this._previousRAF = null;
    this._circle = null;


    //Load Model and animation File in FBX Format
    this._LoadModelFbx();


    //Update every Frame
    this._RAF()
  }

  _LoadinCircle(){
    let geometry = new THREE.CircleGeometry( 0.3, 32 );
    let material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    this._circle = new THREE.Mesh( geometry, material );
    this._circle.position.set(0,0.15,0)
    this._circle.scale.set(0,0,0)
    this._scene.add( this._circle );

  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => {
        this._mixers.map(m => m.update(timeElapsedS));
      });
    }
    if(this._circle){
      var t = this.clock.getElapsedTime()
      if (t <= 0.5 && t >= 0.3)
      {
        this._circle.scale.x = 0+(t/0.45);
        this._circle.scale.y = 0+(t/0.45);
        this._circle.scale.z = 0+(t/0.45); 
        // console.log(this._circle.scale)
      }
    }
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }
      this._RAF();
      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _LoadModelFbx(){
    let loader = new FBXLoader();
    loader.load('/fbxmodel/Sparky_Widget_V30.fbx', (fbx) => {
    // loader.load('/fbxmodel/anim1.fbx', (fbx) => {
      console.log(fbx)
      fbx.position.set(0,0,0)
      fbx.scale.set(0.005,0.005,0.005)
      fbx.traverse(c => {
        c.castShadow = true;
      });
      loader.load('/fbxmodel/Sparky_Widget_V30.fbx', (firstAnim) => {
      // loader.load('/fbxmodel/anim1.fbx', (firstAnim) => {  
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        this._firstAnimation = m.clipAction(firstAnim.animations[1]);
        this._PlayAnimations();
        // idle.play();
        // loader.load('/fbxmodel/anim2.fbx', (secondAnim) => {
        //   this._secondAnimation = m.clipAction(secondAnim.animations[0]);
        //   // idle.play();
        //   this._PlayAnimations();
        // });
      });

      this._scene.add(fbx);
      this._LoadinCircle();
    });
  }

  _PlayAnimations(){
    this._firstAnimation.clampWhenFinished = true;
    this._firstAnimation.timeScale = 1;
    this._firstAnimation.setLoop(THREE.LoopOnce, 1);
    this._firstAnimation.play()
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new ThreeJs();
});
