<script setup>
import { watch, ref, onBeforeUnmount, onMounted } from 'vue';
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
function playAudio() {
	// Audio function
	backgroundMusic.value.muted = false;
	backgroundMusic.value.play();
	ambienceSound.value.muted = false;
	ambienceSound.value.play();

	// Set experience state
	isExperiencedLaunched.value = true;
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
	if (document.body.classList.contains('grab')) {
		document.body.classList.remove('grab');
	}

	if (document.body.classList.contains('grabbing')) {
		document.body.classList.remove('grabbing');
	}
}

function setGrabbingCursor() {
	if (document.body.classList.contains('grab')) {
		document.body.classList.remove('grab');
	}

	document.body.classList.add('grabbing');
}

function setGrabCursor() {
	if (document.body.classList.contains('grabbing')) {
		document.body.classList.remove('grabbing');
	}

	document.body.classList.add('grab');
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
	window.addEventListener('keydown', (event) => {
		if (!isExperiencedLaunched.value || Game.isVictory.value) {
			return;
		}

		// Call func
		Game.onKeyDown.call(Game, event);
	});
	window.addEventListener('keyup', (event) => {
		if (!isExperiencedLaunched.value || Game.isVictory.value) {
			return;
		}

		// Call func
		Game.onKeyUp.call(Game, event);
	});

	//Prevent pull to refresh for IOS mobile
	if (isIphone || isIpad) {
		preventPullToRefreshForIOS();
	}

	// Watch
	watch(Game.amountOfBoxesRecovered, (newValue, oldValue) => {
		if (oldValue !== newValue) {
			//Set game state
			newValue === Game.totalAmountOfLostBoxes ? (Game.isVictory.value = true) : (Game.isVictory.value = false);
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
	window.removeEventListener('keydown', () => Game.onKeyDown.call(Game));
	window.removeEventListener('keyup', () => Game.onKeyUp.call(Game));
	window.removeEventListener('touchmove', checkTouchYCoords);
	document.body.removeEventListener('pointerdown', setGrabbingCursor);
	document.body.removeEventListener('pointerup', setGrabCursor);
});
</script>

<template>
	<div class="relative">
		<div
			v-if="Game.isVictory.value"
			@click="restartGame"
			class="absolute left-[20px] top-[20px] z-[20] rounded border border-white bg-transparent px-4 py-2 font-semibold text-white hover:cursor-pointer hover:text-white"
		>
			Restart game
		</div>

		<Transition name="fade" mode="out-in">
			<div
				v-if="Game.isLoaded.value && isExperiencedLaunched"
				class="absolute right-[20px] top-[20px] z-[10] flex items-center justify-center gap-[5px] text-white"
			>
				<h2 class="font-weight-bold text-uppercase">Boxes recovered:</h2>

				<div class="flex items-center justify-between">
					<p class="m-0">{{ Game.amountOfBoxesRecovered.value }}</p>
					/
					<p class="m-0">{{ Game.totalAmountOfLostBoxes.value }}</p>
				</div>
			</div>
		</Transition>

		<Transition name="fade" mode="out-in">
			<div v-if="!isExperiencedLaunched" class="absolute inset-0 h-screen w-screen">
				<span v-if="!Game.isLoaded.value" />

				<Transition name="fade" mode="out-in">
					<div
						v-if="Game.isLoaded.value && !isExperiencedLaunched"
						class="experience-button flex flex-col items-center justify-center gap-[5px]"
					>
						<h2 class="text-white">Collect all lost cargo!</h2>

						<div class="mb-2 h-[1px] w-full bg-white" />

						<div
							@click="playAudio"
							class="rounded border border-white bg-transparent px-4 py-2 font-semibold text-white hover:cursor-pointer hover:text-white"
						>
							Start the experience
						</div>
					</div>
				</Transition>
			</div>
		</Transition>

		<canvas id="game-canvas" class="h-[100dvh] w-screen" />

		<audio src="/audio/ship-ocean-waves-wind-wood-creaks.mp3" ref="backgroundMusic" muted autoplay loop />
		<audio src="/audio/background-music.mp3" ref="ambienceSound" muted autoplay loop />
	</div>
</template>
