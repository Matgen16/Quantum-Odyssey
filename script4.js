let quantumState = 0;
let isTimeReversed = false;
let isDragging = false;
let dragOffsetX, dragOffsetY;
let orbs = 0;
let playing = true
let key = true
let tutStage = 0;
let shakeFrames = 0;
let colliding = false
const shakeIntensity = 2;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = [];
let buttons = [];

let bgColor = "#5588ff";

const player = {
    x: 30,
    y: 300,
    xSpeed: 0,
    ySpeed: 0,
    jumping: false,
    width: 50,
    height: 84,
    color: "orange",
};

const bullets = [];

const floor = {
    y: window.innerHeight - 100,
    height: 100,
};


class Lava {
    constructor(x, y, width, height, numRows, numCols, color = "red") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.numRows = numRows;
        this.numCols = numCols;
        this.color = color;
        this.triangleWidth = width / numCols;
        this.triangleHeight = height / numRows;
    }

    draw() {
        ctx.fillStyle = this.color;

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                const triangleX = this.x + col * this.triangleWidth;
                const triangleY = this.y + row * this.triangleHeight;

                ctx.beginPath();
                ctx.moveTo(triangleX + this.triangleWidth / 2, triangleY);
                ctx.lineTo(triangleX, triangleY + this.triangleHeight);
                ctx.lineTo(triangleX + this.triangleWidth, triangleY + this.triangleHeight);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    checkCollision() {
        if (
            player.x < this.x + this.width - 10 &&
            player.x + player.width > this.x + 10 &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y + this.height / 2 &&
            quantumState == 0
        ) {
            this.reloadPage()
        }
    }

    reloadPage() {
        window.location.reload();
    }
}
const lava = new Lava(400, window.innerHeight - 140, 700, 40, 1, 12, "#666");


const collisions = [
    {
        x: window.innerWidth,
        y: 0,
        width: 100,
        height: window.innerHeight,
    },
    {
        x: 0,
        y: 0,
        width: 1,
        height: window.innerHeight,
    },
    {
        x: 530,
        y: window.innerHeight - 390,
        width: 15,
        height: 225,
    },
    {
        x: 530,
        y: window.innerHeight - 175,
        width: 250,
        height: 15,
    }


];

const collisionsIn1 = [
    {
        x: 700,
        y: 0,
        width: 1000,
        height: window.innerHeight,
    },
    {
        x: 500,
        y: window.innerHeight - 400,
        width: 100,
        height: 250,
    },
];

const particleEmitter = {
    particles: [],
    emitRate: 0.25,
    particleLifetime: 30,
    particleSize: 5,
    particleColor: "#bb4499",
};

const portal = {
    x: window.innerWidth - 100,
    y: window.innerHeight - 415,
    width: 100,
    height: 100,
};

let orb = {
    x: 325,
    y: window.innerHeight - 115,
};

let orb2 = {
    x: 600,
    y: window.innerHeight - 340,
};

function drawPlayer() {
    if (quantumState === 1) {
        ctx.fillStyle = "#a83a88";
        ctx.fillRect(player.x, player.y, player.width, player.height);
    } else {
        if (player.color == "orange") {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y + 25, player.width, player.height - 25);
            ctx.fillStyle = "#ff6600";
            ctx.fillRect(
                player.x + player.width / 5 + player.xSpeed,
                player.y + 25 + player.height / 4 + player.ySpeed,
                player.width / 6,
                player.height / 8
            );
            ctx.fillStyle = "#ff6600";
            ctx.fillRect(
                player.x + player.width / 1.5 + player.xSpeed,
                player.y + 25 + player.height / 4 + player.ySpeed,
                player.width / 6,
                player.height / 8
            );
            ctx.fillStyle = "#ee5522";
            ctx.fillRect(
                player.x + player.width / 4 + player.xSpeed,
                player.y + 25 + player.height / 3 + player.ySpeed,
                player.width / 2,
                (player.height - 10) / 4
            );
        } else {
            ctx.fillStyle = "orange";
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.fillStyle = "#ff4400";
            ctx.fillRect(
                player.x + player.width / 5 + player.xSpeed,
                player.y + player.height / 4 + player.ySpeed / 4,
                player.width / 6,
                player.height / 8
            );
            ctx.fillStyle = "#ff4400";
            ctx.fillRect(
                player.x + player.width / 1.5 + player.xSpeed,
                player.y + player.height / 4 + player.ySpeed / 4,
                player.width / 6,
                player.height / 8
            );
        }
    }
}

function drawOrb() {
    ctx.fillStyle = "#aa3388";
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath()
    ctx.fillStyle = "#aa3388";
    ctx.beginPath();
    ctx.arc(orb2.x, orb2.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath()
}

function checkOrbCollision() {
    if (
        player.x < orb.x + 25 &&
        player.x + player.width > orb.x - 25 &&
        player.y < orb.y + 25 &&
        player.y + player.height > orb.y - 25 &&
        quantumState == 0
    ) {
        orbs++;
        tutStage = 1;
        document.getElementById("orbs").innerHTML = orbs;
        orb.x = -100;
        orb.y = window.innerHeight - 115;
    }
    if (
        player.x < orb2.x + 25 &&
        player.x + player.width > orb2.x - 25 &&
        player.y < orb2.y + 25 &&
        player.y + player.height > orb2.y - 25 &&
        quantumState == 0
    ) {
        orbs++;
        tutStage = 1;
        document.getElementById("orbs").innerHTML = orbs;
        orb2.x = -100;
        orb2.y = window.innerHeight - 115;
    }
}

function drawText(text, x, y, color, fontSize) {
    ctx.fillStyle = color || "black";
    ctx.font = fontSize || "20px Arial";
    ctx.fillText(text, x, y);
}

function initiate() {
    requestAnimationFrame(initiate);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    drawCollisionsIn1();
    drawFloor();
    drawOrb();
    drawBullet();
    gravity();
    checkOrbCollision();
    checkKeys();
    drawCollisions();
    shakePortal();

    lava.draw()
    lava.checkCollision()

    if (player.x > window.innerWidth) {
        player.x = window.innerWidth - player.width
    }

    let img = new Image();
    if (key) {
        img.src = "portal locked.svg"
    } else {
        img.src = "portal.svg";
    }
    ctx.drawImage(img, portal.x, window.innerHeight - 415, portal.width, portal.height);
    if (key) {
        let img1 = new Image();
        img1.src = "pKey.svg";
        ctx.drawImage(img1, 700, window.innerHeight - 505, 100, 37.5);
    }


    if (quantumState === 1) {
        emitParticles();
    } else {
        checkCollision();
        playerXwhenEnterQS = player.x
    }

    updateParticles();

    drawPlayer();

    player.y += player.ySpeed;
    player.x += player.xSpeed;
}

function drawFloor() {
    ctx.fillStyle = "#33bb44";
    ctx.fillRect(0, floor.y, canvas.width, floor.height);
}

function checkKeys() {
    if (quantumState === 0 && playing) {
        if (
            keys[68] ||
            keys[87] ||
            keys[32] ||
            keys[65] ||
            keys[83]
        ) {
            if (keys[68]) {
                player.xSpeed += 0.2;
            }
            if (keys[65]) {
                player.xSpeed -= 0.2;
            }
            if ((keys[32] || keys[87]) && !player.jumping) {
                player.ySpeed = -12;
                player.jumping = true;
            }
        } else {
            player.color = "red";
            if (player.xSpeed < 0) {
                player.xSpeed = Math.floor(player.xSpeed + 1);
            } else if (player.xSpeed > 0) {
                player.xSpeed = Math.floor(player.xSpeed - 1);
            }
        }
        if (keys[83]) {
            if (isPlayerOnPortal()) {
                handlePortalInteraction();
            } else {
            }
        }
    } else {
        player.xSpeed = 0;
        player.ySpeed = 0;
    }

    if (keys[83]) {
        if (isPlayerOnKey()) {
            key = false
        }

    }
    if (isTimeReversed) {
        player.xSpeed = 0;
        player.ySpeed = 0;
    }
    Lava.prototype.reloadPage = function () {
        resetGame();
    };

    if (keys[82]) {
        resetGame();
    }



}
function resetGame() {
    // Resetting game variables
    quantumState = 0;
    isTimeReversed = false;
    isDragging = false;
    dragOffsetX = 0;
    dragOffsetY = 0;
    orbs = 0;
    playing = true;
    key = true;
    tutStage = 0;
    shakeFrames = 0;
    colliding = false;

    // Reset player position and speed
    player.x = 30;
    player.y = 300;
    player.xSpeed = 0;
    player.ySpeed = 0;
    player.jumping = false;
    player.color = "red";

    // Reset orb positions
    orb.x = 325;
    orb.y = window.innerHeight - 115;
    orb2.x = 600;
    orb2.y = window.innerHeight - 340;
    document.getElementById("orbs").innerHTML = orbs;
    lava.x = 400;
    lava.y = window.innerHeight - 140;

    bullets.length = 0;
    particleEmitter.particles.length = 0;

    keys = [];
}

function handleQuantumTransition() {
    if (orbs > 0 && quantumState == 0) {
        quantumState = 1 - quantumState;
        orbs--;
        document.getElementById("orbs").innerHTML = orbs;
        tutStage = 2;
    } else if (quantumState == 1) {
        quantumState = 1 - quantumState;
        tutStage = 3;
        document.getElementById("orbs").innerHTML = orbs;
    }
}

function handleTimeManipulation() {
    if (keys[84]) {
        isTimeReversed = !isTimeReversed;
    }
}

function drawCollisions() {
    ctx.fillStyle = "#8B4513";
    collisions.forEach((wall) => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}
function drawCollisionsIn1() {
    if (quantumState == 1) {
        ctx.fillStyle = "#8822cc";
    } else {
        ctx.fillStyle = "#1166cc";
    }
    ctx.fillRect(0, 0, 500, window.innerHeight - 100)
    ctx.fillRect(600, 0, 100, window.innerHeight - 100)
    ctx.fillRect(0, 0, 600, window.innerHeight - 400)
    ctx.fillRect(0, window.innerHeight - 150, 600, 100)
}
function checkCollision() {
    collisions.forEach((wall) => {
        const isCollidingHorizontal =
            player.x < wall.x + wall.width &&
            player.x + player.width > wall.x;

        const isCollidingVertical =
            player.y < wall.y + wall.height &&
            player.y + player.height > wall.y;

        if (isCollidingHorizontal && isCollidingVertical) {
            const deltaX = Math.min(
                Math.abs(player.x - (wall.x + wall.width)),
                Math.abs((player.x + player.width) - wall.x)
            );

            const deltaY = Math.min(
                Math.abs(player.y - (wall.y + wall.height)),
                Math.abs((player.y + player.height) - wall.y)
            );

            if (deltaX < deltaY) {
                if (player.xSpeed > 0) {
                    player.x = wall.x - player.width;
                } else if (player.xSpeed < 0) {
                    player.x = wall.x + wall.width;
                }
                player.xSpeed = 0;
            } else {
                if (player.ySpeed >= 0) {
                    player.y = wall.y - player.height;
                    player.ySpeed = 0;
                    player.jumping = false;
                } else if (player.ySpeed < 0) {
                    player.y = wall.y + wall.height;
                    player.ySpeed = 0;
                    player.jumping = true;
                }
            }
        }
    });

}
function gravity() {
    if (player.y + player.height < floor.y) {
        player.ySpeed += 0.7;
        if (!colliding) {
            player.jumping = true;
        }
    } else {
        player.y = floor.y - player.height;
        player.ySpeed = 0;
        player.jumping = false;
    }
}



function openOptions() {
    document.getElementById('options').style.display = 'flex';
    document.getElementById('openOpts').className = 'turn';
    setTimeout(() => {
        document.getElementById('openOpts').className = null;
    }, 500);
}

function slider() {
    darkMode = document.getElementById("darkMode").value
    if (darkMode == 0) {
        document.getElementById("Confirm").style.display = "none"
        document.getElementById("label").innerHTML = "Light Mode"
        document.querySelector(':root').style.setProperty('--blue', 'white');
    } else {
        document.getElementById("Confirm").style.display = "block"
        document.getElementById("label").innerHTML = "Dark Mode"
        document.querySelector(':root').style.setProperty('--blue', 'black');
    }
}
function confirmChanges() {
    if (darkMode == 1) {
        if (confirm("Are You Sure? This Will Reset The Level")) {
            window.location.assign("index3 dark.html")
        }
    }
}



function shootBullet() {
    let newX =
        player.xSpeed > 0
            ? player.x + player.width + 50
            : player.player.x - 50;
    let newY = player.y + 45;
    let newBullet = {
        x: newX,
        y: newY,
        width: 10,
        height: 7,
        color: player.xSpeed !== 0 ? false : true,
        xSpeed: player.xSpeed > 0 ? 15 : player.xSpeed < 0 ? -15 : 0,
        ySpeed: 0,
    };
    bullets.push(newBullet);
}

function drawBullet() {
    bullets.forEach((bullet) => {
        if (bullet.width < 100) {
            ctx.fillStyle = "#333";
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        } else {
            bullets.splice(bullets.indexOf(bullet));
        }
    });
}

function emitParticles() {
    for (let i = 0; i < particleEmitter.emitRate; i++) {
        particleEmitter.particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            xSpeed: Math.random() * 4 - 2,
            ySpeed: Math.random() * 4 - 2,
            lifetime: particleEmitter.particleLifetime,
        });
    }
}

function updateParticles() {
    for (let i = particleEmitter.particles.length - 1; i >= 0; i--) {
        const particle = particleEmitter.particles[i];
        particle.x += particle.xSpeed;
        particle.y += particle.ySpeed;
        particle.lifetime--;

        ctx.fillStyle = particleEmitter.particleColor;
        ctx.fillRect(particle.x, particle.y, particleEmitter.particleSize, particleEmitter.particleSize);

        if (particle.lifetime <= 0) {
            particleEmitter.particles.splice(i, 1);
        }
    }
}

function keyDown(e) {
    keys[e.which] = true;
}

function keyUp(e) {
    if (e.which == 69) {
        handleQuantumTransition()
    }
    keys[e.which] = false;
}

function Collision(rectangle, x, y) {
    return (
        x < rectangle.x + rectangle.width &&
        x + player.width > rectangle.x &&
        y < rectangle.y + rectangle.height &&
        y + player.height > rectangle.y
    );
}
function mouseMove(e) {
    if (isDragging && quantumState === 1 && player.x < 600) {
        for (let i = 0; i < collisionsIn1.length; i++) {
            const wall = collisionsIn1[i];

            player.x = e.clientX - dragOffsetX;
            player.y = e.clientY - dragOffsetY;

            if (player.x < wall.x) {
                player.x = wall.x;
            } else if (player.x + player.width > wall.x + wall.width) {
                player.x = wall.x + wall.width - player.width;
            }
            if (player.y < wall.y) {
                player.y = wall.y;
            } else if (player.y + player.height > wall.y + wall.height) {
                player.y = wall.y + wall.height - player.height;
            }
        }
    } else if (isDragging && quantumState === 1 && e.clientX - dragOffsetX > 700) {
        player.x = e.clientX - dragOffsetX;
        player.y = e.clientY - dragOffsetY;
    } else if (isDragging && quantumState === 1) {
        player.y = e.clientY - dragOffsetY;
        player.x = 700
    }
}




function mouseUp(e) {
    buttons[e.button] = false;
    isDragging = false;

}

function mouseDown(e) {
    buttons[e.button] = true;

    if (quantumState === 1 && e.button === 0) {
        if (
            e.clientX >= player.x &&
            e.clientX <= player.x + player.width &&
            e.clientY >= player.y &&
            e.clientY <= player.y + player.height
        ) {
            isDragging = true;
            dragOffsetX = e.clientX - player.x;
            dragOffsetY = e.clientY - player.y;
        } else if (
            e.clientX >= portal.x &&
            e.clientX <= portal.x + portal.width &&
            e.clientY >= portal.y &&
            e.clientY <= portal.y + portal.height
        ) {
            handlePortalInteraction();
        } else {
            isDragging = false;
        }
    }

    if (isDragging && quantumState === 1 && player.x < 600) {
        for (let i = 0; i < collisionsIn1.length; i++) {
            const wall = collisionsIn1[i];

            player.x = e.clientX - dragOffsetX;
            player.y = e.clientY - dragOffsetY;

            if (player.x < wall.x) {
                player.x = wall.x;
            } else if (player.x + player.width > wall.x + wall.width) {
                player.x = wall.x + wall.width - player.width;
            }
            if (player.y < wall.y) {
                player.y = wall.y;
            } else if (player.y + player.height > wall.y + wall.height) {
                player.y = wall.y + wall.height - player.height;
            }
        }
    } else if (isDragging && quantumState === 1 && e.clientX - dragOffsetX > 700) {
        player.x = e.clientX - dragOffsetX;
        player.y = e.clientY - dragOffsetY;
    } else if (isDragging && quantumState === 1) {
        player.y = e.clientY - dragOffsetY;
        player.x = 700
    }
}

function initiateKeys() {
    for (let i = 0; i < 200; i++) {
        keys.push(false);
    }
    for (let i = 0; i < 3; i++) {
        buttons.push(false);
    }
}

function isPlayerOnPortal() {
    return (
        player.x < portal.x + portal.width &&
        player.x + player.width > portal.x &&
        player.y < window.innerHeight - 415 + portal.height &&
        player.y + player.height > window.innerHeight - 415
    );
}

function isPlayerOnKey() {
    return (
        player.x < 700 + 100 &&
        player.x + player.width > 700 &&
        player.y < window.innerHeight - 505 + 37.5 &&
        player.y + player.height > window.innerHeight - 505
    );
}

function shakePortal() {
    if (shakeFrames > 0) {
        portal.x += Math.random() * shakeIntensity - shakeIntensity / 2;
        portal.y += Math.random() * shakeIntensity - shakeIntensity / 2;
        shakeFrames--;
    } else {
        portal.x = window.innerWidth - 100;
        portal.y = window.innerHeight - 200;
    }
}

function handlePortalInteraction() {
    if (!key) {
        document.getElementById("orbs").innerHTML = orbs;
        document.getElementById("levelDone").style.display = "flex";
        playing = false;
    }
}

initiate();
initiateKeys();

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
document.addEventListener("mousedown", mouseDown);
document.addEventListener("mousemove", mouseMove);
document.addEventListener("mouseup", mouseUp);
