const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'title is required'],
			
		},
		content: {
			type: String,
			required: [true, 'you need to add a content'],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
