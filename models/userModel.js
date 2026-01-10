const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'email is required'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'please provide a valid email'],
	},
	password: {
		type: String,
		required: [true, 'password is required'],
		minlength: 8,
		select: false,
	},
	role: {
		type: String,
		//always use singlular role names
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user',
	},
	passwordConfirm: {
		type: String,
		required: [true, 'please confirm your password'],
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: 'password must be the same',
		},
	},
	passwordChangedAt: Date,
});
//traditionsal middleware, you must call next, async middleware, you do not all next
userSchema.pre('save', async function () {
	// Only run if password was modified
	if (!this.isModified('password')) return;

	// Hash the password
	this.password = await bcrypt.hash(this.password, 12);

	// Remove passwordConfirm
	this.passwordConfirm = undefined;

	// Set passwordChangedAt if NOT a new document
	if (!this.isNew) {
		this.passwordChangedAt = Date.now() - 1000; // Subtract 1 sec for token iat
	}
});

userSchema.methods.correctPassword = function (
	candidatePassword,
	userPassword
) {
	return bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changePasswordAfter = function (jwtTimestamp) {
	if (this.passwordChangedAt) {
		//converts to second because iat will be in seconds
		const changedTimestamp = Math.floor(
			this.passwordChangedAt.getTime() / 1000
		);
		return changedTimestamp > jwtTimestamp;
	}
	return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
