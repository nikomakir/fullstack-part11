import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blogform from './Blogform'

test('creating a blog calls props callbackfunction with correct data', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  const { container } = render(<Blogform createBlog={createBlog} />)

  const inputTitle = container.querySelector('#blog-title')
  const inputAuthor = container.querySelector('#blog-author')
  const inputUrl = container.querySelector('#blog-url')
  const sendButton = screen.getByText('create')

  await user.type(inputTitle, 'nice title')
  await user.type(inputAuthor, 'SomeAuthor')
  await user.type(inputUrl, 'http')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('nice title')
  expect(createBlog.mock.calls[0][0].author).toBe('SomeAuthor')
  expect(createBlog.mock.calls[0][0].url).toBe('http')
})
