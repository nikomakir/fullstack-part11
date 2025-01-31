import { useState } from 'react'
import PropTypes from 'prop-types'


const Blog = ({ blog, handleLike, handleDelete, showDelete }) => {
  const [fullView, setFullView] = useState(false)

  const toggleView = () => {
    setFullView(!fullView)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle} data-testid='blog'>
      <div>
        {blog.title} {blog.author} <button onClick={toggleView}>{fullView ? 'hide' : 'view'}</button>
      </div>
      {fullView &&
      (<div>
        <p>{blog.url}</p>
        <p>likes {blog.likes} <button onClick={handleLike}>like</button></p>
        <p>{blog.user.name}</p>
        <p>
          {showDelete &&
          <button onClick={handleDelete}>remove</button>}
        </p>
      </div>)}
    </div>
  )}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  handleLike: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  showDelete: PropTypes.bool.isRequired
}

export default Blog