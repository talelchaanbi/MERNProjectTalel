const express = require('express');
require('dotenv').config();

const app = express();

const connectDB = require('./config/connectDB');
connectDB();


const PORT = process.env.PORT || 4500;
app.listen(PORT, (err) => {
    err ? console.log(err) :
  console.log(`Server is running on http://localhost:${PORT}`);
});