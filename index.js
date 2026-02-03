const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const mouse = {
    x: null,
    y: null,
    radius: 180
};

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
    }

    reset() {
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.density = (Math.random() * 40) + 5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.fadeSpeed = Math.random() * 0.01 + 0.005;
        this.growing = Math.random() > 0.5;
    }

    draw() {
        ctx.fillStyle = `rgba(15, 5, 107, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.baseX += this.speedX;
        this.baseY += this.speedY;

        if (this.baseX < 0 || this.baseX > canvas.width) {
            this.speedX *= -1;
        }
        if (this.baseY < 0 || this.baseY > canvas.height) {
            this.speedY *= -1;
        }

        if (this.growing) {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= 0.8) {
                this.growing = false;
            }
        } else {
            this.opacity -= this.fadeSpeed;
            if (this.opacity <= 0.1) {
                this.growing = true;
                if (Math.random() > 0.95) {
                    this.baseX = Math.random() * canvas.width;
                    this.baseY = Math.random() * canvas.height;
                    this.reset();
                }
            }
        }

        const dx = mouse.x - this.baseX;
        const dy = mouse.y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouse.radius;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * this.density;
        const directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius && mouse.x != null) {
            this.x = this.baseX - directionX;
            this.y = this.baseY - directionY;
        } else {
            if (this.x !== this.baseX) {
                const dx = this.x - this.baseX;
                this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
                const dy = this.y - this.baseY;
                this.y -= dy / 20;
            }
        }
    }
}

const particlesArray = [];
const numberOfParticles = window.innerWidth < 768 ? 100 : 250;

function init() {
    particlesArray.length = 0;
    const particles = window.innerWidth < 768 ? 100 : 250;
    for (let i = 0; i < particles; i++) {
        particlesArray.push(new Particle());
    }
}

init();

function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const opacity = (1 - distance / 120) * 0.5;
                const avgOpacity = (particlesArray[a].opacity + particlesArray[b].opacity) / 2;
                ctx.strokeStyle = `rgba(15, 5, 107, ${opacity * avgOpacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function connectToMouse() {
    if (mouse.x == null) return;
    
    for (let i = 0; i < particlesArray.length; i++) {
        const dx = mouse.x - particlesArray[i].x;
        const dy = mouse.y - particlesArray[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const opacity = (1 - distance / mouse.radius) * 0.6;
            ctx.strokeStyle = `rgba(15, 5, 107, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }

    connect();
    connectToMouse();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    resizeCanvas();
    init();
});

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        navbar.style.padding = '1rem 0';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.padding = '1.5rem 0';
    }
    
    lastScroll = currentScroll;
});

document.querySelectorAll('.content-box').forEach(box => {
    box.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.01)';
    });
    
    box.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

const sections = document.querySelectorAll('.section');

function highlightNav() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNav);

document.querySelectorAll('.veille-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = '';
        }, 10);
    });
});

const randomizeParticles = () => {
    const randomParticles = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < randomParticles; i++) {
        const randomIndex = Math.floor(Math.random() * particlesArray.length);
        particlesArray[randomIndex].baseX = Math.random() * canvas.width;
        particlesArray[randomIndex].baseY = Math.random() * canvas.height;
        particlesArray[randomIndex].reset();
    }
};

setInterval(randomizeParticles, 3000);

document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.hero-content > *');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
});