import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import Blogform from './components/Blogform'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = (event) => {
    event.preventDefault()
    setUser(null)
    blogService.setToken(null)
    window.localStorage.clear()
    setErrorMessage('logged out')
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const blog = await blogService.create(blogObject)
      const UserID = blog.user
      blog.user = {
        id: UserID,
        username: user.username,
        name: user.name
      }
      setBlogs(blogs.concat(blog))
      setErrorMessage(`a new blog ${blog.title} by ${blog.author} added`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    } catch (exception) {
      setErrorMessage('missing title or author')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const likeBlog = async blog => {
    const likedBlog = {
      ...blog,
      user: blog.user.id,
      likes: blog.likes + 1
    }

    try {
      const newBlog = await blogService.update(blog.id, likedBlog)
      setBlogs(blogs.map(blog => blog.id !== newBlog.id
        ? blog : {
          ...newBlog,
          user: blog.user
        }))
      setErrorMessage(`${newBlog.title} liked!`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    } catch (exception) {
      setErrorMessage('Error updating like')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const deleteBlog = async blog => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      try {
        await blogService.deleteBlog(blog.id)
        setBlogs(blogs.filter(b => b.id !== blog.id))
        setErrorMessage(`${blog.title} by ${blog.author} deleted!`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      } catch (exception) {
        setErrorMessage('Error: user and blog do not match!')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }
    }
  }

  blogs.sort((a, b) => b.likes - a.likes)

  if (user === null) {
    return (
      <div>
        <Notification message={errorMessage}/>
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              data-testid="username"
              onChange={({ target }) => setUsername(target.value)}/>
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              data-testid="password"
              onChange={({ target }) => setPassword(target.value)}/>
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <Notification message={errorMessage}/>
      <h2>blogs</h2>
      <p>{user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>
      <Togglable buttonLabel='create new blog' ref={blogFormRef}>
        <Blogform createBlog={addBlog} />
      </Togglable>

      {blogs.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          handleLike={() => likeBlog(blog)}
          handleDelete={() => deleteBlog(blog)}
          showDelete={user.username === blog.user.username}
        />
      )}
    </div>
  )
}

export default App