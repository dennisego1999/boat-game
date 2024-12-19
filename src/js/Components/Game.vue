<script setup>
import { watch, ref, onBeforeUnmount, onMounted } from 'vue';
import PulseLoader from '@/Components/PulseLoader.vue';
import Modal from '@/Components/Modal.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import Game from '@/Classes/Game';
import isMobile from 'ismobilejs';

// Set variables
const isExperiencedLaunched = ref(false);
const backgroundMusic = ref(null);
const ambienceSound = ref(null);
const isIphone = isMobile(navigator.userAgent).apple.phone;
const isIpad =
	(/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
	isMobile(navigator.userAgent).apple.tablet;

// Define functions
function startGame() {
	// Play audio
	playAudio();

	// set ref
	isExperiencedLaunched.value = true;
}
function playAudio() {
	// Audio function
	backgroundMusic.value.muted = false;
	backgroundMusic.value.play();
	ambienceSound.value.muted = false;
	ambienceSound.value.play();
}

function restartGame() {
	Game.reset();
}

function preventPullToRefreshForIOS() {
	window.addEventListener('touchmove', checkTouchYCoords, { passive: false });
}

function checkTouchYCoords(event) {
	// Prevent default when user scrolls up or down
	if (window.scrollY <= 0) {
		event.preventDefault();
		return false;
	}
}

function clearCursorClasses() {
	if (document.body.classList.contains('cursor-grab')) {
		document.body.classList.remove('cursor-grab');
	}

	if (document.body.classList.contains('cursor-grabbing')) {
		document.body.classList.remove('cursor-grabbing');
	}
}

function setGrabbingCursor() {
	if (document.body.classList.contains('cursor-grab')) {
		document.body.classList.remove('cursor-grab');
	}

	document.body.classList.add('cursor-grabbing');
}

function setGrabCursor() {
	if (document.body.classList.contains('cursor-grabbing')) {
		document.body.classList.remove('cursor-grabbing');
	}

	document.body.classList.add('cursor-grab');
}

function onKeyDown(event) {
	if (!isExperiencedLaunched.value || Game.isVictory.value) {
		return;
	}

	// Call func
	Game.onKeyDown.call(Game, event);
}

function onKeyUp(event) {
	if (!isExperiencedLaunched.value || Game.isVictory.value) {
		return;
	}

	// Call func
	Game.onKeyUp.call(Game, event);
}

// Life cycles
onMounted(() => {
	// Set cursor
	setGrabCursor();

	// Initiate game
	Game.init('game-canvas');

	// Add event listeners
	window.addEventListener('resize', () => Game.resize.call(Game));
	document.body.addEventListener('pointerdown', setGrabbingCursor);
	document.body.addEventListener('pointerup', setGrabCursor);
	window.addEventListener('keydown', (event) => onKeyDown(event));
	window.addEventListener('keyup', (event) => onKeyUp(event));

	//Prevent pull to refresh for IOS mobile
	if (isIphone || isIpad) {
		preventPullToRefreshForIOS();
	}

	// Watch
	watch(Game.amountOfBoxesRecovered, (newValue, oldValue) => {
		if (oldValue !== newValue) {
			// Set game state
			Game.isVictory.value = newValue === Game.totalAmountOfLostBoxes.value;
		}
	});
});

onBeforeUnmount(() => {
	// Destroy game
	Game.destroy();

	// Clear cursor classes
	clearCursorClasses();

	// Remove event listeners
	window.removeEventListener('resize', () => Game.resize.call(Game));
	window.removeEventListener('keydown', (event) => onKeyDown(event));
	window.removeEventListener('keyup', (event) => onKeyUp(event));
	window.removeEventListener('touchmove', checkTouchYCoords);
	document.body.removeEventListener('pointerdown', setGrabbingCursor);
	document.body.removeEventListener('pointerup', setGrabCursor);
});
</script>

<template>
	<div class="relative">
		<canvas id="game-canvas" class="h-[100dvh] w-screen" />

		<Transition name="fade" mode="out-in">
			<div
				v-if="Game.isLoaded.value && isExperiencedLaunched"
				class="absolute right-4 top-4 z-10 flex items-center justify-center gap-2 text-white"
			>
				<h2 class="font-bold uppercase">Boxes recovered:</h2>

				<div class="flex items-center justify-between">
					<p class="m-0">{{ Game.amountOfBoxesRecovered.value }}</p>
					/
					<p class="m-0">{{ Game.totalAmountOfLostBoxes.value }}</p>
				</div>
			</div>
		</Transition>

		<Transition name="fade">
			<div
				v-if="!Game.isLoaded.value"
				class="absolute z-50 flex h-[100dvh] w-screen items-center justify-center bg-blue-500"
			>
				<PulseLoader class="h-12 w-12 text-white" />
			</div>
		</Transition>

		<Modal :show="Game.isLoaded.value && !isExperiencedLaunched" max-width="md" @close="startGame">
			<div class="flex flex-col items-center justify-center gap-4">
				<h2 class="text-white">Collect all lost cargo!</h2>

				<PrimaryButton @click="startGame"> Start the experience </PrimaryButton>
			</div>
		</Modal>

		<Modal :show="Game.isVictory.value" @close="restartGame" max-width="md">
			<div class="flex flex-col items-center justify-center gap-4">
				<h2 class="text-2xl text-white">Congratulations</h2>
				<span class="text-white">You found all lost cargo!</span>

				<PrimaryButton @click="restartGame"> Restart game </PrimaryButton>
			</div>
		</Modal>

		<audio src="/audio/ship-ocean-waves-wind-wood-creaks.mp3" ref="backgroundMusic" muted autoplay loop />
		<audio src="/audio/background-music.mp3" ref="ambienceSound" muted autoplay loop />
	</div>
</template>
