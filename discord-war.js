const FieldRadius = 400;

module.exports =
    {
        messageCallback: function(message)
        {
            MessageHandler(message);
        },
        getFieldRadius: function()
        {
            return FieldRadius;
        },
        addProjectile: function(user, x, y, direction, stats)
        {
            AddProjectile(user, x, y, direction, stats);
        },
        removeProjectile: function(projectile)
        {
            DeleteProjectile(projectile);
        },
        removeFighter: function(fighter, killer)
        {
            DeleteFighter(fighter, killer);
        },
    };

const fighter = require("./fighter");
const projectile = require("./projectile");
require("discord.js");

const ws = require("ws");
const wsServer = new ws.Server({port: process.env.PORT, clientTracking: true});

wsServer.on('connection', function onClientConnect(ws)
{
    console.log("Client connected");
    SendField(ws);
    SendAllInfo(ws);
});

const Tickrate = 60;
setInterval(Process, 1 / Tickrate);

let Fighters = new Set;
let Projectiles = new Set;

let Avatars = new Map;
let Nicknames = new Map;
let Kills = new Map;

const MinSpaceBetweenFighters = 35;

function SendField(ws)
{
    let message = "F";

    for (let fighter of Fighters)
    {
        message += "F";

        const fighterIntegrity = (Math.ceil(fighter.health / fighter.maxhealth * 100)).toString().padStart(3, '0');
        const fighterX = Math.floor(fighter.x).toString().padStart(4, '0');
        const fighterY = Math.floor(fighter.y).toString().padStart(4, '0');

        message += fighter.user.toString();
        message += fighterIntegrity;
        message += fighterX;
        message += fighterY;
        message += ',';
    }

    for (let proj of Projectiles)
    {
        message += "P";

        const projX = Math.floor(proj.x).toString().padStart(4, '0');
        const projY = Math.floor(proj.y).toString().padStart(4, '0');

        message += projX;
        message += projY;
        message += proj.stats.char;
        message += ',';
    }

    if (ws == null)
    {
        for (let client of wsServer.clients)
        {
            client.send(message);
        }
    }
    else
    {
        ws.send(message);
    }
}

function SendAllInfo(ws)
{
    for (let [id, avatarURL] of Avatars)
    {
        SendInfo(id, ws);
        SendKills(id, ws);
    }
}

function SendAllKills(ws)
{
    for (let [id, kills] of Kills)
    {
        SendKills(id, ws);
    }
}

function SendInfo(key, ws)
{
    let message = "I";
    message += key;
    message += ",";
    message += Avatars.get(key);
    message += ",";
    message += Nicknames.get(key);

    if (ws == null)
    {
        for (let client of wsServer.clients)
        {
            client.send(message);
        }
    }
    else
    {
        ws.send(message);
    }
}

function SendKills(key, ws)
{
    let message = "K";
    message += key;
    message += ",";
    message += Kills.get(key);

    if (ws == null)
    {
        for (let client of wsServer.clients)
        {
            client.send(message);
        }
    }
    else
    {
        ws.send(message);
    }
}

function MessageHandler(message)
{
    const authorID = message.author.id.slice(-8);
    if (!Avatars.has(authorID))
    {
        const authorAvatar = message.author.avatarURL();
        Avatars.set(authorID, authorAvatar);
        Nicknames.set(authorID, message.author.username);
        Kills.set(authorID, 0);

        SendInfo(authorID);
        SendKills(authorID);
    }

    const messageLength = message.content.length;
    const approachDir = Math.random() * 2 * Math.PI;

    for (let i = 0; i < messageLength; i++)
    {
        const char = message.content[i];
        if (char === " ") continue;

        AddFighter(authorID, char, approachDir);
    }
}

function Process()
{
    for (const fighter of Fighters)
    {
        ProcessFighter(fighter);
    }

    for (const proj of Projectiles)
    {
        ProcessProjectile(proj);
    }

    SendField();
}

/*
for (let i = 0; i < 10; i++)
{
    AddFighter(12345678);
}

for (let i = 0; i < 10; i++)
{
    AddFighter(87654321);
}*/

function AddFighter(userID, char, dir)
{
    const SpawnpointPolar =
        {
            direction: dir + (-Math.PI/4 + Math.random() * (Math.PI/2)),
            distance: (Math.random() * 0.3 + 0.6) * FieldRadius
        };

    const Spawnpoint =
        {
            x: FieldRadius + (SpawnpointPolar.distance * Math.cos(SpawnpointPolar.direction)),
            y: FieldRadius + (SpawnpointPolar.distance * Math.sin(SpawnpointPolar.direction)),
        };

    Fighters.add(new fighter.Fighter(userID, Spawnpoint.x, Spawnpoint.y, char));
}

// FIGHTERS

function ProcessFighter(fighter)
{
    RollTargetChangeOfFighter(fighter);
    fighter.Process();
    TryOffsetFighter(fighter);
}

function DeleteFighter(fighter, killer)
{
    Fighters.delete(fighter);
    const killerKills = Kills.get(killer);
    Kills.set(killer, killerKills + 1);
    SendAllKills();
}

function RollTargetChangeOfFighter(fighter)
{
    if (Math.random() < fighter.targetChangeChance)
    {
        SetTargetOfFighter(fighter, ChooseRandomFighter(fighter.user));
    }
}

function ChooseRandomFighter(myUser)
{
    let potentialTargets = [];

    for (let fighter of Fighters)
    {
        if (fighter.user !== myUser)
        {
            potentialTargets.push(fighter);
        }
    }

    if (potentialTargets.length === 0) return null;

    const chosenIndex = Math.floor(Math.random() * potentialTargets.length);
    return potentialTargets[chosenIndex];
}

function SetTargetOfFighter(fighter, target)
{
    fighter.SetTarget(target);
}

function TryOffsetFighter(fighter)
{
    for (let other of Fighters)
    {
        if (other === fighter) continue;

        const deltaX = other.x - fighter.x;
        const deltaY = other.y - fighter.y;
        const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

        if (distance < MinSpaceBetweenFighters)
        {
            DistanceFighters(fighter, other, deltaX, deltaY, distance);
        }
    }
}

function DistanceFighters(f1, f2, deltaX, deltaY, distance)
{
    const force = 1 - (distance / MinSpaceBetweenFighters);

    f1.Accelerate(-deltaX * force, -deltaY * force);
    f2.Accelerate(deltaX * force, deltaY * force);
}

// PROJECTILES

function AddProjectile(user, x, y, direction, stats)
{
    const newProjectile = new projectile.Projectile(user, x, y, direction, stats);
    Projectiles.add(newProjectile);
}

function DeleteProjectile(projectile)
{
    Projectiles.delete(projectile);
}

function ProcessProjectile(projectile)
{
    projectile.Process();
    ProjectileHitDetection(projectile);
}

function ProjectileHitDetection(projectile)
{
    for (let fighter of Fighters)
    {
        if (fighter.user === projectile.user) continue;

        const deltaX = fighter.x - projectile.x;
        const deltaY = fighter.y - projectile.y;
        const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

        if (distance > 30) continue;

        fighter.TakeDamage(projectile.stats.damage, projectile.user);
        DeleteProjectile(projectile);
        return;
    }
}