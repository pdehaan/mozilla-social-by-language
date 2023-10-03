// curl https://mozilla.social/api/v1/timelines/public\?local\=true\&limit\=100 > mozilla.social.local.json

import sanitizeHtml from 'sanitize-html';

const SERVER = "https://mozilla.social";
const opts = { local: true, limit: 50 };
const jaOnly = (p) => p.language === "ja";

const posts = await fetchPosts("/api/v1/timelines/public", opts, jaOnly);
for (const post of posts) {
  console.log(`[${post.id}/${post.account.username}] ${sanitize(post.content)}\n`);
}

/**
 * Fetch `opts.limit` (default: 50) posts from server and filter the results using `filterFn()`.
 * @param {string} path API path.
 * @param {object} opts URLSearchParams or Object.
 * @param {Function} filterFn 
 * @returns 
 */
async function fetchPosts(path, opts = {}, filterFn = () => true) {
  const posts = [];
  let maxId;

  while (posts.length < opts.limit ?? 50) {
    const res = await api(path, { ...opts, max_id: maxId }, SERVER);
    posts.push(...res.filter(filterFn));
    maxId = res.at(-1).id;
  }
  return posts;
}

async function api(path, query = new URLSearchParams(), server = SERVER) {
  if (!query.max_id) {
    delete query.max_id;
  }

  let url = new URL(path, server);
  url.search = query instanceof URLSearchParams ? query : new URLSearchParams(query);
  return fetch(url.href).then(r => r.json());
}

function sanitize(dirty, args) {
  args ??= { allowedTags: [] };
  return sanitizeHtml(dirty, args);
}
