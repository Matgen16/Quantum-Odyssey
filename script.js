let quantumState = 0;
let isTimeReversed = false;
let isDragging = false;
let dragOffsetX, dragOffsetY;
let orbs = 0;
let playing = true
let eDown = false
let tutStage = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let bgColor
let keys = [];
let buttons = [];


bgColor = "#5588ff";

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

const collisions = [
    {
        x: window.innerWidth,
        y: 0,
        width: 1,
        height: window.innerHeight,
    },
    {
        x: 0,
        y: 0,
        width: 1,
        height: window.innerHeight,
    },
    {
        x: window.innerWidth / 2,
        y: 0,
        width: 50,
        height: window.innerHeight - 100,
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
    y: window.innerHeight - 200,
    width: 100,
    height: 100,
};

let orb = {
    x: 375,
    y: window.innerHeight - 115,
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
    drawFloor();
    drawOrb();
    drawBullet();
    gravity();
    checkCollision();
    checkOrbCollision();
    checkKeys();
    drawCollisions();
    if (tutStage == 0) {
        drawText("Collect this ORB", 250, window.innerHeight - 200, "#aa3388", "30px Arial");
    } else if (tutStage == 1) {
        drawText("Press E To Enter Quantum State", 275, window.innerHeight - 200, "#aa3388", "30px Arial");
    } else if (tutStage == 2) {
        drawText(`Drag The Player Here And Press E ⬇`, window.innerWidth - 700, window.innerHeight - 200, "#aa3388", "30px Arial");
    } else if (tutStage == 3) {
        drawText(`Walk To The Portal And Press S ⬇`, window.innerWidth - 500, window.innerHeight - 200, "#aa3388", "30px Arial");
    }

    let img = new Image();
    img.src = "portal.svg";
    ctx.drawImage(img, portal.x, portal.y, portal.width, portal.height);

    if (quantumState === 1) {
        emitParticles();
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
            window.location.assign("index dark.html")
        }
    }
}


function openOptions() {
    document.getElementById('options').style.display = 'flex';
    document.getElementById('openOpts').className = 'turn';
    setTimeout(() => {
        document.getElementById('openOpts').className = null; 
    }, 500);
}
function checkKeys() {
    if (quantumState === 0 && playing) {
        if (
            keys[68] ||
            keys[87] ||
            keys[32] ||
            keys[65] ||
            keys[83] ||
            keys[69]
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
            if (keys[83]) {
                if (isPlayerOnPortal()) {
                    handlePortalInteraction();
                }
            }
        } else {
            player.color = "red";
            if (player.xSpeed < 0) {
                player.xSpeed = Math.floor(player.xSpeed + 1);
            } else if (player.xSpeed > 0) {
                player.xSpeed = Math.floor(player.xSpeed - 1);
            }
        }
    } else {
        player.xSpeed = 0;
        player.ySpeed = 0;
    }

    if (isTimeReversed) {
        player.xSpeed = 0;
        player.ySpeed = 0;
    }
    if (keys[82]) {
        window.location.reload()
    }
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
                }
            }
        }
    });
}

function gravity() {
    if (player.y + player.height < floor.y) {
        player.ySpeed += 0.7;
        player.jumping = true;
    } else {
        player.y = floor.y - player.height;
        player.ySpeed = 0;
        player.jumping = false;
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
    if (e.which == 69 && eDown == false) {
        eDown = true
    }
}

function keyUp(e) {
    if (keys[69] && eDown) {
        eDown = false
        handleQuantumTransition()
    }
    keys[e.which] = false;
}

function mouseMove(e) {
    if (isDragging && quantumState === 1) {
        player.x = e.clientX - dragOffsetX;
        player.y = e.clientY - dragOffsetY;
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
        player.y < portal.y + portal.height &&
        player.y + player.height > portal.y
    );
}

function handlePortalInteraction() {
    document.getElementById("levelDone").style.display = "flex"
    playing = false
}

initiate();
initiateKeys();

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
document.addEventListener("mousedown", mouseDown);
document.addEventListener("mousemove", mouseMove);
document.addEventListener("mouseup", mouseUp);
var audio = document.getElementById('backgroundAudio');
