const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//password mbEyfcpcFH5ne9HN
// const Sauce = require('./models/sauce');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://szymon:mbEyfcpcFH5ne9HN@cluster0.vlrll.mongodb.net/P6?retryWrites=true&w=majority')
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!');
    })
    .catch((error) => {
        console.log('Unable to connect to MongoDB');
        console.log(error);
    });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());

app.use('/api/auth', userRoutes);

// middleware

module.exports = app;