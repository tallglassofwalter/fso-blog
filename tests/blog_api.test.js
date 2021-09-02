const mongoose = require('mongoose');
const supertest = require('supertest');
const { initialBlogs, nonExistingId, blogsInDb } = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

let authToken = '';

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = initialBlogs.map((el) => new Blog(el));
  const promiseArr = blogObjects.map((el) => el.save());

  await User.deleteMany({});
  const testUser = {
    username: 'user',
    name: 'user name',
    password: 'password'
  };

  await api
    .post('/api/users')
    .send(testUser);

  const loginResponse = await api
    .post('/api/login')
    .send({ username: testUser.username, password: testUser.password });

  authToken = `Bearer ${loginResponse.body.token}`;

  await Promise.all(promiseArr);
});

describe('initial blog data saved in database', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(initialBlogs.length);
  });

  test('a specific blog is in the returned blogs', async () => {
    const response = await api.get('/api/blogs');
    const contents = response.body.map((el) => el.title);
    expect(contents).toContain('title1');
  });

  test('id property is defined', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
  });
});

describe('viewing a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView));
    expect(resultBlog.body).toEqual(processedBlogToView);
  });

  test('if blog does not exist, returns 404', async () => {
    const validNonexistingId = await nonExistingId();
    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404);
  });

  test('invalid id returns 400', async () => {
    const invalidId = '5a3d5da59070081a82a3445';
    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400);
  });
});

describe('post a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'title',
      url: 'urlofnewblog',
      likes: 0
    };

    await api
      .post('/api/blogs')
      .set('Authorization', authToken)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);

    const contents = blogsAtEnd.map((el) => el.url);
    expect(contents).toContain('urlofnewblog');
  });

  test('a blog without `likes` property will be set to 0 likes', async () => {
    const newBlog = {
      title: 'title1',
      url: 'uniqueurl1'
    };
    await api
      .post('/api/blogs')
      .set('Authorization', authToken)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogs = await blogsInDb();
    const blog = blogs.filter((el) => el.url === newBlog.url);
    expect(blog[0].likes).toEqual(0);
  });

  test('blog without a title and url is not added', async () => {
    const newBlog = {
      likes: 0
    };
    await api
      .post('/api/blogs')
      .set('Authorization', authToken)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  });

  test('a request without a valid token fails', async () => {
    const newBlog = {
      title: 'title',
      url: 'www.url.com',
      likes: 8
    };

    await api
      .post('/api/blogs')
      .set('Authorization', '')
      .send(newBlog)
      .expect(401);
  });
});

// describe('delete a note', () => {
//   test('a blog can be deleted', async () => {
//     const blogsAtStart = await blogsInDb();
//     const blogToDelete = blogsAtStart[0];

//     await api
//       .delete(`/api/blogs/${blogToDelete.id}`)
//       .set('Authorization', authToken)
//       .expect(204);

//     const blogsAtEnd = await blogsInDb();
//     expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);

//     const urls = blogsAtEnd.map((el) => el.url);
//     expect(urls).not.toContain(blogToDelete.url);
//   });
// });

afterAll(() => {
  mongoose.connection.close();
});