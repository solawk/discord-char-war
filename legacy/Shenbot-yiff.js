const Discord = require('discord.js');
const Canvas = require('canvas');
const client = new Discord.Client();

client.once('ready', () =>
{
	console.log('Ready!');
}
);

function Log()
{
    console.log('dick flattening');
}

async function AddEmojis(message, emojiArray)
{
    for (var i = 0; i < emojiArray.length; i++)
    {
        await message.react(emojiArray[i]);
    }
}

async function PostMenu(message)
{
    var MenuString = 'This is the menu you fucker';
    var MenuMessage = await message.reply(MenuString);
    AddEmojis(MenuMessage, ['🍆', '🥕', '🥒'])
}

async function AddMenu(message)
{
    AddEmojis(message, ['🍆', '🥕', '🥒'])
}

async function PostImage(message)
{
    const Image = await Canvas.loadImage('https://static1.e621.net/data/sample/4d/33/4d337eff988fc1a4ec90b7c9d5de09f6.jpg');
    
    const DrawCanvas = Canvas.createCanvas(Image.width, Image.height);
    const Context = DrawCanvas.getContext('2d');

    Context.drawImage(Image, 0, 0, DrawCanvas.width, DrawCanvas.height);

    const MessageAttachment = new Discord.MessageAttachment(DrawCanvas.toBuffer(), 'image.jpg');
    message.reply('', MessageAttachment);
}

async function EditMessageTo(message, str)
{
    var NewEmbed = ReturnEmbed(str);
    await message.edit(NewEmbed);
}

function ReturnEmbed(str)
{
    const ThisEmbed = new Discord.MessageEmbed()
    .setColor('#ff0000')
    .setTitle(str)
    .setURL('https://google.com')
    .setAuthor('Yiff Master', 'https://static1.e621.net/data/61/5e/615ec25f21df4061d72756258910387d.jpg', 'https://e621.net')
    .setDescription('Yiff is made out of yiff')
    .setThumbnail('https://static1.e621.net/data/sample/4c/e0/4ce0230e4751b16c6617dee6f1dbf34f.jpg')
    .addField('Male/Female', 'Yes')
    .addField('Male/Male', 'Oh yes')
    .addField('Male/Male/Female', 'Fuck yes', true)
    .addField('Male/Female/Female', 'Fuck yes too', true)
    .addField('Male/Male/Male', 'Sandwimch', true)
    .setImage('https://static1.e621.net/data/sample/74/73/74733626c58c450dd5c5272021ea04a4.jpg')
    .setFooter('Yiffooter', 'https://static1.e621.net/data/sample/c7/99/c799b1bfe2689e3ecf8e3ac14c0a96ee.jpg');   

    return ThisEmbed;
}

async function ReactToYiff(message)
{
    var EmbedMsg = ReturnEmbed('abc');
    var Msg = await message.reply(EmbedMsg);
    await AddMenu(Msg);

    const ReactionFilter = (reaction, user) =>
    {
        return ['🍆', '🥕'].includes(reaction.emoji.name) && user.id != client.user.id;
    };

    Msg.awaitReactions(ReactionFilter, {max: 2, time: 5000})
    .then(collected =>
        {
            var eggplants = 0;
            var carrots = 0;

            var eggplantMessageReaction = collected.find(e => e.emoji.name === '🍆');
            if (eggplantMessageReaction) eggplants = eggplantMessageReaction.count;

            var carrotMessageReaction = collected.find(e => e.emoji.name === '🥕');
            if (carrotMessageReaction) carrots = carrotMessageReaction.count;

            console.log('Eggplants: ' + (eggplantMessageReaction ? (eggplants - 1) : 0));
            console.log('Carrots: ' + (carrotMessageReaction ? (carrots - 1) : 0));

            Msg.reactions.removeAll();
        }
        )
        .catch(collected =>
        {
            console.log('fail');
        }
        );
}

client.on('message', message =>
{
    if (message.content == 'yiff')
    {
        ReactToYiff(message);
    }

    client.user.setActivity('cycle 1/6', { type: 'WATCHING' });
}
);

client.login('NzA1MTI3OTA5NDYyOTAwODI3.XqnLsw.D3TUJcn7Vyg9bY3G3_3YCW8ovKg');