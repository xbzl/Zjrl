let url = $request.url;
if (/^https:\/\/api\.rc-backup\.com\/v1\/subscribers\/[^\/]+$/.test(url)) {
  let now = new Date().toISOString();
  let expires = new Date(Date.now() + 31536000000).toISOString(); 
  let prod = "com.byronyeung.cuckoo.Annual"; 
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
      all_features: {
        product_identifier: prod,
        purchase_date: now,
        original_purchase_date: now,
        expires_date: expires
      }
    }
  };
  $done({body: JSON.stringify({ request_date_ms: Date.now(), subscriber: subscriber })});
} else {
  $done({});
}
