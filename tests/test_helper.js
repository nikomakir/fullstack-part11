const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  }
]

const createUserAndToken = async () => {
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'testu', name: 'testUser', passwordHash })

  await user.save()

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  return jwt.sign(userForToken, process.env.SECRET)
}

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'willremovethissoon',
    url: 'abc'
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  createUserAndToken
}
