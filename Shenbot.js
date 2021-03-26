const DiscordWar = require("./discord-war");

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () =>
    {
        console.log('Ready!');
    }
);

client.on('message', message =>
    {
        if (message.author !== client.user)
        {
            DiscordWar.messageCallback(message);
        }
    }
);

client.login(process.env.BOT_TOKEN);