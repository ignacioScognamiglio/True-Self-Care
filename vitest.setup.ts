import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";
import type { AxeResults } from "axe-core";

expect.extend(axeMatchers);

declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations(): T extends AxeResults ? void : never;
  }
}
