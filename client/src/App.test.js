import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Valmiki Ashram', () => {
  render(<App />);
  const brand = screen.getAllByText(/Valmiki Ashram/i);
  expect(brand.length).toBeGreaterThan(0);
});
