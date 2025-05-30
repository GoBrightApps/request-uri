# JavaScript Request URI Helper

A lightweight, flexible URL utility class that intelligently constructs and manipulates URLs across browser and server environments, including Fastify, Fetch, and custom request objects.

Supports dynamic base resolution, fluent URL building, and clean instance methods for real-world routing, API calls, and request tracking.

## 📦 Installation

```bash
npm install request-uri
```

or with Yarn:

```bash
yarn add request-uri
```

---

## 🔧 Features

### ✅ Auto-Detects Base URL From Request Context

Uri automatically resolves a base URL from:

- **Browser environment** (`window.location.origin`)
- **Fastify requests** (`FastifyRequest`)
- **Fetch API `Request` objects**
- **Plain JS objects** `{ protocol, host, port }`
- **Raw string URLs**
- **Fallback base URL** (if everything else fails)

```ts
const uri = Uri.request("/path", request); // Automatically detects base from request object
//or 
const uri = Uri.from("/path", request); // Automatically detects base from request object
```

Set a static fallback for cases when base cannot be resolved:

```ts
Uri.fallbackBase = "https://my-default.com";
```

Or set a global request object once:

```ts
Uri.setRequest(myRequest);
const uri = Uri.from("/auto-detects-base");
```

---

### 🌐 Works Everywhere

- ✅ Node.js servers (e.g., Fastify, Express)
- ✅ Browser apps (SPA, SSR)
- ✅ Fetch/Request objects
- ✅ Custom request objects (including from proxies or middleware)

---

### 🧪 Fluent API for URI Construction

Create a new `Uri` and build it with method chaining:

```ts
const uri = new Uri("https://api.example.com")
  .setPath(["v1", "users"])
  .setQuery({ limit: 10, page: 2 })
  .setPort("8080");
```

Produces:

```
https://api.example.com:8080/v1/users?limit=10&page=2
```

---

### ✍️ Fluent Methods

| Method            | Description                                |
|-------------------|--------------------------------------------|
| `setPath(path)`   | Set or overwrite the pathname (string or array) |
| `setQuery(key, value)` | Append a single query param |
| `setQuery(obj)`   | Append multiple query params |
| `setHost(host)`   | Overwrite the host                         |
| `setPort(port)`   | Overwrite the port                         |
| `setProtocol(protocol)` | Change the protocol (e.g., `https:`)     |

---

## 🔍 Usage Examples

### 🌍 In the Browser

```ts
// Inside browser (window.location.href resolves automatically)
const uri = Uri.from("/dashboard");
console.log(uri.href); // e.g., "https://example.com/dashboard"
```

### 🖥️ In nodejs Fastify

```ts
fastify.get("/example", (req, reply) => {
  const uri = Uri.request("/users", req);
  console.log(uri.href); // Uses req.protocol and req.headers.host
});
```

### 🌐 With Fetch Request Object

```ts
const request = new Request("https://api.example.com/original");
const uri = Uri.from("/override", request);
console.log(uri.href); // "https://api.example.com/override"
```

### 📦 With Custom Object

```ts
const baseRequest = {
  protocol: "http",
  host: "localhost",
  port: 3000,
};

const uri = Uri.request("/local", baseRequest);
console.log(uri.href); // "http://localhost:3000/local"
```

---

## 🧪 Testing Strategy

This package is **fully unit tested** and covers:

- All base resolution types
- All method chaining behaviors
- Edge cases like missing hosts or protocol
- Fallback behavior
- Error handling when base URL is invalid

Run tests with:

```bash
npm test
```

---

## 🚨 Error Handling

Throws `Invalid URL` if it cannot resolve a base URL and `fallbackBase` is not set.

```ts
Uri.fallbackBase = undefined;
Uri.request("/will-fail"); // ❌ throws Invalid URL
```

---

## 🧠 Why Use This?

If you’ve ever had to:

- Safely build URLs in both Node and the browser
- Parse requests from Fastify, Express, or Fetch
- Avoid brittle string concatenation
- Reuse base URLs with confidence

...this tiny utility saves time and avoids bugs by abstracting away the complexities of request context detection and clean URL building.

---

## 🔗 API Reference

### `Uri.request(path, request?)`

Creates a new `Uri` based on the dynamic context of the request.

### `Uri.from(path, request?)`

Alias for `.request()`.

### `Uri.setRequest(request)`

Set a global request context, useful in middleware.

### `Uri.fallbackBase`

Static string fallback for base resolution.

---

## 📁 TypeScript Support

Written in TypeScript, with full type definitions out of the box:

```ts
import Uri, { UriRequest } from "uri-request-builder";
```

---

## 🛠️ Development

Clone and run tests:

```bash
git clone https://github.com/GoBrightApps/request-uri.git
cd request-uri
npm install
npm test
```

---

## 📝 License

MIT — open to use and modify.

---

## 🙌 Acknowledgments

Inspired by real-world multi-environment apps, this utility saves you from repetitive `URL` logic whether you're inside a browser, server, or edge environment.
