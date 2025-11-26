export function removePassword(user) {
	if (!user) return user;
	const { password, ...rest } = user;
	return rest;
}

export function removePasswordFromArray(users) {
	return users.map(u => removePassword(u));
}