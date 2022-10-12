<template>

    <transition name="fade" mode="out-in">

        <div v-if="!isExperiencedLaunched" class="loader absolute inset-0 h-screen w-screen">

            <span v-if="!isLoaded" class="loader__content"></span>

            <transition name="fade" mode="out-in">

                <div v-if="isLoaded && !isExperiencedLaunched" @click="playAudio" class="experience-button bg-transparent hover:bg-[#03E8FC] hover:cursor-pointer text-white font-semibold hover:text-white py-2 px-4 border border-white hover:border-transparent rounded">
                    Start the experience
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
import ThreeJsScene from "@/assets/js/classes/ThreeJsScene";

export default defineComponent({
    setup() {

        //Set variables
        let scene;
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

       nextTick(() => {

           //Create scene
           scene = new ThreeJsScene();

           //Add event listeners
           window.addEventListener('resize', () => scene.resizeScene.call(scene));
           window.addEventListener('keydown', (event) => scene.onKeyDown.call(scene, event));
           window.addEventListener('keyup', (event) => scene.onKeyUp.call(scene, event));

           watch(scene.isLoaded, (newValue, oldValue) => {

               if(newValue && oldValue !== newValue) {
                   isLoaded.value = true;
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
            ambienceSound,
            backgroundMusic,
            isExperiencedLaunched,
            playAudio
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
