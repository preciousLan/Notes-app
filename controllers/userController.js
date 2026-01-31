export const getUserById = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		//return User
		user.password = undefined; //hide password
		return res.status(200).json({
			message: 'User fetched successfully',
			user,
		});
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};
