// zjrl_fix.js
// 功能：拦截追剧日历 App 的订阅验证接口和错误日志接口，分别进行处理。
(function () {
  // 处理日志上报请求（HTTP 请求阶段）
  if ($request && $request.method === 'POST' && $request.url.match(/https:\/\/ap-guangzhou\.cls\.tencentcs\.com\/tracklog/)) {
    // 返回 200 空 JSON，阻止错误提示上报
    $done({
      response: {
        status: 200,
        body: '{}'
      }
    });
    return;
  }

  // 处理 RevenueCat 订阅信息（HTTP 响应阶段）
  if ($response && $request.url.match(/https:\/\/api\.rc-backup\.com\/v1\/subscribers\//)) {
    let bodyObj = {};
    try {
      bodyObj = JSON.parse($response.body || '{}');
    } catch (e) {
      // 如果解析失败，初始化一个基础对象
      bodyObj = {};
    }
    // 确保 subscriber 对象存在
    bodyObj.subscriber = bodyObj.subscriber || {};

    // 模拟订阅产品和会员字段
    const entitlementId = "yearly";               // 权益标识符，可根据实际情况修改
    const productId = "com.zjrl.vip_annual";      // 产品标识符，可根据实际情况修改

    // 注入 entitlements 字段
    bodyObj.subscriber.entitlements = {};
    bodyObj.subscriber.entitlements[entitlementId] = {
      expires_date: "2099-01-01T00:00:00Z",
      product_identifier: productId,
      purchase_date: "2023-10-10T00:00:00Z"
    };

    // 注入 subscriptions 字段
    bodyObj.subscriber.subscriptions = {};
    bodyObj.subscriber.subscriptions[productId] = {
      expires_date: "2099-01-01T00:00:00Z",
      original_purchase_date: "2023-10-10T00:00:00Z",
      purchase_date: "2023-10-10T00:00:00Z",
      ownership_type: "PURCHASED",
      period_type: "normal",
      billing_issues_detected_at: null,
      is_sandbox: false,
      store: "app_store",
      unsubscribe_detected_at: null
    };

    // 返回修改后的 JSON 字符串
    $done({ body: JSON.stringify(bodyObj) });
    return;
  }

  // 对于其他请求/响应，不做处理
  $done({});
})();
