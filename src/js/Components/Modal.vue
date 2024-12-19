<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	maxWidth: {
		type: String,
		default: '2xl'
	},
	closeable: {
		type: Boolean,
		default: true
	}
});

const emit = defineEmits(['close']);

watch(
	() => props.show,
	() => {
		if (props.show) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = null;
		}
	}
);

const close = () => {
	if (props.closeable) {
		emit('close');
	}
};

const closeOnEscape = (e) => {
	if (e.key === 'Escape' && props.show) {
		close();
	}
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));

onUnmounted(() => {
	document.removeEventListener('keydown', closeOnEscape);
	document.body.style.overflow = null;
});

const maxWidthClass = computed(() => {
	return {
		fit: 'sm:max-w-fit',
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
		'2xl': 'sm:max-w-2xl'
	}[props.maxWidth];
});
</script>

<template>
	<Teleport to="body">
		<Transition leave-active-class="duration-200">
			<div
				v-show="show"
				class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0"
				scroll-region
			>
				<Transition
					enter-active-class="ease-out duration-300"
					enter-from-class="opacity-0"
					enter-to-class="opacity-100"
					leave-active-class="ease-in duration-200"
					leave-from-class="opacity-100"
					leave-to-class="opacity-0"
				>
					<div v-show="show" class="fixed inset-0 transform transition-all" @click="close">
						<div class="absolute inset-0 cursor-pointer bg-black/60" />
					</div>
				</Transition>

				<Transition
					enter-active-class="ease-out duration-300"
					enter-from-class="opacity-0 scale-95"
					enter-to-class="opacity-100 scale-100"
					leave-active-class="ease-in duration-200"
					leave-from-class="opacity-100 scale-100"
					leave-to-class="opacity-0 scale-95"
				>
					<div
						v-if="show"
						class="relative z-50 flex w-full cursor-default flex-col items-center justify-center gap-4 rounded-md bg-blue-400 p-4 text-center text-white shadow-2xl"
						:class="maxWidthClass"
					>
						<slot />
					</div>
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>
