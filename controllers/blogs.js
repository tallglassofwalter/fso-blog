const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');
// const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 });
  if (blogs) response.json(blogs);
  else response.status(404).end();
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) response.json(blog);
  else response.status(404).end();
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  let { title, author, url, likes } = request.body;
  const user = request.user;

  const blog = new Blog({ title, author, url, likes, user: user._id });
  const res = await blog.save();
  user.blogs = user.blogs.concat(res._id);
  await user.save();

  response.status(201).json(res);
});

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body;
  const blog = { title, author, url, likes };

  const res = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' });
  response.json(res);
});

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const id = request.params.id;
  const blog = await Blog.findById(id);
  const user = request.user;
  if (user._id.toString() !== blog.user.toString()) {
    return response.status(401).json({
      error: 'token missing or invalid'
    });
  }
  await Blog.findOneAndRemove({ _id: id });
  response.status(204).end();
});

module.exports = blogsRouter;