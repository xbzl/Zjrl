// zjrl_fix.js — 幂等版
// 说明：匹配 api.rc-backup.com/v1/subscribers* 的响应，若未包含目标订阅则注入。

(function () {
  try {
    const url = $request.url || "";
    if (!/api\.rc-backup\.com\/v1\/subscribers/.test(url)) {
      $done({});
      return;
    }

    // 解析响应体
    let body = $response && $response.body ? $response.body : null;
    if (!body) {
      $done({});
      return;
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      // 不是 JSON，直接放行
      $done({});
      return;
    }

    if (!data || !data.subscriber) {
      $done({body: JSON.stringify(data)});
      return;
    }

    // 如果已经包含了目标订阅/权限，则不再注入（幂等）
    const TARGET_PRODUCT = "com.byronyeung.cuckoo.Annual";
    const TARGET_ENTITLE = "Pro";

    const subs = data.subscriber.subscriptions || {};
    const ents = data.subscriber.entitlements || {};

    if (subs[TARGET_PRODUCT] && ents[TARGET_ENTITLE]) {
      // 已存在目标记录，直接返回原始/或稍微格式化过的 body
      $done({body: JSON.stringify(data)});
      return;
    }

    // 生成时间（ISO）
    const now = new Date().toISOString().split('.')[0] + "Z";
    const forever = "2999-09-09T09:09:09Z";

    // 注入订阅
    subs[TARGET_PRODUCT] = {
      "original_purchase_date": now,
      "purchase_date": now,
      "expires_date": forever,
      "is_sandbox": false,
      "ownership_type": "PURCHASED",
      "product_identifier": TARGET_PRODUCT,
      "store": "app_store"
    };

    // 注入权限（entitlement）
    ents[TARGET_ENTITLE] = {
      "product_identifier": TARGET_PRODUCT,
      "purchase_date": now,
      "expires_date": forever
    };

    // 赋回
    data.subscriber.subscriptions = subs;
    data.subscriber.entitlements = ents;

    // 返回修改后的响应
    $done({body: JSON.stringify(data)});
    return;
  } catch (err) {
    // 出现任何异常时，尽量不阻断原始响应
    console.log("zjrl_fix error:", err);
    $done({});
  }
})();
