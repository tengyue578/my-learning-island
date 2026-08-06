import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
});

afterEach(() => cleanup());
