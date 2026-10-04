import { describe, it, expect, afterEach } from "vitest";
import { getRobotsRules } from "../robots";

describe("getRobotsRules", () => {
  const originalEnv = process.env.NEXT_PUBLIC_ALLOW_INDEXING;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    } else {
      process.env.NEXT_PUBLIC_ALLOW_INDEXING = originalEnv;
    }
  });

  describe("pure options argument", () => {
    it("returns allow: '/' when allowIndexing is undefined", () => {
      const rules = getRobotsRules({ allowIndexing: undefined });
      expect(rules).toEqual({
        userAgent: "*",
        allow: "/",
      });
    });

    it("returns disallow: '/' when allowIndexing is explicitly 'false'", () => {
      const rules = getRobotsRules({ allowIndexing: "false" });
      expect(rules).toEqual({
        userAgent: "*",
        disallow: "/",
      });
    });

    it("returns allow: '/' when allowIndexing is 'true'", () => {
      const rules = getRobotsRules({ allowIndexing: "true" });
      expect(rules).toEqual({
        userAgent: "*",
        allow: "/",
      });
    });

    it("returns allow: '/' for arbitrary non-'false' strings", () => {
      const rules = getRobotsRules({ allowIndexing: "1" });
      expect(rules).toEqual({
        userAgent: "*",
        allow: "/",
      });
    });
  });

  describe("environment variable fallback", () => {
    it("defaults to allow all when NEXT_PUBLIC_ALLOW_INDEXING is unset", () => {
      delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
      const rules = getRobotsRules();
      expect(rules).toEqual({
        userAgent: "*",
        allow: "/",
      });
    });

    it("disallows all when NEXT_PUBLIC_ALLOW_INDEXING is set to 'false'", () => {
      process.env.NEXT_PUBLIC_ALLOW_INDEXING = "false";
      const rules = getRobotsRules();
      expect(rules).toEqual({
        userAgent: "*",
        disallow: "/",
      });
    });

    it("allows all when NEXT_PUBLIC_ALLOW_INDEXING is set to 'true'", () => {
      process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
      const rules = getRobotsRules();
      expect(rules).toEqual({
        userAgent: "*",
        allow: "/",
      });
    });
  });
});
