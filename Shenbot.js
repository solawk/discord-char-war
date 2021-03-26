const DiscordWar = require("./discord-war");

const Discord = require('discord.js');
const client = new Discord.Client();
const Token = "NzA1MTI3OTA5NDYyOTAwODI3.XqnLig.Cq3K8YfR50-yS4l8ZtZ9xM28WEM";

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

client.login(Token);