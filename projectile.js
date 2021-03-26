module.exports =
    {
        Projectile: function(user, x, y, direction, stats)
        {
            return new Projectile(user, x, y, direction, stats);
        }
    };

const server = require("./discord-war");
const FieldRadius = server.getFieldRadius();

function Projectile(userID, x, y, direction, stats)
{
    // Stats
    this.stats = stats;

    // Mechanical stats
    this.user = userID;

    // Mechanics
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;

    this.SetSpeed(direction);
    let me = this;
    setTimeout(function()
    {
        server.removeProjectile(me);
    }, this.stats.lifetime);
}

Projectile.prototype.SetSpeed = function(direction)
{
    const speedXnorm = Math.cos(direction);
    const speedYnorm = Math.sin(direction);

    this.speedX = speedXnorm * this.stats.speed;
    this.speedY = speedYnorm * this.stats.speed;
}

Projectile.prototype.Process = function()
{
    this.Translate();
}

Projectile.prototype.Translate = function()
{
    this.x += this.speedX;
    this.y += this.speedY;

    const CenterDeltaX = FieldRadius - this.x;
    const CenterDeltaY = FieldRadius - this.y;
    const CenterDistance = Math.sqrt(Math.pow(CenterDeltaX, 2) + Math.pow(CenterDeltaY, 2));

    if (CenterDistance > FieldRadius * 1.1)
    {
        server.removeProjectile(this);
    }
}