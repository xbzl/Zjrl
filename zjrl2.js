// 匹配订阅者请求路径
let url = $request.url;
if (/^https:\/\/api\.rc-backup\.com\/v1\/subscribers\/[^\/]+$/.test(url)) {
  // 构造订阅者 JSON
  let now = new Date().toISOString();
  let expires = new Date(Date.now() + 31536000000).toISOString(); // 有效期 +1年
  let prod = "com.byronyeung.cuckoo.Annual"; // 订阅产品ID
  let idMatch = url.match(/\/subscribers\/([^\/]+)$/);
  let originalId = idMatch ? idMatch[1] : "";
  let subscriber = {
    original_app_user_id: originalId,
    first_seen: now,
    subscriptions: {
      [prod]: {
        purchase_date: now,
        original_purchase_date: now,
        expires_date: expires,
        store: "app_store",
        product_identifier: prod,
        billing_issues_detected_at: null,
        unsubscribe_detected_at: null,
        period_type: "normal"
      }
    },
    entitlements: {
      // 根据 App 的实际 entitlement 名称修改下行 key（例如 "all_features"）
      all_features: {
        product_identifier: prod,
        purchase_date: now,
        original_purchase_date: now,
        expires_date: expires
      }
    }
  };
  // 返回修改后的完整响应 JSON
  $done({body: JSON.stringify({ request_date_ms: Date.now(), subscriber: subscriber })});
} else {
  $done({});
}
