<template>
	<RouterView v-slot="{ Component }">
		<Transition name="fade" mode="out-in" appear>
			<Component :is="Component" />
		</Transition>
	</RouterView>
</template>
