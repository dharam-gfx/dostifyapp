// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Define a simplified IntersectionObserver for mock purposes
class MockIntersectionObserver {
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  takeRecords(): Array<unknown> { return []; }
  unobserve(): void {}
}

// Most simple approach - just use @ts-expect-error for the mocks
// @ts-expect-error - Jest mock function
global.fetch = jest.fn();

// @ts-expect-error - Our mock doesn't fully implement the IntersectionObserver interface
global.IntersectionObserver = MockIntersectionObserver;

// This export is required to make TypeScript treat this as a module
export {};
