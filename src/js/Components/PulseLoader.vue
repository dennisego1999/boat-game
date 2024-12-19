<template>
	<div class="box loader-08" />
</template>

<style scoped lang="scss">
.box {
	position: relative;
	display: inline-block;
	transition: 0.3s color, 0.3s transform, 0.3s opacity;
}

.loader-08 {
	&:before,
	&:after {
		content: '';
		width: inherit;
		height: inherit;
		border-radius: 50%;
		background-color: currentcolor;
		opacity: 0.6;
		position: absolute;
		top: 0;
		left: 0;
		animation: loader-08 2s infinite ease-in-out;
	}
	&:after {
		animation-delay: -1s;
	}
}

@keyframes loader-08 {
	0%,
	100% {
		transform: scale(0);
	}
	50% {
		transform: scale(1);
	}
}
</style>
