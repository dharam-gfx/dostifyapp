import { render } from '@testing-library/react';
import { describe, it } from '@jest/globals';
import Footer from '@/components/footer/Footer';

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    // You would typically check for elements to be present in the DOM
    // This is just a sample test
  });

  // Add more test cases as needed
});
