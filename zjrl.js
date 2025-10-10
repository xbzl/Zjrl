let url = $request.url;
if (url.includes("api.rc-backup.com/v1/subscribers")) {
    try {
        let data = JSON.parse($response.body);
        if (data && data.subscriber) {
            let now = new Date().toISOString().split('.')[0] + "Z";
            data.subscriber.subscriptions = {
                "com.byronyeung.cuckoo.Annual": {
                    "original_purchase_date": now,
                    "purchase_date": now,
                    "expires_date": "2999-09-09T09:09:09Z",
                    "is_sandbox": false,
                    "ownership_type": "PURCHASED",
                    "product_identifier": "com.byronyeung.cuckoo.Annual",
                    "store": "app_store"
                }
            };
            data.subscriber.entitlements = {
                "Pro": {
                    "product_identifier": "com.byronyeung.cuckoo.Annual",
                    "purchase_date": now,
                    "expires_date": "2999-09-09T09:09:09Z"
                }
            };
            $done({body: JSON.stringify(data)});
            return;
        }
    } catch (e) {
        // 如果解析失败，返回原始响应
        console.log("zjrl_fix.js error:", e);
    }
}
$done();
