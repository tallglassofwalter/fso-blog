const _ = require('lodash');
const inert = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, el) => {
    return sum + el.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  let mostLikes = 0;
  let blog = null;
  blogs.forEach((el) => {
    if (el.likes > mostLikes) {
      mostLikes = el.likes;
      blog = el;
    }
  });
  return blog;
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return undefined;

  const authors = _.countBy(blogs, 'author');
  let max = 0;
  let author = null;
  _.forEach(authors, (v,k) => {
    if (v > max) {
      max = v;
      author = k;
    }
  });
  return { author, blogs: max };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return;
  if (blogs.length === 1) return { 'author': blogs[0].author, 'likes': blogs[0].likes };
  let sums = {};
  blogs.forEach((el) => {
    if (!sums[el['author']]) sums[el['author']] = el.likes;
    else sums[el['author']]++;
  });
  let max = { 'author': null, 'likes': 0 };
  for (let key in sums) {
    if (sums[key] > max['likes']) {
      max['author'] = key;
      max['likes'] = sums[key];
    }
  }
  return max;
};

module.exports = { inert, totalLikes, favoriteBlog, mostBlogs, mostLikes };