const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const PORT = process.env.PORT || 10000;

const expectedCommandsCount = 100;
let serverOnline = true;

app.use(cors());
app.use(express.json());

// Endpoint to check server status
app.get('/api/server-status', (req, res) => {
    res.json({ serverOnline });
});

// Endpoint to toggle server status (for testing)
app.post('/api/toggle-server', (req, res) => {
    serverOnline = !serverOnline;
    res.json({ serverOnline });
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
                description: '- When new update will be out we provide a zip file.\n- It will have code files and a manual to update your bot.\n- For help feel free to join our discord server.\n- Discord server : https://discord.gg/xQF9f9yUEM',
                fields: [
                    { name: 'Version : ', value: '```@1.1.0```' },
                    { name: 'Required Node Version : ', value: '```v20```' },
                    { name: 'Required Discord.js : ', value: '```v14.15.3```' },
                    { name: 'Last Updated:', value: '```October 20 , 2024```' }
                ],
                image: 'https://imgur.com/DBVsO0f',
                color: 0x0099ff,
                footer: {
                    text: 'GlaceYT',
                    icon_url: 'https://cdn.discordapp.com/attachments/1230824451990622299/1252165467842416680/1667-yellow-gears.gif?ex=669f5df7&is=669e0c77&hm=0da406182e78db73b507185291c7b3587ae3266e6ac1d695ffa3ee5b50d89516&'
                },
                author: {
                    name: 'ALL IN ONE',
                    icon_url: 'https://cdn.discordapp.com/attachments/1246408947708072027/1264892723484168243/70404-crown.gif?ex=669f86a5&is=669e3525&hm=3deb231dec0b6495843c372013032366846565a5b1668223fc0448496ef7e154&'
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
                    '- YouTube - https://www.youtube.com/@GlaceYT`',
                fields: [
                    { name: 'Response', value: 'This is an example response.' }
                ],
                color: 0x0099ff,
                image: 'https://imgur.com/DBVsO0f',
                footer: {
                    text: 'GlaceYT',
                    icon_url: 'https://cdn.discordapp.com/attachments/1230824451990622299/1230824519220985896/6280-2.gif?ex=669f8328&is=669e31a8&hm=b64187333d5dcc5035293cac89df8ebdf7d56d49ac3ca6805e5da98e3c4b24d2&'
                },
                author: {
                    name: 'ALL IN ONE [ GlaceYT ]',
                    icon_url: 'https://cdn.discordapp.com/attachments/1246408947708072027/1264892723484168243/70404-crown.gif?ex=669f86a5&is=669e3525&hm=3deb231dec0b6495843c372013032366846565a5b1668223fc0448496ef7e154&'
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
