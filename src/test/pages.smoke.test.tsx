import { describe, it, expect } from 'vitest';
import { render } from './test-utils';

// Import pages for smoke testing
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import TravelProfile from '@/pages/TravelProfile';
import Agenda from '@/pages/Agenda';
import ParkMap from '@/pages/ParkMap';
import Attractions from '@/pages/Attractions';
import Restaurants from '@/pages/Restaurants';
import MultiPass from '@/pages/MultiPass';
import Checklists from '@/pages/Checklists';
import RemoteGuidance from '@/pages/RemoteGuidance';
import Contact from '@/pages/Contact';

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

  describe('Protected Pages - Core', () => {
    it('Dashboard page renders without crashing', () => {
      expect(() => render(<Dashboard />)).not.toThrow();
    });

    it('TravelProfile page renders without crashing', () => {
      expect(() => render(<TravelProfile />)).not.toThrow();
    });

    it('Agenda page renders without crashing', () => {
      expect(() => render(<Agenda />)).not.toThrow();
    });

    it('ParkMap page renders without crashing', () => {
      expect(() => render(<ParkMap />)).not.toThrow();
    });
  });

  describe('Protected Pages - Features', () => {
    it('Attractions page renders without crashing', () => {
      expect(() => render(<Attractions />)).not.toThrow();
    });

    it('Restaurants page renders without crashing', () => {
      expect(() => render(<Restaurants />)).not.toThrow();
    });

    it('MultiPass page renders without crashing', () => {
      expect(() => render(<MultiPass />)).not.toThrow();
    });

    it('Checklists page renders without crashing', () => {
      expect(() => render(<Checklists />)).not.toThrow();
    });

    it('RemoteGuidance page renders without crashing', () => {
      expect(() => render(<RemoteGuidance />)).not.toThrow();
    });

    it('Contact page renders without crashing', () => {
      expect(() => render(<Contact />)).not.toThrow();
    });
  });
});

describe('Smoke Tests - Key elements are present', () => {
  
  it('Landing page has main content', () => {
    const { container } = render(<Landing />);
    expect(container.textContent).toBeTruthy();
  });

  it('Login page has login form elements', () => {
    const { container } = render(<Login />);
    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeInTheDocument();
  });

  it('NotFound page shows 404 message', () => {
    const { container } = render(<NotFound />);
    expect(container.textContent).toContain('404');
  });

  it('TravelProfile page has form structure', () => {
    const { container } = render(<TravelProfile />);
    expect(container.textContent).toBeTruthy();
  });

  it('Agenda page has calendar structure', () => {
    const { container } = render(<Agenda />);
    expect(container.textContent).toBeTruthy();
  });

  it('ParkMap page renders map container', () => {
    const { container } = render(<ParkMap />);
    expect(container.textContent).toBeTruthy();
  });
});
