import express from 'express';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand
} from '@aws-sdk/client-dynamodb';

dotenv.config();
const app = express();
app.use(express.json());

// 初始化 DynamoDB 客户端
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const TABLE_NAME = 'Donation-br5rms5xwfbdpemoutavpasfke-dev';

// ✅ Webhook 接收 HitPay 的付款成功通知，并写入 DynamoDB
app.post('/webhook', async (req, res) => {
  const payload = req.body;

  try {
    console.log('📦 Webhook received:', payload);
    res.status(200).send('Webhook received');

    if (payload.status !== 'succeeded') {
      console.log('❌ Payment not succeeded, skipping.');
      return;
    }

    const DonorName = payload.payment_request?.reference_number || 'Unknown Donor';
    const DonateAmount = payload.amount?.toString() || '0';
    const ReceiverName = payload.payment_request?.name || 'Unknown';
    const email = payload.customer?.email || 'unknown@email.com';

    const createdAtRaw = payload.payment_request?.created_at || '';
    const updatedAtRaw = payload.payment_request?.updated_at || '';
    const createdAt = createdAtRaw ? new Date(createdAtRaw).toISOString() : '';
    const updatedAt = updatedAtRaw ? new Date(updatedAtRaw).toISOString() : '';

    const id = uuidv4();

    console.log(`🧾 Saving:
    - DonorName: ${DonorName}
    - DonateAmount: RM${DonateAmount}
    - ReceiverName: ${ReceiverName}
    - email: ${email}
    - createdAt: ${createdAt}
    - updatedAt: ${updatedAt}`);

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: id },
        DonorName: { S: DonorName },
        DonateAmount: { S: DonateAmount },
        ReceiverName: { S: ReceiverName },
        email: { S: email },
        createdAt: { S: createdAt },
        updatedAt: { S: updatedAt },
      },
    });

    await ddbClient.send(command);
    console.log(`✅ Donation saved successfully.`);
  } catch (err) {
    console.error('❌ Failed to save donation:', err);
    res.status(500).send('Error processing webhook');
  }
});

// ✅ 获取所有 donation 记录
app.get('/items', async (req, res) => {
  const command = new ScanCommand({ TableName: TABLE_NAME });

  try {
    const data = await ddbClient.send(command);

    const donations = data.Items.map(item => ({
      id: item.id?.S || '',
      DonorName: item.DonorName?.S || '',
      DonateAmount: item.DonateAmount?.S || '',
      ReceiverName: item.ReceiverName?.S || '',
      email: item.email?.S || '',
      createdAt: item.createdAt?.S || '',
      updatedAt: item.updatedAt?.S || '',
    }));

    res.json(donations);
  } catch (err) {
    console.error('❌ Failed to scan donations:', err);
    res.status(500).json({ error: 'Unable to retrieve donations' });
  }
});

// ✅ 获取单笔 donation by ID
app.get('/item/:id', async (req, res) => {
  const { id } = req.params;

  const command = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: {
      id: { S: id },
    },
  });

  try {
    const data = await ddbClient.send(command);
    if (!data.Item) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const donation = {
      id: data.Item.id?.S || '',
      DonorName: data.Item.DonorName?.S || '',
      DonateAmount: data.Item.DonateAmount?.S || '',
      ReceiverName: data.Item.ReceiverName?.S || '',
      email: data.Item.email?.S || '',
      createdAt: data.Item.createdAt?.S || '',
      updatedAt: data.Item.updatedAt?.S || '',
    };

    res.json(donation);
  } catch (err) {
    console.error('❌ Failed to retrieve donation:', err);
    res.status(500).json({ error: 'Failed to read donation' });
  }
});

// ✅ 手动 POST 新增一笔 donation（用于测试）
app.post('/item', async (req, res) => {
  const { id, DonorName, DonateAmount, ReceiverName, email, createdAt, updatedAt } = req.body;

  if (!id || !DonorName || !DonateAmount || !ReceiverName || !email || !createdAt || !updatedAt) {
    return res.status(400).json({ error: 'All fields must be provided.' });
  }

  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id: { S: id },
      DonorName: { S: DonorName },
      DonateAmount: { S: DonateAmount },
      ReceiverName: { S: ReceiverName },
      email: { S: email },
      createdAt: { S: createdAt },
      updatedAt: { S: updatedAt },
    },
  });

  try {
    await ddbClient.send(command);
    res.status(201).json({ message: 'Donation successfully created.' });
  } catch (err) {
    console.error('❌ Failed to create donation:', err);
    res.status(500).json({ error: 'Failed to save donation' });
  }
});

// ✅ 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
