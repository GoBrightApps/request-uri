import type { FastifyRequest } from "fastify";

/**
 * Checks if a value is a plain object (i.e., not an array, function, null, etc.).
 *
 * @returns True if value is a plain object (optionally with keys), false otherwise.
 */
export function isObject(value: unknown, strict = false): value is Record<string, unknown> {
	const isObjectLike = typeof value === "object" && value !== null && !Array.isArray(value);

	if (!isObjectLike) return false;

	return strict ? Object.keys(value as object).length > 0 : true;
}

/**
 * Makes properties of an object read-only.
 *
 * @param o The object on which to define or modify properties.
 * @param p A single property key or an array of property keys to make read-only.
 * @returns The object with the specified properties made read-only.
 * @throws {TypeError} If `o` is not an object or `null`.
 */
export function readonly<T extends object>(o: T, p: PropertyKey | PropertyKey[]): T {
	//
	const keysToProcess = Array.isArray(p) ? p : [p];

	for (const key of keysToProcess) {
		// Only apply if the property actually exists on the object
		// This prevents creating new, non-writable properties accidentally
		if (Object.prototype.hasOwnProperty.call(o, key)) {
			//
			Object.defineProperty(o, key, {
				writable: false,
				configurable: false,
				enumerable: true,
				value: o[key as keyof T], // Type assertion for safety
			});
		}
	}

	return o; // Return the modified object for chaining or direct use
}

export type CustomRequest = {
	host?: string;
	protocol?: string;
	port?: string | number;
	headers?: Record<string, string | string[] | undefined>;
};

export type UriRequest = FastifyRequest | Request | CustomRequest | string;

//Uri helper class
export class UriHelper extends URL {
	//

	/**
	 * @deprecated Use `Uri.fallback` instead. This will be removed in future versions.
	 */
	static get fallbackBase(): string | undefined {
		return this.fallback;
	}
	static set fallbackBase(value: string | undefined) {
		this.fallback = value;
	}

	/** Used as the fallback base URL when none is provided. */
	static fallback?: string;

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
}

export default class Uri extends UriHelper {
	//

	/** Request object for internal use. */
	static #_request?: UriRequest;

	/**
	 * Sets the default request object used to resolve the URI base.
	 *
	 * @param {UriRequest} request The request object.
	 */
	static setRequest(request: UriRequest) {
		this.#_request = request;
	}

	/**
	 * Get the default request object.
	 */
	protected static getRequest() {
		return this.#_request;
	}

	/**
	 * Get base url from request or fallback.
	 */
	static getBase(request?: UriRequest): string | undefined {
		// Use the provided request or the previously set static request
		request = request || this.getRequest();

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
	 * Creates a new Uri instance from a path and optional request.
	 */
	static get(path: string, request?: UriRequest): Uri {
		return new this(path, this.getBase(request));
	}

	/**
	 * Public interface to create a Uri instance.
	 */
	static from(path: string, request?: UriRequest): Uri {
		return this.get(path, request);
	}

	/** Alise for Uri.get */
	static request = this.get;
}

readonly(Uri, ["from", "get", "getBase", "getRequest", "setRequest", "request"]);
