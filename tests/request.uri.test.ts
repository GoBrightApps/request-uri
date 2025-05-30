/* eslint-disable @typescript-eslint/no-explicit-any */
import Uri from "../src/index";

describe("Requst Uri class", () => {
	/**
	 * window.location.origin
	 *
	 */

	describe("window.location.origin", () => {
		// ✅ Sets up a full browser-like environment with `window.location.origin` and `href`
		beforeEach(() => {
			(global as any).window = {
				location: {
					origin: "https://example.com",
					href: "https://example.com/path",
				},
			};
		});

		afterEach(() => {
			// 🧹 Clean up the global `window` object after each test
			delete (global as any).window;
		});

		// ✅ Test: Should resolve base using `window.location.href` when running in a browser
		it("should use window.location.href as base in browser environment", () => {
			const uri = Uri.from("/test");
			expect(uri.href).not.toBe("https://example.com/path/test");
			expect(uri.href).toBe("https://example.com/test");
		});

		// ✅ Test: Should still use `origin` if `href` is missing (fallback scenario)
		it("should fallback to origin if href is missing", () => {
			(global as any).window = {
				location: {
					origin: "https://fallback.com",
				},
			};

			const uri = Uri.from("/fallback");
			expect(uri.href.startsWith("https://fallback.com")).toBe(true);
		});

		// ✅ Test: Should gracefully fail and fall through if `window.location` is undefined
		it("should fall through if window.location is undefined", () => {
			(global as any).window = {}; // no location

			Uri.fallbackBase = "https://default.com";
			const uri = Uri.from("/default");
			expect(uri.origin).toBe("https://default.com");
		});

		// ✅ Test: Should throw if `window` is defined but both `href` and fallbackBase are missing
		it("should throw if window.location.href and fallbackBase are missing", () => {
			delete (global as any).window;
			Uri.fallbackBase = undefined;
			expect(() => Uri.from("/should-throw")).toThrow("Invalid URL");
		});
	});

	/**
	 * Tests for Fastify-like request object handling in Uri.request()
	 */
	describe("Fastify request uri", () => {
		// ✅ Basic FastifyRequest with protocol and headers.host
		it("should use FastifyRequest-like object with protocol and host", () => {
			const req: any = {
				protocol: "https",
				hostname: "fastify.example.com",
				headers: { host: "fastify.example.com" },
			};
			const uri = Uri.request("/abc", req);
			expect(uri.origin).toBe("https://fastify.example.com");
		});

		// ✅ FastifyRequest with port
		it("should construct origin using protocol, host, and port", () => {
			const req: any = {
				protocol: "http",
				host: "localhost",
				port: 3000,
			};
			const uri = Uri.request("/local", req);
			expect(uri.origin).toBe("http://localhost:3000");
		});

		// Missing host and fallback
		it("should fallback to fallbackBase if host can't be resolved", () => {
			const req: any = {
				headers: {},
			};
			Uri.fallbackBase = "https://fallback.fastify.com";
			const uri = Uri.request("/fallback", req);
			expect(uri.origin).toBe("https://fallback.fastify.com");
		});

		// Throws if request is malformed and no fallback is set
		it("should throw if base cannot be resolved and no fallback is set", () => {
			const req: any = {};
			Uri.fallbackBase = undefined;
			expect(() => Uri.request("/fail", req)).toThrow("Invalid URL");
		});
	});

	/**
	 * Tests for Fetch API Request object handling in Uri.request()
	 */
	describe("Fetch Request object uri", () => {
		// ✅ Basic usage of Fetch Request object
		it("should use Fetch Request object url", () => {
			const req = new Request("https://fetch.example.com/test");
			const uri = Uri.request("/endpoint", req);
			expect(uri.origin).toBe("https://fetch.example.com");
		});

		// ✅ Ensures full path is overridden with provided path
		it("should override path from Request object with given path", () => {
			const req = new Request("https://fetch.example.com/api/data");
			const uri = Uri.request("/new-path", req);
			expect(uri.href).toBe("https://fetch.example.com/new-path");
		});

		// ✅ Works with URL including port
		it("should parse Request with port in URL", () => {
			const req = new Request("http://localhost:8080/some/path");
			const uri = Uri.request("/replaced", req);
			expect(uri.origin).toBe("http://localhost:8080");
			expect(uri.pathname).toBe("/replaced");
		});

		// ✅ Works with https and query parameters
		it("should ignore query string from original request and use only new path", () => {
			const req = new Request("https://api.example.com/users?search=test");
			const uri = Uri.request("/v2", req);
			expect(uri.href).toBe("https://api.example.com/v2");
		});

		// ✅ Handles non-standard but valid URL objects in Request
		it("should accept Request objects with custom base", () => {
			const baseUrl = "https://custom.example.org/base";
			const req = new Request(baseUrl);
			const uri = Uri.request("/adjusted", req);
			expect(uri.origin).toBe("https://custom.example.org");
			expect(uri.pathname).toBe("/adjusted");
		});
	});

	/**
	 * Tests for Uri resolution from direct string URL or fallback base.
	 * Covers:
	 * - Raw string as base URL
	 * - Fallback mechanism via `Uri.fallbackBase`
	 */
	describe("domain and raw string uri", () => {
		// ✅ Uses string as base URI directly
		it("should use string request as base", () => {
			const url = "https://mydomain.com";
			const uri = Uri.from("/path", url);
			expect(uri.origin).toBe(url);
		});

		// ✅ Uses fallbackBase if no request is provided and no environment resolves
		it("should fallback to fallbackBase when base cannot be resolved", () => {
			Uri.fallbackBase = "https://fallback.com";
			expect(() => Uri.request("/path")).not.toThrow();
			const uri = Uri.request("/path");
			expect(uri.origin).toBe("https://fallback.com");
		});

		// ✅ Throws an error if nothing can be resolved and fallbackBase is not set
		it("should throw error if base cannot be resolved and no fallbackBase set", () => {
			// Clear fallbackBase before test
			Uri.fallbackBase = undefined;
			expect(() => Uri.request("/path")).toThrow("Invalid URL");
		});
	});

	/**
	 * Instance method testing for Uri class
	 *
	 * Validates behavior of dynamic URI manipulation methods
	 */
	describe("instance methods", () => {
		let uri: Uri;

		beforeEach(() => {
			// Instantiate a base Uri before each test
			uri = new Uri("https://example.com");
		});

		// ✅ Test appending query using string key and value
		test("setQuery appends key-value pair when given string and value", () => {
			uri.setQuery("foo", "bar");
			expect(uri.searchParams.get("foo")).toBe("bar");
		});

		// ✅ Test appending multiple query params from object
		test("setQuery appends multiple key-values when given object", () => {
			uri.setQuery({ a: "1", b: "2" });
			expect(uri.searchParams.get("a")).toBe("1");
			expect(uri.searchParams.get("b")).toBe("2");
		});

		// ✅ Test protocol setting
		test("setProtocol sets protocol and returns this", () => {
			const ret = uri.setProtocol("https:");
			expect(uri.protocol).toBe("https:");
			expect(ret).toBe(uri);
		});

		// ✅ Test port setting
		test("setPort sets port and returns this", () => {
			const ret = uri.setPort("8080");
			expect(uri.port).toBe("8080");
			expect(ret).toBe(uri);
		});

		// ✅ Test host setting
		test("setHost sets host and returns this", () => {
			const ret = uri.setHost("example.org");
			expect(uri.host).toBe("example.org");
			expect(ret).toBe(uri);
		});

		// ✅ Test pathname update with string input
		test("setPath sets pathname from string and returns this", () => {
			const ret = uri.setPath("/newpath");
			expect(uri.pathname).toBe("/newpath");
			expect(ret).toBe(uri);
		});

		// ✅ Test pathname update with array input
		test("setPath sets pathname from array and returns this", () => {
			const ret = uri.setPath(["foo", "bar"]);
			expect(uri.pathname).toBe("/foo/bar");
			expect(ret).toBe(uri);
		});
	});
});
