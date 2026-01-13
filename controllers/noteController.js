const Note = require('../models/noteModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMyNotes = async (req, res) => {
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 5;
	const skip = (page - 1) * limit;
	const allowedSorts = ['newest', 'oldest'];
	const sortQuery = allowedSorts.includes(req.query.sort)
		? req.query.sort
		: 'newest';
	const sortBy = sortQuery === 'oldest' ? 1 : -1;

	const notes = await Note.find({ user: req.user.id })
		.sort({ createdAt: sortBy })
		.skip(skip)
		.limit(limit);
	const total = await Note.countDocuments({ user: req.user.id });

	res.status(200).json({
		status: 'success',
		results: notes.length,
		total,
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

// PATCH /api/v1/notes/:id
exports.updateNote = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { title, content } = req.body;

	// Validate input
	if (!title && !content) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide title or content to update',
		});
	}

	// Find note by ID and ensure it belongs to the logged-in user
	const note = await Note.findOne({ _id: id, user: req.user.id });
	if (!note) {
		return res.status(404).json({
			status: 'fail',
			message: 'Note not found or you do not have permission',
		});
	}

	// Update the note
	if (title) note.title = title;
	if (content) note.content = content;

	await note.save();

	res.status(200).json({
		status: 'success',
		data: note,
		message: 'Note updated successfully',
	});
});

// DELETE /api/v1/notes/:id
exports.deleteNote = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	// Find note by ID and ensure it belongs to the logged-in user
	const note = await Note.findOne({ _id: id, user: req.user.id });
	if (!note) {
		return res.status(404).json({
			status: 'fail',
			message: 'Note not found or you do not have permission',
		});
	}

	await note.deleteOne();

	res.status(200).json({
		status: 'success',
		message: 'Note deleted successfully',
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
