const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN, // e.g., '1d'
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	console.log('SIGNUP HIT');

	const { email, password, passwordConfirm } = req.body;

	if (!email || !password || !passwordConfirm) {
		return next(new AppError('Missing fields', 400));
	}

	if (password !== passwordConfirm) {
		return next(new AppError('Passwords do not match', 400));
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		return next(new AppError(' please login', 400));
	}

	const newUser = await User.create({
		email,
		password,
		passwordConfirm,
	});

	const token = signToken(newUser._id);
	res.cookie('jwt', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		samesite: 'lax',

		expires: new Date(
			Date.now() +
				Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
		),
	});

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: {
				id: newUser._id,
				email: newUser.email,
			},
		},
	});
});

exports.login = catchAsync(async (req, res, next) => {
	console.log(req.body);
	const { email, password } = req.body;
	//1)check if email and password exists
	if (!email || !password)
		return next(new AppError('email and password needed', 400));
	//2) check if user exists and password is correct by comparing the password hash with req password
	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('incorrect email or password lol', 401));
	}
	///////
	//3)if everything ok,send token to client
	//  and make user.password = undefined before sending response

	const token = signToken(user._id);
	res.cookie('jwt', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		samesite: 'lax',
		expires: new Date(
			Date.now() +
				Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
		),
	});
	user.password = undefined;
	res.status(200).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	//get token from cookies
 // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
	
	if (!token) return next(new AppError('you must be logged in', 401));
	//verify token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	//find user in db
	const freshUser = await User.findById(decoded.id);
	if (!freshUser) return next(new AppError('User no longer exists', 401));

	//check if password was changed after token was issued
	// if (freshUser.passwordChangedAt) {
	// 	const changedTimestamp = parseInt(
	// 		freshUser.passwordChangedAt.getTime() / 1000,
	// 		10
	// 	);
	// 	if (decoded.iat < changedTimestamp)
	// 		return next(
	// 			new AppError(
	// 				'User recently changed password. Please log in again.',
	// 				401
	// 			)
	// 		);
	// }
	if (freshUser.changePasswordAfter(decoded.iat))
		return next(new AppError('user recently changed their password', 401));

	req.user = freshUser;
	next();
});
