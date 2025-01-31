const lodash = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const total = blogs.reduce((sum, blog) => sum + blog.likes, 0)
  return total
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const mostlikes = Math.max(...likes)
  const favorite = blogs.find(blog => blog.likes === mostlikes)
  return blogs.length === 0
    ? null
    : {
      title: favorite.title,
      author: favorite.author,
      likes: favorite.likes
    }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const blogsByAuthor = lodash.countBy(blogs, 'author')
  const author = Object.keys(blogsByAuthor).reduce(
    (a, b) => blogsByAuthor[a] > blogsByAuthor[b] ? a : b
  )
  return {
    author,
    blogs: blogsByAuthor[author]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likesByAuthor = lodash.mapValues(
    lodash.groupBy(blogs, 'author'), authorBlogs =>
      lodash.sumBy(authorBlogs, 'likes')
  )
  const author = Object.keys(likesByAuthor).reduce(
    (a, b) => likesByAuthor[a] > likesByAuthor[b] ? a : b
  )
  return {
    author,
    likes: likesByAuthor[author]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}