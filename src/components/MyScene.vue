<template>

    <div v-if="gameIsWon" @click="restartGame" class="absolute z-[20] top-[20px] left-[20px] bg-transparent hover:cursor-pointer text-white font-semibold hover:text-white py-2 px-4 border border-white rounded">
        Restart game
    </div>

    <div v-if="isLoaded && isExperiencedLaunched" class="absolute z-[10] top-[20px] right-[20px] flex justify-center items-center gap-[5px] text-white">

        <h2 class="font-weight-bold text-uppercase">Boxes recovered: </h2>

        <div class=" flex justify-between items-center">

            <p class="m-0">{{ amountOfBoxesRecovered }}</p>
            /
            <p class="m-0">{{ totalAmountOfLostBoxes }}</p>

        </div>

    </div>

    <transition name="fade" mode="out-in">

        <div v-if="!isExperiencedLaunched" class="loader absolute inset-0 h-screen w-screen">

            <span v-if="!isLoaded" class="loader__content"></span>

            <transition name="fade" mode="out-in">

                <div v-if="isLoaded && !isExperiencedLaunched" class="experience-button flex items-center justify-center flex-col gap-[5px]">

                    <h2 class="text-white">Collect all lost cargo!</h2>

                    <div class="bg-white h-[1px] w-full mb-2"></div>

                    <div @click="playAudio" class="bg-transparent hover:cursor-pointer text-white font-semibold hover:text-white py-2 px-4 border border-white rounded">
                        Start the experience
                    </div>

                </div>

            </transition>

        </div>

    </transition>

    <div id="three-js-container" class="relative h-screen w-screen overflow-hidden">

        <canvas class="h-full w-full"></canvas>

    </div>

    <audio src="/audio/ship-ocean-waves-wind-wood-creaks.mp3" ref="backgroundMusic" muted autoplay loop></audio>
    <audio src="/audio/background-music.mp3" ref="ambienceSound" muted autoplay loop></audio>

</template>

<script>
import {defineComponent, nextTick, watch, ref, onBeforeUnmount} from 'vue';
import GameScene from "@/assets/js/classes/GameScene";

export default defineComponent({
    setup() {

        //Set variables
        let scene;
        const gameIsWon = ref(false);
        const amountOfBoxesRecovered = ref(0);
        const totalAmountOfLostBoxes = 10;
        const isMuted = ref(false);
        const isLoaded = ref(false);
        const isExperiencedLaunched = ref(false);
        const backgroundMusic = ref(null);
        const ambienceSound = ref(null);

        function playAudio() {

            //Audio function
            backgroundMusic.value.muted = false;
            backgroundMusic.value.play();
            ambienceSound.value.muted = false;
            ambienceSound.value.play();

            //Set experience state
            isExperiencedLaunched.value = true;

        }

        function restartGame() {

            //Reload window
            location.reload();

        }

       nextTick(() => {

           //Create scene
           scene = new GameScene(amountOfBoxesRecovered, totalAmountOfLostBoxes);

           //Add event listeners
           window.addEventListener('resize', () => scene.resizeScene.call(scene));
           window.addEventListener('keydown', (event) => {

               if(!isExperiencedLaunched.value || gameIsWon.value) {
                   return;
               }

               //Call func
               scene.onKeyDown.call(scene, event);

           });
           window.addEventListener('keyup', (event) => {

               if(!isExperiencedLaunched.value || gameIsWon.value) {
                   return;
               }

               //Call func
               scene.onKeyUp.call(scene, event)

           });

           watch(scene.isLoaded, (newValue, oldValue) => {

               if(newValue && oldValue !== newValue) {
                   isLoaded.value = true;
               }

           });

           watch(amountOfBoxesRecovered, (newValue, oldValue) => {

               if(oldValue !== newValue) {

                   console.log('increased: ', newValue)
                   newValue === totalAmountOfLostBoxes ? gameIsWon.value = true : gameIsWon.value = false;

               }

           });

       });

        onBeforeUnmount(() => {

            //Cancel rendering
            cancelAnimationFrame(scene.getAnimateFrameId());

            //Remove event listeners
            window.removeEventListener('resize', () => scene.resizeScene.call(scene));
            window.removeEventListener('keydown', () => scene.onKeyDown.call(scene));
            window.removeEventListener('keyup', () => scene.onKeyUp.call(scene));

        });

        return {
            isLoaded,
            isMuted,
            gameIsWon,
            ambienceSound,
            backgroundMusic,
            isExperiencedLaunched,
            amountOfBoxesRecovered,
            totalAmountOfLostBoxes,
            playAudio,
            restartGame
        };

    },
});
</script>
<style lang="scss">

.fade-enter-active, .fade-leave-active {
    transition: all 1s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

</style>
