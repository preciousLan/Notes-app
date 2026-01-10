const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const noteRouter = require('./routes/noteRouter');
const userRouter = require('./routes/userRouter');
const cors = require('cors');
const globalErrorHandler = require('./controllers/errorController');

app.use(
	cors({
		origin: 'http://localhost:3001', // frontend URL
		credentials: true, // allow cookies
	})
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/notes', noteRouter);
app.use('/api/v1/users', userRouter);

app.use(globalErrorHandler);
module.exports = app;
