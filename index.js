const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const axios   = require('axios');
dotenv.config();
const PORT = process.env.PORT || 10000;

const expectedCommandsCount = 86;
let serverOnline = true;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
let webhookCounter = 7220;
// Endpoint to check server status
app.get('/api/server-status', (req, res) => {
    res.json({ serverOnline });
});

app.post('/api/bot-info', async (req, res) => {
    const { name, avatar, timestamp } = req.body;
    const parsedTimestamp = timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000);
    webhookCounter++;
    const embed = {
      title: `Bot Status Report`,
      description: `A bot has reported its status.\n\n**Name:** ${name}\n**Report Time:** <t:${parsedTimestamp}:F>`,
      thumbnail: { url: avatar },
      image: {
        url: 'https://i.ibb.co/fVxXvnN4/11.png'
      },
      fields: [
        {
            name: 'version',
            value: '```@1.2.2```',
            inline: true,
          },
        {
          name: 'Status',
          value: '```✅ Online```',
          inline: false,
        },
          {
          name: 'Execution Overview',
          value: `🔐 Secure Identifier: **${webhookCounter}-${Math.random().toString(36).substr(2, 5).toUpperCase()}-SSRR-GlaceYT**`,
          inline: false,
        },
      ],
      color: 0x00AAFF,
      timestamp: new Date(timestamp),

      footer: {
        text: 'www.ssrr.tech',
        icon_url: avatar,
      },
      author: {
        name: '🚀 GlaceYT [ ALL IN ONE ]',
        icon_url: 'https://i.ibb.co/9krKGyHh/TRANSPARENT.png',
      },
    };
  
    try {
      await axios.post(process.env.WEBHOOK_URL, {
        username: 'SSRR FRAMEWORK',
        avatar_url: avatar,
        embeds: [embed],
      });
  
      return res.status(204).end();
    } catch (err) {
    if (err.response && err.response.status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        console.log(`Rate limit hit. Retrying after ${retryAfter} seconds.`);
        setTimeout(async () => {
            await axios.post(process.env.WEBHOOK_URL,  {
              username: 'SSRR FRAMEWORK',
              avatar_url: avatar,
              embeds: [embed],
            });
        }, retryAfter * 1000); // Wait for the retry time before retrying
    } else {
        console.error('Error sending Discord webhook:', err.response?.data || err.message);
    }
    }
  });
  

// Endpoint to get the expected commands count
app.get('/api/expected-commands-count', (req, res) => {
    res.json({ expectedCommandsCount });
});

// Endpoint to get multiple commands
app.get('/api/commands', (req, res) => {
    const commands = [
        {
            name: 'checkupdate',
            description: 'update',
            embed: {
                title: 'Please Verify below details!',
                description: '- For help feel free to join our discord server.\n- Discord server : https://discord.gg/xQF9f9yUEM',
                fields: [
                    { name: 'Version : ', value: '```@1.2.2```' },
                    { name: 'Download Link :', value: '[click here](https://drive.google.com/file/d/1nK2KiZD122JmHr5frsoPv6nYaqD1_K1_/view?usp=sharing)' },
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
        },
        {
            name: 'glaceyt',
            description: 'An example command',
            embed: {
                title: 'Thank You For Choosing Our Bot',
                description: '➡️ **Join our Discord server for support and updates:**\n' +
                    '- Discord - https://discord.gg/xQF9f9yUEM\n' +
                    '\n' +
                    '➡️ **Follow us on:**\n' +
                    '- GitHub - https://github.com/GlaceYT\n' +
                    '- Replit - https://replit.com/@GlaceYT\n' +
                    '- YouTube - https://www.youtube.com/@GlaceYT',
                fields: [
                    { name: 'Response', value: 'This is an example response.' }
                ],
                color: 0x0099ff,
                image: 'https://i.ibb.co/fVxXvnN4/11.png',
                footer: {
                    text: 'GlaceYT',
                    icon_url: 'https://i.ibb.co/9krKGyHh/TRANSPARENT.png'
                },
                author: {
                    name: 'ALL IN ONE [ GlaceYT ]',
                    icon_url: 'https://i.ibb.co/9krKGyHh/TRANSPARENT.png'
                }
            }
        },
      
    ];

    res.json(commands);
});

app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
