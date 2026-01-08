import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";

const app = new Hono();
const kv = await Deno.openKv();

// 静的ファイルの配信
app.get("/", serveStatic({ path: "./index.html" }));
app.get("/*", serveStatic({ path: "./" }));

// --- API ---

// 1. ログイン (簡易版)
app.post("/api/login", async (c) => {
  const { username, password } = await c.req.json();
  // ユーザー情報を保存/照合 (本来はハッシュ化が必要)
  await kv.set(["users", username], { password });
  return c.json({ success: true, username });
});

// 2. アイテム一覧取得 (検索機能付き)
app.get("/api/items", async (c) => {
  const queryTag = c.req.query("tag");
  const iter = kv.list({ prefix: ["items"] });
  const items = [];
  for await (const res of iter) {
    if (!queryTag || res.value.tags.includes(queryTag)) {
      items.push(res.value);
    }
  }
  return c.json(items);
});

// 3. アイテム登録・更新 (IDがあれば更新)
app.post("/api/items", async (c) => {
  const item = await c.req.json();
  const id = item.id || crypto.randomUUID();
  const newItem = { ...item, id };
  await kv.set(["items", id], newItem);
  return c.json(newItem);
});

// 4. アイテム削除
app.delete("/api/items/:id", async (c) => {
  const id = c.req.param("id");
  await kv.delete(["items", id]);
  return c.json({ success: true });
});

Deno.serve(app.fetch);