import { describe, it, expect } from 'vitest';
import { render } from './test-utils';

// Import pages for smoke testing
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

describe('Smoke Tests - Pages render without crashing', () => {
  
  describe('Public Pages', () => {
    it('Landing page renders without crashing', () => {
      expect(() => render(<Landing />)).not.toThrow();
    });

    it('Login page renders without crashing', () => {
      expect(() => render(<Login />)).not.toThrow();
    });

    it('NotFound page renders without crashing', () => {
      expect(() => render(<NotFound />)).not.toThrow();
    });
  });

  describe('Protected Pages', () => {
    it('Dashboard page renders without crashing', () => {
      // Dashboard may redirect for guides, but should not throw
      expect(() => render(<Dashboard />)).not.toThrow();
    });
  });
});

describe('Smoke Tests - Key elements are present', () => {
  
  it('Landing page has main content', () => {
    const { container } = render(<Landing />);
    // Check that page rendered some content
    expect(container.textContent).toBeTruthy();
  });

  it('Login page has login form elements', () => {
    const { container } = render(<Login />);
    // Check for email input using querySelector
    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeInTheDocument();
  });

  it('NotFound page shows 404 message', () => {
    const { container } = render(<NotFound />);
    expect(container.textContent).toContain('404');
  });
});
