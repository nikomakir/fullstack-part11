import { useState } from 'react'

const Blogform = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title,
      author,
      url
    })

    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={addBlog}>
        <div>
        title:
          <input
            type='text'
            value={title}
            id='blog-title'
            onChange={event => setTitle(event.target.value)}
          />
        </div>
        <div>
        author:
          <input
            type='text'
            value={author}
            id='blog-author'
            onChange={event => setAuthor(event.target.value)}
          />
        </div>
        <div>
        url:
          <input
            type='text'
            value={url}
            id='blog-url'
            onChange={event => setUrl(event.target.value)}
          />
        </div>
        <button type='submit'>create</button>
      </form>
    </>
  )
}

export default Blogform