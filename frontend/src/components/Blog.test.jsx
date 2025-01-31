import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'


test('blog renders title but not url or likes by default', () => {
  const blog = {
    title: 'Testing is easy',
    author: 'Me',
    url: 'http://localhost:3003',
    likes: 0,
    user: {
      name: 'SomeUser'
    }
  }

  render(<Blog
    blog={blog}
    handleLike={() => null}
    handleDelete={() => null}
    showDelete={false}
  />)

  screen.getByText('Testing is easy Me')

  const elementOne = screen.queryByText('http://localhost:3003')
  const elementTwo = screen.queryByText('likes 0')
  expect(elementOne).toBeNull()
  expect(elementTwo).toBeNull()
})

test('blog renders url, likes and user after show is clicked', async () => {
  const blog = {
    title: 'Testing is easy',
    author: 'Me',
    url: 'http://localhost:3003',
    likes: 0,
    user: {
      name: 'SomeUser'
    }
  }

  render(<Blog
    blog={blog}
    handleLike={() => null}
    handleDelete={() => null}
    showDelete={false}
  />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  screen.getByText('http://localhost:3003')
  screen.getByText('likes 0')
  screen.getByText('SomeUser')
})

test('clicking like twice calls handleLike function twice', async () => {
  const blog = {
    title: 'Testing is easy',
    author: 'Me',
    url: 'http://localhost:3003',
    likes: 0,
    user: {
      name: 'SomeUser'
    }
  }

  const mockLike = vi.fn()

  render(<Blog
    blog={blog}
    handleLike={mockLike}
    handleDelete={() => null}
    showDelete={false}
  />)

  const user = userEvent.setup()
  const toggleFullView = screen.getByText('view')
  await user.click(toggleFullView)

  const like = screen.getByText('like')
  await user.click(like)
  await user.click(like)

  expect(mockLike.mock.calls).toHaveLength(2)
})
