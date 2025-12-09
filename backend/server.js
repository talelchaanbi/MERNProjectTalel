const express = require('express');
require('dotenv').config();

const app = express();

// middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const connectDB = require('./config/connectDB');
const seedRoles = require('./config/seed/seedRoles');

const startServer = async () => {
  try {
    await connectDB();
    await seedRoles();

    // routes
    app.use('/api/auth', require('./routes/auth.route'));

    const PORT = process.env.PORT || 4500;
    app.listen(PORT, (err) => {
      err
        ? console.log(err)
        : console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server bootstrap failed:', error.message);
    process.exit(1);
  }
};

startServer();