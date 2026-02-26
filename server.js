const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// routes require
const authRoute = require("./src/routes/auth.route")
const accountRoute = require("./src/routes/account.route") 
const transactionRoute = require("./src/routes/transaction.route")
 
// db require
const connectDB = require('./src/config/db');

const app = express();


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());


// api routes
app.use("/api/auth", authRoute)
app.use("/api/account", accountRoute)
app.use("/api/transaction", transactionRoute)



app.get('/', (req, res) => {
    res.send('Welcome to the Bank Transaction System API');
});

// Connect to MongoDB
connectDB();


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
