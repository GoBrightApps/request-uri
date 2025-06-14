# JavaScript Request URI Helper

A lightweight, flexible utility to build and manage URLs across Node.js, browsers, Fastify, Fetch, and more.

Support base detection, clean chaining, and real-world support for APIs, routing, and tracking.

## Installation

```bash
npm install request-uri

# or
yarn add request-uri
```

## 🔧 Available features

#### Auto-Detects base url from request context

Uri automatically resolves a base URL from:

- **Browser environment** (`window.location.origin`)
- **Fastify requests** (`FastifyRequest`)
- **Fetch API `Request` objects**
- **Plain JS objects** `{ protocol, host, port }`
- **Raw string URLs**
- **Fallback request or base URL** (when base resolve fails)

```ts
const uri = Uri.from("/path", request); // Automatically detects base from request object
```

Set a static fallback for cases when base cannot be resolved:

```ts
Uri.fallback = "https://my-default.com";
```

Or set a global request object once:

```ts
Uri.setRequest(serverReqeust);
```


### 🌐  Everywhere

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

### ✍️ Fluent Methods

| **Method**              | **Support**      | **Description**               |
|-------------------------|------------------|-------------------------------|
| `setPath(path)`         | string\|string[] | Set or overwrite the pathname |
| `setQuery(key, value)`  | (string, any)    | Append a single query param   |
| `setQuery(obj)`         | Object           | Append multiple query params  |
| `setHost(host)`         | string           | Overwrite the host            |
| `setPort(port)`         | string           | Overwrite the port            |
| `setProtocol(protocol)` | string           | Overwrite the protocal        |


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

### Node Express request capture

Node express js request capture with middleware 
```js
app.use(function(req, res, next){

  Uri.setRequest(req);
  next();
  
});
```
Node express js request capture inside of handler 
```js
app.get('/',function(req, res){

  Uri.setRequest(req);

  res.send('Hello');
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
import Uri, { UriRequest } from "request-uri";
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
