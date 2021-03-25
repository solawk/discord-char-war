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
        message.reply("Succ");
    }
);

client.login(Token);