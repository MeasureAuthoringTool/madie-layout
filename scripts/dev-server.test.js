const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { createStaticServer } = require("./dev-server");

test("serves rebuilt assets with CORS without serving stale or unsafe paths", async () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "madie-layout-server-")
  );
  const filename = path.join(directory, "bundle.js");
  const publicDirectory = path.join(directory, "public");
  fs.mkdirSync(publicDirectory);
  fs.writeFileSync(path.join(publicDirectory, "font.woff2"), "test font");
  fs.writeFileSync(path.join(publicDirectory, "font.otf"), "test font");
  const assetPath = "/" + path.basename(filename);
  const host = "localhost";
  let ready = false;
  const server = createStaticServer(directory, () => ready, publicDirectory);
  await new Promise((resolve) => server.listen(0, "localhost", resolve));
  const request = (url, method = "GET") =>
    new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: host,
          port: server.address().port,
          path: url,
          method,
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () =>
            resolve({ status: res.statusCode, headers: res.headers, body })
          );
        }
      );
      req.on("error", reject);
      req.end();
    });
  try {
    fs.writeFileSync(filename, "System.register([]);");
    assert.equal((await request(assetPath)).status, 503);
    ready = true;
    const response = await request(`${assetPath}?version=1`);
    assert.equal(response.status, 200);
    assert.equal(response.body, "System.register([]);");
    assert.equal(response.headers["access-control-allow-origin"], "*");
    assert.equal(response.headers["cache-control"], "no-store");
    assert.match(response.headers["content-type"], /javascript/);
    const font = await request("/public/font.woff2");
    assert.equal(font.status, 200);
    assert.equal(font.headers["content-type"], "font/woff2");
    assert.equal(font.body, "test font");
    assert.equal(
      (await request("/public/font.otf")).headers["content-type"],
      "font/otf"
    );
    assert.equal((await request("/public/../bundle.js")).status, 403);
    fs.writeFileSync(filename, "System.register(['react']);");
    assert.equal(
      (await request(assetPath)).body,
      "System.register(['react']);"
    );
    ready = false;
    assert.equal((await request(assetPath)).status, 503);
    ready = true;
    assert.equal((await request("/missing.js")).status, 404);
    assert.equal((await request("/%2e%2e/package.json")).status, 403);
    assert.equal((await request("/%00")).status, 400);
    assert.equal((await request("/%ZZ")).status, 400);
    assert.equal((await request(assetPath, "POST")).status, 405);
    assert.equal((await request(assetPath, "OPTIONS")).status, 204);
    const head = await request(assetPath, "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body, "");
    assert.equal(
      Number(head.headers["content-length"]),
      Buffer.byteLength("System.register(['react']);")
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
