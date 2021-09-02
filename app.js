require('express-async-errors');
const { MONGODB_URI } = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const blogsRouter = require('./controllers/blogs');
const {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  getToken
} = require('./utils/middleware');
const { info, error } = require('./utils/logger');

const mongoose = require('mongoose');

info('connecting to ', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    info('connected to MongoDB');
  })
  .catch((err) => {
    error('error connecting to MongoDB:', err.message);
  });

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use(getToken);
app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;