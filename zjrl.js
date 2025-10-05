/*
 *
 * 脚本功能：追剧日历-你的追剧好帮手（修复退出失效问题）
 * 软件版本：2.0.4
 * 脚本作者：WeiGiegie & Gemini 修正
 * 更新时间：2025年10月
 * * 修正说明：
 * 1. 之前仅拦截了订阅 API (api.rc-backup.com)，导致退出 App 后失效。
 * 2. 现已新增 App 启动时状态查询 API (api.thinkofuture.com) 的拦截。
 * 3. 脚本代码已优化，能够同时处理两个不同 API 返回的 JSON 格式。
 *
 *******************************
 
// ===================================
// 配置区域：用于导入到 Surge/QX/Loon 等工具
// ===================================

[rewrite_local]
# 1. 订阅接口（解决重新登录时生效）：
^https?:\/\/api.rc-backup.com\/v1\/subscribers\/identify url script-response-body https://raw.githubusercontent.com/xbzl/Zjrl/refs/heads/main/zjrl.js

# 2. App 用户状态接口（解决退出App后失效）：
^https?:\/\/api\.thinkofuture\.com\/v1\/(user|me|profile|info)\/(.*)?$ url script-response-body https://raw.githubusercontent.com/xbzl/Zjrl/refs/heads/main/zjrl.js

[mitm]
# 必须同时包含 RevenueCat 和 App 主服务器域名
hostname = api.rc-backup.com, api.thinkofuture.com

*/

// ===================================
// JavaScript 代码区域：核心解锁逻辑
// ===================================

let body = $response.body;

try {
    let obj = JSON.parse(body);

    // 伪造超长有效期常量
    const FAKE_EXPIRY_DATE_RC = "2999-09-09T09:09:09Z"; // RevenueCat 格式
    const FAKE_EXPIRY_DATE_APP = "2999-09-09";          // App 主服务器日期格式
    const FAKE_EXPIRY_DATE_MS = 4102416000000;          // 2099-12-31 的时间戳

    // 逻辑 1：处理 RevenueCat 订阅接口 (解决重新登录生效的问题)
    if ($request.url.includes('/v1/subscribers/identify')) {
        
        // 确保使用您原脚本中的字段名称和 ID，以确保兼容性
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
        
    // 逻辑 2：新增 App 主应用接口 (解决退出 App 后失效的问题)
    } else if ($request.url.includes('api.thinkofuture.com/v1/')) {
        
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
        }
        console.log("✅ 追剧日历脚本：已修改 App 用户状态");
    }

    // 最终返回修改后的 JSON
    body = JSON.stringify(obj);

} catch (e) {
    console.log("❌ 追剧日历脚本：JSON 处理失败，跳过。错误信息: " + e.message);
}

$done({body});
