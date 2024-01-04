<script setup></script>

<template>
	<router-view v-slot="{ Component }">
		<transition name="fade" mode="out-in" appear>
			<component :is="Component" />
		</transition>
	</router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.4s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
<script setup></script>
