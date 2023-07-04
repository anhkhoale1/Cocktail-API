import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

test('renders the App component', () => {
  const { getByText } = render(<App />);
  
  // Check if a specific text is present in the component
  const titleElement = getByText('Cocktails api');
  expect(titleElement).toBeInTheDocument();
});