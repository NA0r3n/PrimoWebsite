const canvas = document.querySelector("#area");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const maxRadius = 50;
// 
function Particle(x,y,dx,dy,radius) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;

    this.draw = function() {
       
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
    }
    this.update = function() {
        if (this.x + this.radius > innerWidth || this.x - this.radius < 0)  {
            this.dx = -this.dx;
        }
        
        if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
            this.dy = -this.dy;
        };

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

let particles = [];

for (let i = 0; i < 200; i++) {
    let radius = 10;

    let x = Math.random() * (innerWidth - radius * 2) + radius;
    let y = Math.random() * (innerHeight - radius * 2) + radius;
    let dx = (Math.random() - 0.5);
    let dy = (Math.random() - 0.5);

    particles.push(new Particle(x,y,dx,dy,radius));
};

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0,0,innerWidth,innerHeight);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    };

} animate();