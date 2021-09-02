const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: 'title0',
    author: 'author0',
    url: 'url0',
    likes: 1,
    id: '1'
  },
  {
    title: 'title1',
    author: 'author1',
    url: 'url1',
    likes: 2,
    id: 2
  }
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'title',
    author: 'author',
    url: 'url',
    likes: 2
  });
  await blog.save();
  await blog.remove();
  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((el) => el.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((el) => el.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
};