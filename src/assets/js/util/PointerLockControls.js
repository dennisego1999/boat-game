import {
	Euler,
	Vector3,
	EventDispatcher,
} from 'three';

const _euler = new Euler( 0, 0, 0, 'YXZ' );

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class PointerLockControls extends EventDispatcher {

	constructor( camera, domElement ) {

		super();

		this.currentMovement = {
			x: 0, 
			y: 0,
		};

		this.targetMovement = {
			x: 0, 
			y: 0,
		};

		if ( domElement === undefined ) {

			console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
			domElement = document.body;

		}

		this.domElement = domElement;
		this.isLocked = false;
		this.press = false;

		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		const scope = this;

		function onMouseMove( event ) {

			if ( scope.isLocked === false ) return;
			if ( scope.press === false ) {
				
				//Set target to 0 when user stops dragging and limit between 1 and -1
				scope.targetMovement = {
					x: 0,
					y: 0,
				};

				return;
	
			};;

			const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			//Set target position
			scope.targetMovement = {
				x: movementX,
				y: movementY,
			};

		}

		function onPointerlockChange() {

			if ( scope.domElement.ownerDocument.pointerLockElement === scope.domElement ) {

				scope.dispatchEvent( _lockEvent );

				scope.isLocked = true;

			} else {

				scope.dispatchEvent( _unlockEvent );

				scope.isLocked = false;

			}

		}

		function onPointerlockError() {

			console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

		}

		this.updateCamera = function() {

			_euler.setFromQuaternion( camera.quaternion );

			_euler.y += scope.currentMovement.x * 0.002;
			_euler.x += scope.currentMovement.y * 0.002;

			_euler.x = Math.max( _PI_2 - scope.maxPolarAngle, Math.min( _PI_2 - scope.minPolarAngle, _euler.x ) );

			camera.quaternion.setFromEuler( _euler );

			scope.dispatchEvent( _changeEvent );

		}

		this.connect = function () {

			scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.addEventListener( 'mousedown', () => { this.press = true; });
			scope.domElement.ownerDocument.addEventListener( 'mouseup', () => { this.press = false; });
			scope.domElement.ownerDocument.addEventListener('mouseleave', () => { this.press = false; });

			scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.addEventListener( 'pointerlockerror', onPointerlockError );

		};

		this.disconnect = function () {

			scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockerror', onPointerlockError );

		};

		this.dispose = function () {

			this.disconnect();

		};

		this.lock = function () {

			this.isLocked = true;
			
		};

		this.unlock = function () {


			this.isLocked = false;


		};

		this.connect();

	}

}

export { PointerLockControls };