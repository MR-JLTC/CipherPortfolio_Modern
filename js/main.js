// ─── Matrix Rain ───────────────────────────────────────────────
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ#$%&<>{}[]';
const chars = '01001001 00100111 01101101 00100000 01110100 01101000 01100101 00100000 01110011 01100101 01100101 01101011 01100101 01110010 00100000 01100001 01101110 01100100 00100000 01110100 01101000 01100101 00100000 01100100 01100101 01110011 01110100 01110010 01101111 01111001 01100101 01110010';
const fontSize = 13;
let columns, drops;

function initMatrix() {
  columns = Math.floor(canvas.width / fontSize);
  drops = Array(columns).fill(1);
}
initMatrix();
window.addEventListener('resize', initMatrix);

function drawMatrix() {
  ctx.fillStyle = 'rgba(8, 12, 8, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41';
  ctx.font = `${fontSize}px JetBrains Mono, monospace`;

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 45);

// ─── Typing Effect ──────────────────────────────────────────────
const titles = [
  'Full Stack Developer',
  'Cybersecurity Enthusiast',
  'Penetration Tester',
  'Mobile Application Developer',
  'Web Developer',
  'Application Developer'
];

let titleIndex = 0, charIndex = 0, deleting = false;
const typingEl = document.getElementById('typing-text');

function typeLoop() {
  const current = titles[titleIndex];
  if (deleting) {
    typingEl.textContent = current.slice(0, --charIndex);
  } else {
    typingEl.textContent = current.slice(0, ++charIndex);
  }

  let delay = deleting ? 60 : 100;
  if (!deleting && charIndex === current.length) { delay = 2000; deleting = true; }
  else if (deleting && charIndex === 0) { deleting = false; titleIndex = (titleIndex + 1) % titles.length; delay = 400; }
  setTimeout(typeLoop, delay);
}
typeLoop();

// ─── Scroll Reveal ──────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── Skill Bar Animation ────────────────────────────────────────
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('#skills').forEach(el => skillObserver.observe(el));

// ─── Active Nav Link ────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + section.id) a.style.color = '#00ff41';
      });
    }
  });
});

// ─── Hamburger Menu ─────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinksList = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinksList.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinksList.classList.remove('open'));
});

// ─── Project Filters ────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ─── Contact Form ───────────────────────────────────────────────
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;
  const btn = e.target.querySelector('button[type="submit"]');

  // Explicitly validate email for @ and .
  if (!email.includes('@') || !email.includes('.')) {
    alert('Please enter a truly valid email address containing "@" and "."');
    return;
  }

  // Actually construct the email and open default mail client
  const mailtoLink = `mailto:loydcipher@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;
  window.location.href = mailtoLink;

  btn.textContent = '▸ Message Sent to Client!';
  btn.style.background = 'var(--neon)';
  btn.style.color = 'var(--bg)';
  setTimeout(() => {
    btn.textContent = '▸ send_message.sh';
    btn.style.background = '';
    btn.style.color = '';
    e.target.reset();
  }, 3000);
});

// ─── Experience Gallery ─────────────────────────────────────────
const galleryTrack = document.querySelector('.gallery-track');
const prevBtn = document.querySelector('.gallery-btn.prev');
const nextBtn = document.querySelector('.gallery-btn.next');

if (galleryTrack && prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    galleryTrack.scrollBy({ left: -300, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    galleryTrack.scrollBy({ left: 300, behavior: 'smooth' });
  });
}
