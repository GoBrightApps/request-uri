import { FastifyRequest } from "fastify";

export type UriRequest =
	| FastifyRequest
	| Request
	| {
			host?: string;
			protocol?: string;
			port?: string | number;
			headers?: Record<string, string | string[] | undefined>;
	  }
	| string;

export default class Uri extends URL {
	static fallbackBase?: string;
	static #request?: UriRequest;

	static setRequest(request: UriRequest) {
		this.#request = request;
	}

	/**
	 * Attempts to resolve a base URL (origin) from various types of request.
	 * This is useful in both server-side and client-side environments to dynamically construct
	 *
	 * Supports:
	 * - Browser environments (uses `window.location.origin`)
	 * - String URLs
	 * - Fetch API Request objects
	 * - FastifyRequest and similar server request objects
	 * - Plain objects with `headers`, `protocol`, `host`, and `port` fields
	 *
	 * Falls back to a static `fallbackBase` if resolution fails.
	 */
	static #resolveBaseFromRequest(request?: UriRequest): string | undefined {
		// Use the provided request or the previously set static request
		request = request || this.#request;

		// 1. Browser environment: use window.location.origin if available
		if (typeof window !== "undefined" && window?.location?.origin) {
			return window.location.href || window.location.origin;
		}

		// 2. If the request is a string (e.g., a URL), try parsing it
		if (typeof request === "string") return request;

		// 3. If it's a Fetch API Request object, return the full URL
		if (request instanceof Request) return request.url;

		// 4. Fastify request construct base
		if (request && request.headers?.host && request.protocol) {
			return `${request.protocol}://${request.headers.host}`;
		}

		// 6. Generic object with protocol, host, and port
		if (request && typeof request === "object" && request.protocol && request.host && request.port) {
			return `${request.protocol}://${request.host}:${request.port}`;
		}

		// 7. Fallback base if no conditions are met
		return this.fallbackBase;
	}

	public setQuery(query: string | Record<string, unknown>, value?: unknown): this {
		//handle and return this if query is object
		if (typeof query === "object") {
			for (const [key, value] of Object.entries(query)) {
				this.searchParams.append(key, String(value));
			}
			return this;
		}

		this.searchParams.append(String(query), String(value));

		return this;
	}

	public setProtocol(protocol: string) {
		this.protocol = protocol;
		return this;
	}

	public setPort(port: string) {
		this.port = port;
		return this;
	}

	public setHost(host: string) {
		this.host = host;
		return this;
	}

	public setPath(path: string | string[]) {
		this.pathname = Array.isArray(path) ? path.join("/") : path;
		return this;
	}

	private static _request(path: string, request?: UriRequest) {
		const base = this.#resolveBaseFromRequest(request);
		return new this(path, base);
	}

	// Define sealed static methods internally
	static readonly request = Object.freeze(function (this: typeof Uri, path: string, request?: UriRequest) {
		return this._request(path, request);
	});

	static readonly from = Uri.request;
}

Object.defineProperty(Uri, "request", {
	writable: false,
	configurable: false,
	enumerable: true,
	value: Uri.request,
});
Object.defineProperty(Uri, "from", {
	writable: false,
	configurable: false,
	enumerable: true,
	value: Uri.from,
});
