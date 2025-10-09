const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
dotenv.config();
const PORT = process.env.PORT || 10000;

// === MongoDB Connection ===
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// === Mongoose Models ===
const keySchema = new mongoose.Schema(
  {
    keyValue: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    discordId: { type: String, index: true },
    service: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: null },
    description: { type: String, default: '' },
    botId: { type: String, default: null },
    _class: { type: String, default: 'com.ssrr.tech.AuthSystem.model.ApiKey' }
  },
  { collection: 'apikeys' }
);
const KeyModel = mongoose.model('ApiKey', keySchema);

// Example UserModel (adjust path or schema to your actual one)
const userSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  avatar: String
});
const UserModel = mongoose.model('User', userSchema);

// === Middleware ===
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json());

// === Variables ===
const expectedCommandsCount = 100;
let serverOnline = true;
let webhookCounter = 8219;

app.post('/api/verify-key', async (req, res) => {
  const { apiKey, discordId, botId } = req.body;

  if (!apiKey || !discordId || !botId) {
    return res.status(400).json({
      success: false,
      message: '🚫 Missing required fields: apiKey, discordId, or botId',
      box: [
        "❌ Verification Failed!",
        "Please provide all required details and try again.",
        "Visit https://yourwebsite.com to manage your account."
      ]
    });
  }

  try {
    // 1️⃣ Find user
    const userDoc = await UserModel.findOne({ discordId });
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: 'No user account found. Please login first.',
        box: [
          "❌ Verification Failed!",
          "No user account found for this Discord ID.",
          "Visit https://glaceyt.com to register/login."
        ]
      });
    }

    // 2️⃣ Find API key
    const keyDoc = await KeyModel.findOne({
      discordId,
      keyValue: apiKey,
      isActive: true
    });

    if (!keyDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key. Please generate a new one.',
        box: [
          "❌ Verification Failed!",
          "The API key is invalid or inactive.",
          "Visit https://glaceyt.com to generate a new key."
        ]
      });
    }

    // 3️⃣ Update usage metadata
    keyDoc.lastUsedAt = new Date();
    keyDoc.botId = botId;
    await keyDoc.save();

    // 4️⃣ Success response
    return res.status(200).json({
      success: true,
      message: '✅ API key verified successfully',
      box: [
        "✅ Verification Successful!",
        `Welcome back, ${userDoc.username || 'User'}!`,
        "Visit https://glaceyt.com to manage your account."
      ],
      user: {
        mongoUserId: userDoc._id.toString(),
        discordId,
        botId,
        username: userDoc.username || 'Unknown',
        displayName: userDoc.displayName || 'Unknown',
        avatar: userDoc.base64Image || userDoc.avatar || null
      }
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during key verification',
      box: [
        "❌ Verification Failed!",
        "Something went wrong on our end.",
        "Visit https://glaceyt.com contact support."
      ]
    });
  }
});

// === Server Status Endpoint ===
app.get('/api/server-status', (req, res) => {
  res.json({ serverOnline });
});

// === Bot Info Endpoint ===
app.post('/api/bot-info', async (req, res) => {
  const { name, avatar, timestamp } = req.body;
  const parsedTimestamp = timestamp
    ? Math.floor(new Date(timestamp).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  webhookCounter++;

  const embed = {
    title: `Bot Status Report`,
    description: `A bot has reported its status.\n\n**Name:** ${name}\n**Report Time:** <t:${parsedTimestamp}:F>`,
    thumbnail: { url: avatar },
    image: { url: 'https://i.ibb.co/fVxXvnN4/11.png' },
    fields: [
      { name: 'Version', value: '```@1.4.1.0```', inline: true },
      { name: 'Status', value: '```✅ Online```', inline: false },
      {
        name: 'Execution Overview',
        value: `🔐 Secure Identifier: **${webhookCounter}-${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}-SSRR-GlaceYT**`,
        inline: false
      }
    ],
    color: 0x00aaff,
    timestamp: new Date(timestamp),
    footer: { text: 'www.ssrr.tech', icon_url: avatar },
    author: {
      name: '🚀 GlaceYT [ ALL IN ONE ]',
      icon_url: 'https://i.ibb.co/9krKGyHh/TRANSPARENT.png'
    }
  };

  try {
    await axios.post(process.env.WEBHOOK_URL, {
      username: 'SSRR FRAMEWORK',
      avatar_url: avatar,
      embeds: [embed]
    });
    return res.status(204).end();
  } catch (err) {
    if (err.response?.status === 429) {
      const retryAfter = err.response.headers['retry-after'];
      console.log(`Rate limit hit. Retrying after ${retryAfter} seconds.`);
      setTimeout(async () => {
        await axios.post(process.env.WEBHOOK_URL, {
          username: 'SSRR FRAMEWORK',
          avatar_url: avatar,
          embeds: [embed]
        });
      }, retryAfter * 1000);
    } else {
      console.error('Error sending Discord webhook:', err.response?.data || err.message);
    }
  }
});

// === Command Info ===
app.get('/api/expected-commands-count', (req, res) => {
  res.json({ expectedCommandsCount });
});

app.get('/api/commands', (req, res) => {
  const commands = [
    {
      name: 'checkupdate',
      description: 'update',
      embed: {
        title: 'Please Verify below details!',
        description:
          '- For help feel free to join our discord server.\n- Discord server : https://discord.gg/xQF9f9yUEM',
        fields: [
          { name: 'Version : ', value: '```@1.4.0.1```' },
          {
            name: 'Download Link :',
            value:
              '[click here](https://drive.google.com/file/d/1nK2KiZD122JmHr5frsoPv6nYaqD1_K1_/view?usp=sharing)'
          },
          { name: 'Required Node Version : ', value: '```v20```' },
          { name: 'Required Discord.js : ', value: '```v14.15.3```' },
          { name: 'Last Updated:', value: '```October 20 , 2024```' }
        ],
        image: 'https://i.ibb.co/fVxXvnN4/11.png',
        color: 0x0099ff,
        footer: {
          text: 'GlaceYT',
          icon_url: 'https://i.ibb.co/9krKGyHh/TRANSPARENT.png'
        },
        author: {
          name: 'ALL IN ONE',
          icon_url: 'https://i.ibb.co/9krKGyHh/TRANSPARENT.png'
        }
      }
    }
  ];

  res.json(commands);
});

// === Static Root ===
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

// === Start Server ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
