module.exports =
    {
        Fighter: function(user, x, y, char)
        {
            return new Fighter(user, x, y, char);
        }
    };

const server = require("./discord-war");
const FieldRadius = server.getFieldRadius();

function Fighter(userID, x, y, char)
{
    // Stats
    this.maxhealth = 100;
    this.health = 100;
    this.acceleration = 0.2;
    this.speed = 3;
    this.firerate = 1000;
    this.projectileStats =
        {
            damage: 10,
            speed: 5,
            lifetime: 1000,
            char: char
        };

    // Mechanical stats
    this.user = userID;
    this.preferredRange = 200;
    this.preferredRangeBias = 0.2;
    this.targetChangeChance = 0.05;

    // Mechanics
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.target = null;
    this.canFire = true;
}

Fighter.prototype.SetTarget = function(target)
{
    this.target = target;
}

Fighter.prototype.Process = function()
{
    this.Move();

    if (this.canFire && this.target != null)
    {
        this.Fire();
    }
}

// Movement

Fighter.prototype.Move = function()
{
    this.Approach();
    this.Translate();
}

Fighter.prototype.Approach = function()
{
    if (this.target == null)
    {
        this.Stop();
        return;
    }

    const deltaX = this.target.x - this.x;
    const deltaY = this.target.y - this.y;
    const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    const deltaXnorm = deltaX / distance;
    const deltaYnorm = deltaY / distance;

    if (this.preferredRange * (1 + this.preferredRangeBias) < distance) // Too far
    {
        this.Accelerate(deltaXnorm * this.acceleration, deltaYnorm * this.speed);
    }
    else if (this.preferredRange * (1 - this.preferredRangeBias) > distance) // Too close
    {
        this.Accelerate(-deltaXnorm * this.acceleration, -deltaYnorm * this.speed);
    }
    else // Sweet spot
    {
        this.Stop();
    }
}

Fighter.prototype.Accelerate = function(accX, accY)
{
    this.speedX += accX;
    this.speedY += accY;
    const newSpeed = Math.sqrt(Math.pow(this.speedX, 2) + Math.pow(this.speedY, 2));

    if (newSpeed > this.speed)
    {
        this.speedX = this.speedX / newSpeed * this.speed;
        this.speedY = this.speedY / newSpeed * this.speed;
    }
}

Fighter.prototype.Stop = function()
{
    const frictionMultiplier = 1 - (this.acceleration / this.speed);

    this.speedX *= frictionMultiplier;
    this.speedY *= frictionMultiplier;
}

Fighter.prototype.Translate = function()
{
    this.x += this.speedX;
    this.y += this.speedY;

    const CenterDeltaX = FieldRadius - this.x;
    const CenterDeltaY = FieldRadius - this.y;
    const CenterDistance = Math.sqrt(Math.pow(CenterDeltaX, 2) + Math.pow(CenterDeltaY, 2));

    if (CenterDistance > FieldRadius - 20)
    {
        const direction = Math.atan2(this.y - FieldRadius, this.x - FieldRadius);

        this.x = FieldRadius + (FieldRadius - 20) * Math.cos(direction);
        this.y = FieldRadius + (FieldRadius - 20) * Math.sin(direction);
    }
}

// cut :(
function Bounce(x, y, direction)
{
    const dirK = Math.tan(direction);
    const dirB = 0;

    const orthoK = -1 / dirK;
    const orthoB = -orthoK * x + y;

    const intersX = (orthoB - dirB) / (dirK - orthoK);
    const intersY = dirK * intersX + dirB;

    const pointToIntersX = intersX - x;
    const pointToIntersY = intersY - y;

    const invX = intersX + pointToIntersX;
    const invY = intersY + pointToIntersY;

    return [invX, invY];
}

// Combat

Fighter.prototype.Fire = function()
{
    const deltaX = this.target.x - this.x;
    const deltaY = this.target.y - this.y;
    const direction = Math.atan2(deltaY, deltaX);

    server.addProjectile(this.user, this.x, this.y, direction, this.projectileStats);
    this.canFire = false;
    let me = this;
    setTimeout(function()
    {
        me.canFire = true;
    }, this.firerate * (0.8 + Math.random() * 0.4));
}

Fighter.prototype.TakeDamage = function(dmg, srcUser)
{
    this.health -= dmg;
    if (this.health <= 0)
    {
        server.removeFighter(this, srcUser);
    }
}