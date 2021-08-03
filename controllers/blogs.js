const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs);
    });
});

blogsRouter.get('/:id', (request, response) => {
  Blog
    .findById(request.params.id)
    .then((blog) => response.json(blog));
});

blogsRouter.post('/', (request, response) => {
  const { title, author, url, likes } = request.body;
  const blog = new Blog({ title, author, url, likes });

  blog
    .save()
    .then(result => {
      response.status(201).json(result);
    });
});

blogsRouter.put('/:id', (request, response) => {
  const { title, author, url, likes } = request.body;
  const blog = { title, author, url, likes };

  Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
    .then((updated) => response.json(updated));
});

blogsRouter.delete('/:id', (request, response) => {
  Blog
    .findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end());
});

module.exports = blogsRouter;