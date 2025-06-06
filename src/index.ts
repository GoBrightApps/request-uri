import type { FastifyRequest } from "fastify";

export type CustomRequest = {
	host?: string;
	protocol?: string;
	port?: string | number;
	headers?: Record<string, string | string[] | undefined>;
};

export type UriRequest = FastifyRequest | Request | CustomRequest | string;

export default class Uri extends URL {
	/** Used as the fallback base URL when none is provided. */
	static fallbackBase?: string;

	/** Request object for internal use. */
	static #request?: UriRequest;

	/**
	 * Sets the default request object used to resolve the URI base.
	 *
	 * @param {UriRequest} request The request object.
	 */
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

	/**
	 * Appends query parameters to the URI.
	 * @param {string | Record<string, unknown>} query The key or key-value map.
	 * @param {unknown} [value] The value if a single key is provided.
	 */
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

	/**
	 * Sets the URI protocol.
	 * @param {string} protocol Protocol string (e.g., "https").
	 */
	public setProtocol(protocol: string) {
		this.protocol = protocol;
		return this;
	}

	/**
	 * Sets the URI port.
	 * @param {string} port Port number as string.
	 */
	public setPort(port: string) {
		this.port = port;
		return this;
	}

	/**
	 * Sets the URI host.
	 * @param {string} host Hostname.
	 */
	public setHost(host: string) {
		this.host = host;
		return this;
	}

	/**
	 * Sets the URI path.
	 * @param {string | string[]} path Path string or array.
	 */
	public setPath(path: string | string[]) {
		this.pathname = Array.isArray(path) ? path.join("/") : path;
		return this;
	}

	/**
	 * Creates a new Uri instance from a path and optional request.
	 * @param {string} path The relative or absolute path.
	 * @param {UriRequest} [request] Optional request object.
	 * @returns {Uri} New Uri instance.
	 */
	private static _request(path: string, request?: UriRequest): Uri {
		const base = this.#resolveBaseFromRequest(request);
		return new this(path, base);
	}

	/**
	 * Public interface to create a Uri instance.
	 * @param {string} path Path string.
	 * @param {UriRequest} [request] Optional request object.
	 * @returns {Uri} New Uri instance.
	 */
	static readonly request = Uri._request;

	/** Alias for `request`. */
	static readonly from = Uri._request;
}

// Make `request` method immutable and enumerable on Uri.
Object.defineProperty(Uri, "request", {
	writable: false,
	configurable: false,
	enumerable: true,
	value: Uri.request,
});

// Make `from` alias immutable and enumerable on Uri.
Object.defineProperty(Uri, "from", {
	writable: false,
	configurable: false,
	enumerable: true,
	value: Uri.from,
});
