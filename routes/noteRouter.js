const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authController = require("../controllers/authController");

router
	.route('/')
	.get(authController.protect, noteController.getMyNotes)
	.post( authController.protect, noteController.createNote);

router
	.route('/:id')
	.get(authController.protect, noteController.getNote)
	.patch(noteController.updateNote)
	.delete(noteController.deleteNote);

module.exports = router;
