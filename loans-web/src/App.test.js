import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login greeting', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /hola ya/i, level: 2 });
  expect(heading).toBeInTheDocument();
});
