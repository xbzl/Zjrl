/*
 *
 * 脚本功能：追剧日历-终极修复版
 * 修正了对 App 主应用 API 的拦截范围，覆盖 api.thinkofuture.com 下的所有路径。
 *
 *******************************

[rewrite_local]
# 1. 订阅接口（解决重新登录时生效）：
^https?:\/\/api.rc-backup.com\/v1\/subscribers\/identify url script-response-body https://raw.githubusercontent.com/xbzl/Zjrl/refs/heads/main/zjrl.js

# 2. 【终极拦截】App 用户状态接口：覆盖整个 api.thinkofuture.com 域名
^https?:\/\/api\.thinkofuture\.com\/.* url script-response-body https://raw.githubusercontent.com/xbzl/Zjrl/refs/heads/main/zjrl.js

[mitm]
hostname = api.rc-backup.com, api.thinkofuture.com

*/

// ===================================
// JavaScript 代码区域：核心解锁逻辑
// ===================================

let body = $response.body;

try {
    let obj = JSON.parse(body);

    // 伪造超长有效期常量
    const FAKE_EXPIRY_DATE_RC = "2999-09-09T09:09:09Z";
    const FAKE_EXPIRY_DATE_APP = "2999-09-09"; 
    const FAKE_EXPIRY_DATE_MS = 4102416000000;

    // 逻辑 1：处理 RevenueCat 订阅接口 (api.rc-backup.com)
    if ($request.url.includes('api.rc-backup.com/')) { // 匹配更宽泛，确保命中
        
        const subscription_data = {
            "com.byronyeung.cuckoo.Annual": {
                "expires_date": FAKE_EXPIRY_DATE_RC, 
                "original_purchase_date": "2025-07-20T03:57:44Z",
                "is_sandbox": false,
                "period_type": "normal", 
                "purchase_date": "2025-07-20T03:57:43Z",
                "ownership_type": "PURCHASED",
                "store": "app_store",
            }
        };

        const entitlement_data = {
            "Pro": {
                "purchase_date": "2025-07-20T03:57:43Z",
                "product_identifier": "com.byronyeung.cuckoo.Annual",
                "expires_date": FAKE_EXPIRY_DATE_RC
            }
        };
        
        if (obj.subscriber) {
            obj.subscriber.subscriptions = subscription_data;
            obj.subscriber.entitlements = entitlement_data;
            obj.subscriber.active_entitlements = ["Pro"]; 
        }

        console.log("✅ 追剧日历脚本：已修改 RevenueCat 订阅状态");
        
    // 逻辑 2：处理 App 主应用接口 (api.thinkofuture.com/所有路径)
    } else if ($request.url.includes('api.thinkofuture.com/')) { 
        
        // 只有当响应结构包含 'data' 字段时，才尝试修改用户状态
        if (obj.data) {
            
            // 常用 VIP 字段的伪造
            obj.data.is_vip = true;
            obj.data.is_pro = 1;
            obj.data.level = 1;      
            
            // VIP 有效期相关字段
            obj.data.expire_date = FAKE_EXPIRY_DATE_APP;
            obj.data.vip_end_time = FAKE_EXPIRY_DATE_APP;
            obj.data.pro_expire_time = FAKE_EXPIRY_DATE_APP; 
            obj.data.expiration_timestamp = FAKE_EXPIRY_DATE_MS;
            
            // 广告/限制相关
            obj.data.ad_enabled = false;
            obj.data.has_ad = false;
            obj.data.sub_limit_num = 999;
            
            console.log("✅ 追剧日历脚本：已修改 App 用户状态 (thinkofuture)");
        }
    }

    // 最终返回修改后的 JSON
    body = JSON.stringify(obj);

} catch (e) {
    console.log("❌ 追剧日历脚本：JSON 处理失败，跳过。错误信息: " + e.message);
}

$done({body});
