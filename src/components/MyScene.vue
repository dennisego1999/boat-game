<template>

    <div id="three-js-container" class="relative h-screen w-screen overflow-hidden">

        <canvas class="h-full w-full"></canvas>

    </div>

</template>

<script>
import {defineComponent, nextTick, onBeforeUnmount} from 'vue';
import ThreeJsSceneScene from "@/assets/js/classes/ThreeJsScene";

export default defineComponent({
    setup() {

        //Set variables
        let scene;

       nextTick(() => {

           //Create scene
           scene = new ThreeJsSceneScene();

           //Add event listeners
           window.addEventListener('resize', () => scene.resizeScene.call(scene));
           window.addEventListener('keydown', (event) => scene.onKeyDown.call(scene, event));
           window.addEventListener('keyup', () => scene.onKeyUp.call(scene));

       });

        onBeforeUnmount(() => {

            //Cancel rendering
            cancelAnimationFrame(scene.getAnimateFrameId());

            //Remove event listeners
            window.removeEventListener('resize', () => scene.resizeScene.call(scene));
            window.removeEventListener('keydown', () => scene.onKeyDown.call(scene));
            window.removeEventListener('keyup', () => scene.onKeyUp.call(scene));

        });

    },
});
</script>
