/* eslint-disable no-console */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../../lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs(); // Yeh ensure karega ke env variables wapas apni original state mein aa jayein
  });

  it("should format and output logs correctly depending on environment", () => {
    // Vitest ka built-in tareeqa environment set karne ke liye
    vi.stubEnv("NODE_ENV", "development");

    logger.info("info message", { userId: "123" });
    expect(console.log).toHaveBeenCalledWith("[INFO] info message", '{"userId":"123"}');

    logger.warn("warning message");
    expect(console.warn).toHaveBeenCalledWith("[WARN] warning message", "");

    const testError = new Error("test error");
    logger.error("error message", testError, { action: "test" });
    expect(console.error).toHaveBeenCalledWith("[ERROR] error message", testError.stack || testError.message, '{"action":"test"}');

    logger.debug("debug message");
    expect(console.debug).toHaveBeenCalledWith("[DEBUG] debug message", "");
  });
});