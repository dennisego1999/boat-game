<script setup>
// Define emits
const emit = defineEmits(['click']);

// Define props
defineProps({
	icon: Boolean,
	disabled: {
		type: Boolean,
		default: false
	},
	downloadFile: {
		type: Boolean,
		default: false
	},
	downloadName: {
		type: String,
		default: 'result'
	},
	method: {
		type: String,
		default: 'get'
	},
	href: {
		type: String,
		default: null
	}
});
</script>

<template>
	<button
		:class="[
			'text-md flex cursor-pointer items-center justify-center gap-1 rounded-md border-2 border-black border-transparent bg-black px-4 py-1 font-medium text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white',
			$attrs.class,
			{ 'pointer-events-none opacity-30': disabled }
		]"
		@click="emit('click')"
	>
		<slot />

		<slot v-if="icon" name="icon" />
	</button>
</template>
