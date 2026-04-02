import "@testing-library/jest-dom";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.IntersectionObserver = IntersectionObserverMock as any;

// Mock scrollTo
window.scrollTo = () => {};

// Suppress console errors during tests (optional)
const originalError = console.error;
console.error = (...args) => {
  // Filter out known React warnings during tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('React Router'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
