const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ✅ 自动使用 Azure 分配的端口，默认本地开发用 3001
const PORT = process.env.PORT || 3001;

// ✅ 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// ✅ 建议将 API_KEY 存放在 .env 文件或 Azure 环境变量中
const API_KEY =
  process.env.HITPAY_API_KEY ||
  'test_7f0825debbccb2f0f915231102787fd74a8d5ff3d0f5179e34d503d5379766a1';

const HITPAY_URL = 'https://api.sandbox.hit-pay.com/v1/payment-requests';

// ✅ POST - 创建付款请求
app.post('/api/create-payment', async (req, res) => {
  const { name, amount, email, donorName } = req.body;

  // 🛡️ 验证参数
  if (!name || !amount || !email || !donorName) {
    return res.status(400).json({ error: 'Missing name, amount, email, or donorName' });
  }

  // 🧾 构造 payload
  const payload = {
    amount: parseFloat(amount),
    currency: 'MYR',
    name: name,
    email: email,
    reference_number: donorName, // ✅ 将 donorName 放入 remark 字段
    redirect_url: 'https://main.d26kphwalg03vx.amplifyapp.com/admin/donaterecommendationlist/',
    webhook: 'https://web1hook-dpbxemgbc8caegec.southeastasia-01.azurewebsites.net/webhook',
    send_email: true,

  };

  console.log('📤 Sending payment request to HitPay:', payload);

  try {
    const response = await axios.post(HITPAY_URL, payload, {
      headers: {
        'X-BUSINESS-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ HitPay response:', response.data);

    // 返回付款链接给前端
    res.json({ payment_url: response.data.url });
  } catch (err) {
    console.error('❌ HitPay API Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create payment request' });
  }
});

// ✅ 启动服务器
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
