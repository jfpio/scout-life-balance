import { test } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

test('renders App without crashing', () => {
  render(<App />)
})