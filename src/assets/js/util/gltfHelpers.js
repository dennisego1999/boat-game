// Flatten array of children > easier to filter
export const flattenChildren = (array, d = 1) => {
	return d > 0
		? array.reduce(
			(acc, val) => acc.concat(Array.isArray(val.children) ? flattenChildren(val.children, d - 1) : val),
			array
		)
		: array.slice();
};

// Filter children and return meshes where names match
export const getMeshes = (meshes, names) => {
	return meshes.filter((mesh) => names.includes(mesh.name));
};

// Returns all meshes where keys match. Matching can be 'exact' or 'partial'
export const getChildren = (scene, keys, matching) => {
	return flattenChildren(scene.children, Infinity).filter((child) => {
		return keys.find((key) => {
			return isMatching(child, {
				name: key,
				matching
			});
		});
	});
};

// Filter function that returns true or false based on name and matching properties
export const isMatching = (item, binding) => {
	const parentName = item.parent?.type === 'Group' ? item.parent.name : undefined;

	switch (binding.matching) {
	case 'partial':
		return item.name.indexOf(binding.name) > -1 || (parentName && parentName.indexOf(binding.name) > -1);

	case 'exact':
	default:
		return item.name === binding.name || (parentName && parentName === binding.name);
	}
};
