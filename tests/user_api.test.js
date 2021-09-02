const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');
const User = require('../models/user');
const { usersInDb } = require('./test_helper');
const app = require('../app');
const api = supertest(app);

describe('there is initially a user saved in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('successfully creates new user', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'user',
      name: 'first name',
      password: 'secretpassword'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((el) => el.username);
    expect(usernames).toContain(newUser.username);
  });

  test('fails to create user if username is taken', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'root',
      name: 'first name',
      password: 'secretpassword'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
