# JavaScript Request URI Helper

A lightweight, flexible utility to build and manage URLs across Node.js, browsers, Fastify, Fetch, and more.

Support base detection, clean chaining, and real-world support for APIs, routing, and tracking.

## Installation

```bash
npm install request-uri

# or
yarn add request-uri
```

## Available features

#### Auto-Detects base url from request context

- ✅ Node.js servers (e.g., Fastify, Express)
- ✅ Browser apps (SPA, SSR)
- ✅ Fetch/Request objects
- ✅ Custom request objects (including from proxies or middleware)

Uri automatically resolves a base URL from:

- **Browser environment** (`window.location.origin`)
- **Fastify requests** (`FastifyRequest`)
- **Fetch API `Request` objects**
- **Plain JS objects** `{ protocol, host, port }`
- **Raw string url**
- **Fallback base url** (if everything else fails)

```ts
const uri = Uri.from("/path", request); // Automatically detects base from request object
```

Set a static fallback for cases when base cannot be resolved:

```ts
Uri.fallback = "https://my-default.com";
```

Server-side set a global request object once:

```ts
Uri.setRequest(serverReqeust);
```
Build a new url with Uri
```ts
const url = Uri.from('/v0/users').setPath('/v1/users').setQuery({ limit: 10, page: 2 });

url // output: URL

url.href //https://my-default.com/v1/users?limit=10&page=2
```

### Fluent Methods

| **Method**              | **Support**      | **Description**               |
|-------------------------|------------------|-------------------------------|
| `setPath(path)`         | string\|string[] | Set or overwrite the pathname |
| `setQuery(key, value)`  | (string, any)    | Add a single query param      |
| `setQuery(obj)`         | Object           | Add multiple query params     |
| `setHost(host)`         | string           | Overwrite the host            |
| `setPort(port)`         | string           | Overwrite the port            |
| `setProtocol(protocol)` | string           | Overwrite the protocal        |


## Usage

#### Browser environment capture request with window object

Use `Uri.from()` to resolve relative URLs automatically based on `window.location`.

```ts
// Example: In the browser environment
const uri = Uri.from("/dashboard");
console.log(uri.href); // Outputs: "https://example.com/dashboard"
```

---

#### 🧩 Node.js (Express.js) – Capture Request with Middleware

Attach the request object globally using middleware:

```js
// Middleware to attach the current request to Uri
app.use((req, res, next) => {
  Uri.setRequest(req);
  next();
});
```

Now you can generate full URLs using `Uri.from()`:

```ts
app.get('/welcome', (req, res) => {
  const url1 = Uri.from('new/path/auto-base');
  const url2 = Uri.from('new/path/auto-base', req);

  res.send(`url1: ${url1} <br> url2: ${url2}`);
});
```

---

#### ⚡ Node.js (Fastify) – Capture Request with Hook

Attach the request object using a Fastify lifecycle hook:

```js
fastify.addHook('onRequest', (req, res, done) => {
  Uri.setRequest(req);
  done();
});
```

Now you can use `Uri.from()` to build URLs:

```ts
fastify.get('/welcome', (req, res) => {
  const url1 = Uri.from('new/path/auto-base');
  const url2 = Uri.from('new/path/auto-base', req);

  res.send(`url1: ${url1} <br> url2: ${url2}`);
});
```

---

#### 🌐 Custom Request Capture with Fetch API

**Set globally:**
```ts
const request = new Request("https://api.example.com/original");
Uri.setRequest(request);
```

**Or pass individually:**
```ts
const request = new Request("https://api.example.com/original");
const uri = Uri.from("/override", request);
console.log(uri.href); // "https://api.example.com/override"
```

---

#### 🛠️ Custom Raw Object for Request Simulation

**Set globally:**
```ts
Uri.setRequest({ protocol: "http", host: "localhost", port: 3000 });

// Now use Uri.from
Uri.from('/hello/world').href; // "http://localhost:3000/hello/world"
```

**Use directly with a custom object:**
```ts
const baseRequest = {
  protocol: "http",
  host: "localhost",
  port: 3000,
};

const uri = Uri.from("/local", baseRequest);
console.log(uri.href); // "http://localhost:3000/local"
```

---

#### ✏️ Uri Modification Methods

**Update the pathname:**
```ts
Uri.from('/welcome').setPath('aboutus');
// "http://localhost:3000/aboutus"
```

**Add query parameters:**
```ts
// Single query param
Uri.from('/aboutus').setQuery('message', 'good');
// "http://localhost:3000/aboutus?message=good"

// Multiple query params
Uri.from('/aboutus').setQuery({ message: 'good', count: '3' });
// "http://localhost:3000/aboutus?message=good&count=3"
```

**Overwrite host:**
```ts
Uri.from('/aboutus').setHost('example.com');
// "http://example.com:3000/aboutus"
```

**Overwrite port:**
```ts
Uri.from('/aboutus').setPort(6000);
// "http://localhost:6000/aboutus"
```

**Overwrite protocol:**
```ts
Uri.from('/aboutus').setProtocol('ws');
// "ws://localhost:3000/aboutus"
```



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

## Error Handling

Throws `Invalid URL` if it cannot resolve a base URL and `fallbackBase` is not set.

```ts
Uri.fallbackBase = undefined;
Uri.request("/will-fail"); // ❌ throws Invalid URL
```

---

## Why Use This?

If you’ve ever had to:

- Safely build URLs in both Node and the browser
- Parse requests from Fastify, Express, or Fetch
- Avoid brittle string concatenation
- Reuse base URLs with confidence

...this tiny utility saves time and avoids bugs by abstracting away the complexities of request context detection and clean URL building.


## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.


## Development

Clone and run tests:

```bash
git clone https://github.com/GoBrightApps/request-uri.git
cd request-uri
npm install
npm test
```

---

## License

MIT — open to use and modify.

---

## Acknowledgments

Inspired by real-world multi-environment apps, this utility saves you from repetitive `URL` logic whether you're inside a browser, server, or edge environment.
