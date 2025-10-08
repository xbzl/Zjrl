// zjrl_req_fix.js  -- request-side: 去掉 If-None-Match / If-Modified-Since / If-Range
(function () {
  const url = $request.url || "";
  if (!url.includes("api.rc-backup.com/v1/subscribers")) {
    $done({});
    return;
  }

  // 复制 headers 并过滤缓存相关头
  let headers = $request.headers || {};
  const blacklist = ["if-none-match","if-modified-since","if-range","if-match","if-unmodified-since"];
  let newHeaders = {};
  Object.keys(headers).forEach(k=>{
    if (blacklist.indexOf(k.toLowerCase()) === -1) {
      newHeaders[k] = headers[k];
    }
  });

  // 也可加入一个 cache-buster 查询参数（可选），但删除缓存头通常足够
  // 如果你想加 cache-buster，取消下面注释：
  // let u = new URL(url);
  // u.searchParams.set("_cb", String(Date.now()));
  // $done({ url: u.toString(), headers: newHeaders });

  $done({ headers: newHeaders });
})();
