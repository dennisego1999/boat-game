import { Euler, EventDispatcher, Vector3 } from 'three';
const _changeEvent = { type: 'change' };
const _PI_2 = Math.PI / 2;

class PointerLockControlsMobile extends EventDispatcher {

	constructor(camera, domElement) {

		super();

		this.currentMovement = {
			x: 0, 
			y: 0,
		};

		this.targetMovement = {
			x: 0, 
			y: 0,
		};

		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians
		this.vector = new Vector3();
		this.euler = new Euler(0, 0, 0, 'YXZ');

		this.camera = camera;
		this.domElement = domElement;

		const scope = this;

		if (domElement === undefined) {
			console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.');
			domElement = document.body;
		}

		this.onTouchMove = function(e) {

			let touch = e.touches[0];
	
			if (!touch) {

				console.log('no touch')
				
				//Set target to 0 when user stops dragging and limit between 1 and -1
				scope.targetMovement = {
					x: 0,
					y: 0,
				};

				return;
	
			}
	
			const movementX = scope.previousTouch ? touch.pageX - scope.previousTouch.pageX : 0;
			const movementY = scope.previousTouch ? touch.pageY - scope.previousTouch.pageY : 0;
	
			//Set target position
			scope.targetMovement = {
				x: movementX,
				y: movementY,
			};
	
			scope.previousTouch = touch;
		}
		
		this.onTouchEnd = function() {
			scope.previousTouch = undefined;
		}

		this.updateCamera = function() {

	
			const multiplier = 0.002;
	
			scope.euler.setFromQuaternion(scope.camera.quaternion);
			scope.euler.y += scope.currentMovement.x * multiplier;
			scope.euler.x += scope.currentMovement.y * multiplier;
			scope.euler.x = Math.max(_PI_2 - scope.maxPolarAngle, Math.min(_PI_2 - scope.minPolarAngle, scope.euler.x));
			scope.camera.quaternion.setFromEuler(scope.euler);
	
			scope.dispatchEvent(_changeEvent);
	
		}

		this.connect = function() {
			scope.domElement.addEventListener('touchmove', scope.onTouchMove, false);
			scope.domElement.addEventListener('touchend', scope.onTouchEnd, false);
		}

		this.disconnect = function() {
			scope.domElement.removeEventListener('touchmove', scope.onTouchMove, false);
			scope.domElement.removeEventListener('touchend', scope.onTouchEnd, false);
		}

		this.dispose = function() {
			scope.disconnect();
		}

		this.connect();

	}
}
export { PointerLockControlsMobile };






