let url = $request.url;

if (/^https:\\/\\/api\\.rc-backup\\.com\\/v1\\/subscribers\\/[^/]+$/.test(url)) {
  const now = new Date().toISOString();
  const expires = \"2999-09-09T09:09:09Z\";
  const prod = \"com.byronyeung.cuckoo.Annual\";

  const subscriber = {
    original_app_user_id: \"zjrl_vip_user\",
    first_seen: now,
    subscriptions: {
      [prod]: {
        purchase_date: now,
        original_purchase_date: now,
        expires_date: expires,
        store: \"app_store\",
        product_identifier: prod,
        billing_issues_detected_at: null,
        unsubscribe_detected_at: null,
        period_type: \"normal\"
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

  const response = {
    request_date_ms: Date.now(),
    subscriber
  };

  $done({ body: JSON.stringify(response) });

} else if (/^https:\\/\\/ap-guangzhou\\.cls\\.tencentcs\\.com\\/tracklog/.test(url)) {
  $done({ body: \"{}\" });

} else {
  $done({});
}
