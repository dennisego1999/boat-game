import * as THREE from 'three';
import isMobile from 'ismobilejs';
import ParticleSystemData from '@/assets/js/particle-system/particle-system.json';
import {getChildren} from '@/assets/js/util/gltfHelpers';
import {Sky} from 'three/examples/jsm/objects/Sky';
import {Water} from 'three/examples/jsm/objects/Water';
import {PointerLockControls} from '@/assets/js/util/PointerLockControls';
import {PointerLockControlsMobile} from '@/assets/js/util/PointerLockControlsMobile';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import System, {Rate, Span, SpriteRenderer} from 'three-nebula';
import {ref} from 'vue';
import {AxesHelper, Box3Helper, BoxHelper, MathUtils, Object3D} from 'three';

export default class GameScene {

    constructor(gameIsWon, amountOfBoxesRecovered, totalAmountOfLostBoxes) {

        //Set variables
        this.direction = 'forward';
        this.isLoaded = ref(false);
        this.fps = 1000 / 30;
        this.then = null;
        this.scene = null;
        this.camera = null;
        this.cameraObject = null;
        this.renderer = null;
        this.controls = null;
        this.flash = null;
        this.water = null;
        this.sun = null;
        this.sky = null;
        this.boat = null;
        this.box = null;
        this.floatingBoxes = [];
        this.gameIsWon = gameIsWon;
        this.amountOfBoxesRecovered = amountOfBoxesRecovered;
        this.totalAmountOfLostBoxes = totalAmountOfLostBoxes;
        this.isMoving = false;
        this.particleSystem = null;
        this.emitterRenderer = null;
        this.keysPressed = [];
        this.canvas = document.querySelector('#three-js-container > canvas');
        this.isIpad = (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) || (isMobile(navigator.userAgent).apple.tablet);
        this.isPhone = isMobile(navigator.userAgent).phone;
        this.isTablet = isMobile(navigator.userAgent).tablet;
        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.spriteRenderer = null;
        this.highRate = new Rate(new Span(2, 6), new Span(0.05, 0.009));
        this.normalRate = new Rate(new Span(1, 5), new Span(0.5, 0.02));
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
        this.clock = new THREE.Clock();
        this.sunParameters = {
            elevation: 1.5,
            azimuth: -160,
        };
        this.waves = {
            A: { direction: 0, steepness: 0.025, wavelength: 60 },
            B: { direction: 30, steepness: 0.03, wavelength: 30 },
            C: { direction: 60, steepness: 0.01, wavelength: 15 },
        };
        this.currentSpeed = {
            velocity: 0,
            rotation: 0,
        };
        this.targetSpeed = {
            velocity: 0,
            rotation: 0,
        };
        this.boatMovementController = {
            'z': {
                pressed: false,
                func: () => this.targetSpeed.velocity = 0.2
            },
            'ArrowUp': {
                pressed: false,
                func: () => this.targetSpeed.velocity = 0.2
            },
            's': {
                pressed: false,
                func: () => this.targetSpeed.velocity = -0.2
            },
            'ArrowDown': {
                pressed: false,
                func: () => this.targetSpeed.velocity = -0.2
            },
            'q': {
                pressed: false,
                func: () => this.direction === 'forward' ? this.targetSpeed.rotation = 0.003 : this.targetSpeed.rotation = -0.003
            },
            'ArrowLeft': {
                pressed: false,
                func: () => this.direction === 'forward' ? this.targetSpeed.rotation = 0.003 : this.targetSpeed.rotation = -0.003
            },
            'd': {
                pressed: false,
                func: () => this.direction === 'forward' ? this.targetSpeed.rotation = -0.003 : this.targetSpeed.rotation = 0.003
            },
            'ArrowRight': {
                pressed: false,
                func: () => this.direction === 'forward' ? this.targetSpeed.rotation = -0.003 : this.targetSpeed.rotation = 0.003
            },

        };

        //Setup scene
        this.setupScene();

    }

    loadModels() {

        //Set loader 1
        const loader1 = new Promise((resolve, reject) => {

            // Load the boat
            this.gltfLoader.load(
                '/js/models/boat/boat.gltf',
                (gltf) => {

                    //Resolve
                    resolve(gltf);

                },
                () => {},
                (error) => reject(error),
            );

        });

        //Set loader 2
        const loader2 = new Promise((resolve, reject) => {

            // Load the boat
            this.gltfLoader.load(
                '/js/models/box/box.gltf',
                (gltf) => {

                    //Resolve
                    resolve(gltf);

                },
                () => {},
                (error) => reject(error),
            );

        });

        return Promise.all([loader1, loader2]).then(values => {

            //Set boat variable
            this.boat = getChildren(values[0].scene,['Sketchfab_model'],'exact')[0].children[0];
            this.boat.scale.set(0.04, 0.04, 0.04);
            this.boat.children[0].position.y = 10;
            this.boat.rotation.y = Math.PI;

            //Add the boat to the scene
            this.scene.add(this.boat);

            //Set box variable
            this.box = getChildren(values[1].scene,['Sketchfab_model'],'exact')[0].children[0];
            this.box.scale.set(0.02, 0.02, 0.02);

            //Generate x amount of randomly places floating boxes
            this.generateRandomlyPlacedBoxes();

            //Set load state
            this.isLoaded.value = true;

        });

    }

    async setupScene() {

        //Setup scene
        this.scene = new THREE.Scene();

        //Load models
        await this.loadModels();

        //Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            canvas: this.canvas,
            alpha: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        //Set size & aspect ratio
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        //Setup camera
        this.setupCamera();

        //Setup scene objects
        this.setupSceneObjects();

        //Setup controls
        if (isMobile(navigator.userAgent).phone) {
            this.controls = new PointerLockControlsMobile(this.camera, document.body);
        } else {
            this.controls = new PointerLockControls(this.camera, document.body);
            this.controls.lock();
        }

        //Start render loop
        this.animate.call(this, performance.now());

    }

    animate() {

        //Animate request frame loop
        const now = Date.now();
        const delta = now - this.then;

        if (delta > this.fps) {

            this.then = now - (delta % this.fps);

            //Render the frame
            this.render();

        }

        //Request a new frame
        this.animateFrameId = requestAnimationFrame(this.animate.bind(this));

    }

    render() {

        const isDesktop = !this.isPhone && !this.isTablet && !this.isIpad;
        const hasReachedLimits = this.controls.targetMovement >= 1 || this.controls.targetMovement <= -1;

        if ((isDesktop && (hasReachedLimits || !this.controls.press) || (!isDesktop && (hasReachedLimits || !this.controls.previousTouch)))) {

            //Set target to 0 when user stops dragging and limit between 1 and -1
            this.controls.targetMovement = {
                x: 0,
                y: 0,
            };

        }

        //Lerp to target euler
        this.controls.currentMovement.x = this.lerp(this.controls.currentMovement.x, this.controls.targetMovement.x, 0.1);
        this.controls.currentMovement.y = this.lerp(this.controls.currentMovement.y, this.controls.targetMovement.y, 0.1);

        //Set camera
        this.controls.updateCamera();

        //Offset water
        this.water.material.uniforms[ 'time' ].value -= 1.0 / 60.0;

        //Update boat
        this.updateBoatAndLostBoxes();

        //Update the camera parent objects rotation and position
        this.cameraObject.position.set(this.boat.position.x, this.boat.position.y, this.boat.position.z);
        this.cameraObject.rotation.set(this.boat.rotation.x, this.boat.rotation.y + Math.PI, this.boat.rotation.z);

        //Render
        this.renderer.render(this.scene, this.camera);

    }

    lerp(value1, value2, amount) {

        //Set amount
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;

        return value1 + (value2 - value1) * amount;
    }

    isColliding(obj1, obj2) {

        //Set factor => distance from center of boat
        const factor = 14;

        return  Math.abs(obj1.position.x - obj2.position.x) < factor &&  Math.abs(obj1.position.z - obj2.position.z) < factor;
    }

    setupCamera() {

        //Set perspective camera
        this.camera = new THREE.PerspectiveCamera(70, this.canvas.offsetWidth / this.canvas.offsetHeight, 0.1, 800);
        this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
        this.camera.updateProjectionMatrix();

        //Setup camera
        this.camera.position.set(0, 10, 32);

        //Add camera to camera object
        this.cameraObject = new Object3D();
        this.cameraObject.add(this.camera);

        //Ad to scene
        this.scene.add(this.cameraObject);

    }

    setupSceneObjects() {

        //Create smoke emitter
        this.createSmokeEmitter();

        //Add water
        const waterGeometry = new THREE.PlaneGeometry( 8192, 8192, 512, 512 );
        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( 'textures/water/water_normals.jpeg', ( texture ) => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );
        this.water.rotation.x = - Math.PI / 2;

        //Create waves
        this.water.material.onBeforeCompile = ( shader ) => {

            shader.uniforms.waveA = {
                value: [
                    Math.sin( ( this.waves.A.direction * Math.PI ) / 180 ),
                    Math.cos( ( this.waves.A.direction * Math.PI ) / 180 ),
                    this.waves.A.steepness,
                    this.waves.A.wavelength,
                ],
            };
            shader.uniforms.waveB = {
                value: [
                    Math.sin( ( this.waves.B.direction * Math.PI ) / 180 ),
                    Math.cos( ( this.waves.B.direction * Math.PI ) / 180 ),
                    this.waves.B.steepness,
                    this.waves.B.wavelength,
                ],
            };
            shader.uniforms.waveC = {
                value: [
                    Math.sin( ( this.waves.C.direction * Math.PI ) / 180 ),
                    Math.cos( ( this.waves.C.direction * Math.PI ) / 180 ),
                    this.waves.C.steepness,
                    this.waves.C.wavelength,
                ],
            };
            shader.vertexShader = document.getElementById('vertexShader').textContent;
            shader.fragmentShader = document.getElementById('fragmentShader').textContent;

        };

        //Set water uniforms
        const waterUniforms = this.water.material.uniforms;
        waterUniforms['distortionScale'].value = 20;
        waterUniforms['size'].value = 3.5;

        //Add water to scene
        this.scene.add(this.water);

        //Add sky
        this.sky = new Sky();
        this.sky.scale.setScalar(10000);
        this.scene.add(this.sky);

        //Set sky uniforms
        const skyUniforms = this.sky.material.uniforms;
        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.5;

        //Set sun
        this.setSun();

        //Add directional scene light
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
        ambientLight.position.set(0, 1000, -0);
        this.scene.add(ambientLight);

    }

    generateRandomlyPlacedBoxes() {

        let previousRx;
        let previousRz;

        for (let i = 0; i < this.totalAmountOfLostBoxes; i++) {

            const randomBox = this.box.clone();
            this.floatingBoxes.push(randomBox);

            //Set random position
            const rx = MathUtils.randInt(-100, 100);
            const rz = MathUtils.randInt(-150, -250);
            randomBox.position.set(rx !== previousRx ? rx : rx + 5, 0, rz !== previousRz ? rz : rz + 5);

            //Set previous variables
            previousRx = rx;
            previousRz = rz;

            //Add to scene
            this.scene.add(randomBox);

        }

    }

    createSmokeEmitter() {

        System.fromJSONAsync(ParticleSystemData, THREE).then(system => {

            this.particleSystem = system;
            this.emitterRenderer = new SpriteRenderer(this.scene, THREE);
            this.particleSystem.addRenderer(this.emitterRenderer);

            //Set normal rate
            this.particleSystem.emitters.forEach(emitter => emitter.setRate(this.normalRate));

            window.particleSystem = this.particleSystem;

        });

    }

    getWaveInfo( x, z, time ) {

        const pos = new THREE.Vector3();
        const tangent = new THREE.Vector3( 1, 0, 0 );
        const biNormal = new THREE.Vector3( 0, 0, 1 );
        Object.keys( this.waves ).forEach( ( wave ) => {

            const w = this.waves[ wave ];
            const k = ( Math.PI * 2 ) / w.wavelength;
            const c = Math.sqrt( 9.8 / k );
            const d = new THREE.Vector2(
                Math.sin( ( w.direction * Math.PI ) / 180 ),
                - Math.cos( ( w.direction * Math.PI ) / 180 )
            );
            const f = k * ( d.dot( new THREE.Vector2( x, z ) ) - c * time );
            const a = w.steepness / k;

            pos.x += d.y * ( a * Math.cos( f ) );
            pos.y += a * Math.sin( f );
            pos.z += d.x * ( a * Math.cos( f ) );

            tangent.x += - d.x * d.x * ( w.steepness * Math.sin( f ) );
            tangent.y += d.x * ( w.steepness * Math.cos( f ) );
            tangent.z += - d.x * d.y * ( w.steepness * Math.sin( f ) );

            biNormal.x += - d.x * d.y * ( w.steepness * Math.sin( f ) );
            biNormal.y += d.y * ( w.steepness * Math.cos( f ) );
            biNormal.z += - d.y * d.y * ( w.steepness * Math.sin( f ) );

        } );

        const normal = biNormal.cross( tangent ).normalize();

        return { position: pos, normal: normal };

    }

    updateBoatAndLostBoxes() {

        //Set position
        const time = this.water.material.uniforms[ 'time' ].value;
        const boatWaveInfo = this.getWaveInfo( this.boat.position.x, this.boat.position.z, time );
        this.boat.position.y = boatWaveInfo.position.y;

        //Set rotation
        const boatEuler = new THREE.Euler().setFromVector3(boatWaveInfo.normal);
        this.boat.rotation.x = boatEuler.x;
        this.boat.rotation.z = boatEuler.z;

        //lerp
        this.currentSpeed.velocity = this.lerp(this.currentSpeed.velocity, this.targetSpeed.velocity, 0.01);
        this.currentSpeed.rotation = this.lerp(this.currentSpeed.rotation, this.targetSpeed.rotation, 0.01);

        this.boat.rotation.y += this.currentSpeed.rotation;
        this.boat.translateZ(this.currentSpeed.velocity);

        if(this.gameIsWon.value) {

            //Reset movement when game is won
            this.targetSpeed.velocity = 0;
            this.targetSpeed.rotation = 0;

            //Set normal rate
            this.particleSystem.emitters.forEach(emitter => emitter.setRate(this.normalRate));

        }

        if(this.particleSystem) {

            //Set the position of the emitters
             this.particleSystem.emitters.forEach(emitter => emitter.position.set(this.boat.position.x, this.boat.position.y + 11.5, this.boat.position.z));

            //Update the emitters
            this.particleSystem.update();

        }

        //Check if boat collides with boxes
        this.floatingBoxes.forEach(box => {

            const boxWaveInfo = this.getWaveInfo(box.position.x, box.position.z, time );
            box.position.y = boxWaveInfo.position.y

            const boxEuler = new THREE.Euler().setFromVector3(boxWaveInfo.normal);
            box.rotation.x = boxEuler.x;
            box.rotation.z = boxEuler.z;

            if(this.isColliding(this.boat, box)) {

                //Remove box from scene
                this.scene.remove(box);

                //Increase the amount of recovered boxes
                this.amountOfBoxesRecovered.value++;

                //Clean up array
                this.floatingBoxes = this.floatingBoxes.filter(boxFromArray => box !== boxFromArray);

            }

        });

    }

    setSun() {

        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        let renderTarget;

        const phi = THREE.MathUtils.degToRad( 90 - this.sunParameters.elevation );
        const theta = THREE.MathUtils.degToRad( this.sunParameters.azimuth );

        //Add sun
        this.sun = new THREE.Vector3();
        this.sun.setFromSphericalCoords( 1, phi, theta );

        this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun );
        this.water.material.uniforms[ 'sunDirection' ].value.copy( this.sun ).normalize();

        if ( renderTarget !== undefined ) renderTarget.dispose();

        renderTarget = pmremGenerator.fromScene( this.sky );

        this.scene.environment = renderTarget.texture;

    }

    stopBoat(key) {

        if((key === 'z' || key === 's' || key === 'ArrowUp' || key === 'ArrowDown') && !this.boatMovementController[key].pressed) {
            this.targetSpeed.velocity = 0;
        }

        if((key === 'q' || key === 'd' || key === 'ArrowLeft' || key === 'ArrowRight') && !this.boatMovementController[key].pressed) {
            this.targetSpeed.rotation = 0;
        }

    }

    onKeyUp(event) {

        if(this.boatMovementController[event.key]){

            //Reset specific button
            this.boatMovementController[event.key].pressed = false;

            //Stop the boat
            this.stopBoat(event.key);

            //Check if user 0 keys are pressed
            const isBoatStationary = Object.keys(this.boatMovementController).filter(key => this.boatMovementController[key].pressed).length === 0;

            if(isBoatStationary) {

                //Set moving state
                this.isMoving = false;

                //Reset direction to forward
                this.direction = 'forward';

                //Set normal rate
                this.particleSystem.emitters.forEach(emitter => emitter.setRate(this.normalRate));

            }

        }

    }

    onKeyDown(event) {

        if(this.boatMovementController[event.key]){

            //Set pressed key state
            this.boatMovementController[event.key].pressed = true;

            //Set state
            this.isMoving = true;

            //Set higher rate
            this.particleSystem.emitters.forEach(emitter => emitter.setRate(this.highRate));

        }

        //Set the direction
        if(event.key === 'z' || event.key === 'ArrowUp') this.direction = 'forward';
        if(event.key === 's' || event.key === 'ArrowDown') this.direction = 'backward';

        //Call pressed key function
        Object.keys(this.boatMovementController).forEach(key => {
            this.boatMovementController[key].pressed && this.boatMovementController[key].func()
        });

    }

    resizeScene() {

        //Set correct aspect
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        //Set canvas size again
        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }

    getAnimateFrameId() {
        return this.animateFrameId;
    }

    resetGame() {

        //Reset amount of recovered boxes
        this.amountOfBoxesRecovered.value = 0;

        //Reset boat position and rotation
        this.boat.position.set(0, 0, 0);
        this.boat.rotation.y = Math.PI;

        //Generate new randomly placed boxes
        this.generateRandomlyPlacedBoxes();

        //Reset state
        this.gameIsWon.value = false;

    }

}
