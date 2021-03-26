const ws = new WebSocket('ws://discord-char-war.herokuapp.com');

let prevDate = null;
let nowDate = null;

let LastFrametimes = [];
let FPS = null;

ws.addEventListener("message", function(event)
{
    const message = event.data;
    const type = message.slice(0, 1);

    if (type === "F")
    {
        Redraw(message.slice(1));
    }

    if (type === "I")
    {
        AddInfo(message.slice(1));
    }

    if (type === "K")
    {
        AddKills(message.slice(1));
    }
});

ws.addEventListener("close", function()
{
    DrawConnectionLost();
});

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let Avatars = new Map;
let Nicknames = new Map;
let Kills = new Map;

function RecalcFPS()
{
    nowDate = new Date();
    if (prevDate != null)
    {
        const msPassed = nowDate - prevDate;
        LastFrametimes.push(msPassed);

        if (LastFrametimes.length === 60)
        {
            for (let i = 0; i < 60; i++)
            {
                FPS += LastFrametimes[i];
            }
            FPS /= 60;
            FPS = 1 / (FPS / 1000);

            LastFrametimes = [];
        }
    }
    prevDate = nowDate;
}

function Redraw(string)
{
    RecalcFPS();

    ctx.save();
    DrawArena();

    Clip();
    DrawField(string);

    ctx.restore();
    DrawTable();
    if (FPS != null) DrawFPS();
}

function DrawArena()
{
    ctx.clearRect(0, 0, 1200, 800);

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(400, 400, 400, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(400, 400, 400, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
}

function Clip()
{
    ctx.beginPath();
    ctx.arc(400, 400, 400, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
}

function DrawField(string)
{
    const objectsStrings = string.split(',');

    for (const object of objectsStrings)
    {
        if (object === "") continue;

        if (object.slice(0, 1) === "F")
        {
            DrawFighter(object.slice(1));
        }

        if (object.slice(0, 1) === "P")
        {
            DrawProjectile(object.slice(1));
        }
    }
}

function DrawFighter(string)
{
    const id = string.slice(0, 8);
    const integrity = parseInt(string.slice(8, 11)) / 100;
    const x = parseInt(string.slice(11, 15));
    const y = parseInt(string.slice(15, 19));

    const r = 255 * Math.sqrt(1 - integrity);
    const g = 255 * integrity;
    ctx.strokeStyle = "rgba(" + r + "," + g + ",0,1)";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.stroke();

    // Avatar drawing

    if (!Avatars.has(id)) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(Avatars.get(id), x - 15, y - 15, 30, 30);

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.restore();
}

function DrawProjectile(string)
{
    const x = parseInt(string.slice(0, 4));
    const y = parseInt(string.slice(4, 8));
    const char = string.slice(8, 9);

    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(char, x, y - 10);
}

function DrawConnectionLost()
{
    DrawArena();

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 48px math";
    ctx.fillText("Connection lost", 400, 376);
}

function AddInfo(string)
{
    const parts = string.split(",");
    const id = parts[0];
    const url = parts[1];
    const nickname = parts[2];

    let img = new Image(30, 30);
    img.src = url;
    Avatars.set(id, img);

    Nicknames.set(id, nickname);
}

function AddKills(string)
{
    const parts = string.split(",");
    const id = parts[0];
    const kills = parts[1];

    Kills.set(id, kills);
}

function DrawFPS()
{
    ctx.font = "bold 30px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("FPS: " + FPS.toString().slice(0, 2), 830, 50);
}

function DrawTable()
{
    const lineX = 830;
    let lineY = 100;

    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";

    for (let [key, name] of Nicknames)
    {
        const kills = Kills.get(key);

        ctx.fillText(name + ": " + kills + " kills", lineX, lineY);

        lineY += 24;
    }
}