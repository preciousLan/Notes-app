const Note = require('../models/noteModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMyNotes = async (req, res) => {
	const notes = await Note.find({ user: req.user.id });
	res.status(200).json({
		status: 'success',
		results: notes.length,
		data: notes,
	});
};

exports.createNote = catchAsync(async (req, res, next) => {
	req.body.user = req.user.id;
	console.log(req.body);

	const { title, content } = req.body;

	// Validation error — you still create Error manually
	if (!title || !content) {
		return next(new AppError('title and content must be defined', 400));
	}

	// System error — automatically caught by catchAsync
	const note = await Note.create(req.body);

	res.status(201).json({
		status: 'success',
		data: note,
	});
});

exports.getNote = catchAsync(async (req, res, next) => {
	//create Note in DB
	res.status(201).json({
		message: 'notes received',
	});
});

exports.updateNote = catchAsync(async (req, res, next) => {
	//create Note in DB
	res.status(201).json({
		message: 'notes received',
	});
});

exports.deleteNote = catchAsync(async (req, res, next) => {
	//create Note in DB
	res.status(201).json({
		message: 'notes received',
	});
});

// exports.createNote = async (req, res, next) => {
// 	console.log(req.body);
// 	const { title, content } = req.body;
// 	if (!title || !content) {
// 		const err = new Error('you must enter title and content');
// 		err.statusCode = 401;
// 		return next(err);
// 	}
// 	try {
// 		const note = await Note.create(req.body);
// 		res.status(201).json({
// 			status: 'success',
// 			data: note,
// 		});
// 	} catch (err) {
// 		err.statusCode = 400;
// 		next(err);
// 	}
// };
