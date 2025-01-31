const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const api = supertest(app)

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  token = await helper.createUserAndToken()
  const user = await User.findOne({ username: 'testu' })
  const blogs = helper.initialBlogs.map(blog => ({...blog, user: user._id }))
  await Blog.insertMany(blogs)
})

describe('get blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are the correct number of blogs', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('returned blog has attribute id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    blogs.forEach(blog => {
      assert(Object.prototype.hasOwnProperty.call(blog, 'id'))
      assert(!Object.prototype.hasOwnProperty.call(blog, '_id'))
    })
  })
})

describe('posting a blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

    assert(contents.includes('Type wars'))
  })

  test('posting a blog with no likes sets likes to 0', async () => {
    await Blog.deleteMany({})
    const newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const returnedBlogs = response.body

    assert(Object.prototype.hasOwnProperty.call(returnedBlogs[0], 'likes'))
    assert.strictEqual(returnedBlogs[0].likes, 0)
  })

  test('posting a blog without a title returnes bad request', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 2
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('posting a blog without a url returnes bad request', async () => {
    const newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      likes: 2
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('posting a blog without token returns 401 status', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('deleting a blog', () => {
  test('deleting an existing blog returns status 204', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })
})

describe('updating a blog', () => {
  test('update an existing blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate= blogsAtStart[0]
    const likesBeforeUpdate = blogToUpdate.likes

    const updatedBlog = {
      ...blogToUpdate,
      likes: likesBeforeUpdate + 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const newBlogs = await helper.blogsInDb()
    const wantedBlog = newBlogs.find(blog => blog.id === blogToUpdate.id)

    assert.strictEqual(likesBeforeUpdate + 1, wantedBlog.likes)
  })

  test('update with nonexisting id returns status 400', async () => {
    const nonexistingId = await helper.nonExistingId()
    const updatedBlog =   {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 8
    }

    await api
      .put(`/api/blogs/${nonexistingId}`)
      .send(updatedBlog)
      .expect(400)
    
    const blogsInDb = await helper.blogsInDb()
    const blogBeforeUpdate = blogsInDb.find(blog => blog.title === 'React patterns')

    assert(updatedBlog.likes !== blogBeforeUpdate.likes)
  })
})

after(async () => {
  await mongoose.connection.close()
})
