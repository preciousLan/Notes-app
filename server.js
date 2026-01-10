const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB).then(() => {
	console.log('DB connection successful');
});

port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(
		`Example app listening on port ${port}, your note app is setting up`
	);
});
