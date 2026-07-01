export function mockDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
