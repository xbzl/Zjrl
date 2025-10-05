/*
 *
 *
脚本功能：追剧日历-你的追剧好帮手（终极修复版）
软件版本：2.0.4
脚本作者：WeiGiegie & Gemini 修正
更新时间：2025年10月
电报频道：https://t.me/GieGie777
问题反馈：
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
* * 修正说明：
* * 1. 修复了退出 App 后 VIP 状态丢失的问题。
* * 2. 对 api.thinkofuture.com 进行了最广范围拦截，并根据用户截图精准修改了 isPro, adDisabled, subscribeState 等关键字段。
*******************************

// ===================================
// 配置区域：用于导入到 Surge/QX/Loon 等工具
// ===================================

[rewrite_local]
# 1. 订阅接口（保持不变，解决重新登录时生效）：
^https?:\/\/api.rc-backup.com\/v1\/subscribers\/identify url script-response-body https://raw.githubusercontent.com/xbzl/Zjrl/refs/heads/main/zjrl.js

# 2. 【终极拦截】 App 用户状态接口：覆盖整个 api.thinkofuture.com 域名
^https?:\/\/api\.thinkofuture\.com\/.* url script-response-body https://raw.githubusercontent.com/xbzl/Zjrl/refs/heads/main/zjrl.js

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
    const FAKE_EXPIRY_DATE_MS = 4102416000000;          // 2099-12-31 的时间戳 (毫秒)

    // 逻辑 1：处理 RevenueCat 订阅接口 (解决重新登录时生效的问题)
    if ($request.url.includes('api.rc-backup.com/')) {
        
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
        
    // 逻辑 2：处理 App 主应用接口 (解决退出 App 后失效的问题)
    } else if ($request.url.includes('api.thinkofuture.com/')) { 
        
        // 只有当响应结构包含 'data' 字段时，才尝试修改用户状态
        if (obj.data) {
            
            // ===================================
            // 【关键修正】根据截图精准修改核心字段
            // ===================================
            obj.data.isPro = true;           // 将 "isPro": false 改为 true
            obj.data.adDisabled = true;      // 将 "adDisabled": false 改为 true (去除广告)
            obj.data.subscribeState = 1;     // 将 "subscribeState": 0 改为 1
            obj.data.level = 1;              // 将 "level": 0 改为 1
            
            // 其他可能影响状态的字段（兼容旧版）
            obj.data.is_vip = true;
            obj.data.is_pro = 1;
            
            // VIP 有效期相关字段 (使用时间戳和日期格式)
            obj.data.expireTime = FAKE_EXPIRY_DATE_MS;
            obj.data.originalExpiresTime = FAKE_EXPIRY_DATE_MS;
            obj.data.pro_expire_time = FAKE_EXPIRY_DATE_APP; 
            obj.data.vip_end_time = FAKE_EXPIRY_DATE_APP;
            
            // 广告/限制相关
            obj.data.ad_enabled = false;
            obj.data.has_ad = false;
            obj.data.sub_limit_num = 999;
            
            console.log("✅ 追剧日历脚本：已根据截图精准修正 App 用户状态");
        }
    }

    // 最终返回修改后的 JSON
    body = JSON.stringify(obj);

} catch (e) {
    console.log("❌ 追剧日历脚本：JSON 处理失败，跳过。错误信息: " + e.message);
}

$done({body});
