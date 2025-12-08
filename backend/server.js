const express = require('express');
require('dotenv').config();

const app = express();

//middleware
app.use(express.json());
app.use("./uploads", express.static("uploads"));

//connect to database
const connectDB = require('./config/connectDB');
connectDB();

//seed roles
const seedRoles = require('./config/seed/seedRoles');
seedRoles();

//routes
app.use('/api/auth', require('./routes/auth.route'));


const PORT = process.env.PORT || 4500;
app.listen(PORT, (err) => {
    err ? console.log(err) :
  console.log(`Server is running on http://localhost:${PORT}`);
});