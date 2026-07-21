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
      const categories = card.dataset.category.split(' ');
      if (filter === 'all' || categories.includes(filter)) {
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


// ─── In your JS file or <script> tag ─────────────────────────────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    const page = card.getAttribute('data-page');
    if (page) window.location.href = page;
    console.log(`Navigating to: ${page}`); // For debugging
  });
});

// ─── APK Modal ──────────────────────────────────────────────────
const apkData = {
  readify: {
    title: 'Readify',
    category: 'MOBILE',
    folder: 'res/projects/readify',
    images: ['1.jpg', '2.jpg', '3.jpg'],
    versions: [
      { name: 'V1.0', date: 'Initial Release', url: 'https://github.com/MR-JLTC/Readify/releases/tag/V1.0' }
      // You can add more versions here!
    ]
  },
  // Add other mobile apps here later!
  fintract: {
    title: 'Fintract',
    category: 'MOBILE',
    folder: 'res/projects/fintract',
    images: ['1.jpg', '2.jpg', '3.jpg'],
    versions: [
      { name: 'Latest', date: 'Stable Build', url: 'https://github.com/MR-JLTC/FINTRACT' }
    ]
  },
  shadowcrypt: {
    title: 'ShadowCrypt',
    category: 'MULTI-PLATFORM',
    folder: 'res/projects/shadowcrypt',
    images: ['1.jpg', '2.jpg', '3.jpg', '4.png', '5.png', '6.png', '7.png', '8.png'],
    versions: [
      { name: 'Mobile v3.7(.apk)', date: 'Android Edition', url: 'https://github.com/MR-JLTC/ShadowCrypt/releases/download/v3.7/ShadowCrypt.apk' },
      { name: 'System v3.0 (.exe)', date: 'Desktop Edition', url: 'https://github.com/MR-JLTC/ShadowCrypt/releases/download/v3.7/Setup_ShadowCryptV3.0.exe' },
      { name: 'Library v2.0 (jar)', date: 'Developer Integration', url: 'https://github.com/MR-JLTC/ShadowCrypt/releases/download/v3.7/ShadowCryptLibV2.0.jar' }
    ]
  },
  viora: {
    title: 'Viora',
    category: 'MOBILE', // Multi-Platform soon...
    folder: 'res/projects/viora',
    images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    versions: [
      { name: 'Mobile v2.0(.apk)', date: 'Android Edition', url: 'https://github.com/MR-JLTC/Viora/releases/download/EarlyBird/viora_v2.apk' }
    ]
  }
};

function openApkModal(e, projectId) {
  if (e) e.preventDefault();

  const modal = document.getElementById("apk-modal");
  const data = apkData[projectId];

  if (!modal || !data) return;

  // ============================
  // Populate Header
  // ============================
  modal.querySelector(".apk-modal-title").textContent = data.title;
  modal.querySelector(".proj-cat").textContent = data.category;

  // ============================
  // Populate Gallery
  // ============================
  const track = document.getElementById("apk-gallery-track");
  track.innerHTML = "";

  data.images.forEach(img => {

    const wrap = document.createElement("div");
    wrap.className = "apk-screenshot-wrap";

    const image = document.createElement("img");
    image.src = `${data.folder}/${img}`;
    image.alt = `${data.title} Screenshot`;
    image.className = "apk-screenshot";
    image.loading = "lazy";

    // Hide if image fails to load
    image.onerror = function () {
      wrap.remove();
      setTimeout(updateApkGalleryButtons, 50);
    };

    // Fullscreen when clicked
    image.addEventListener("click", function () {
      openImageViewer(this.src);
    });

    wrap.appendChild(image);
    track.appendChild(wrap);
  });

  // ============================
  // Populate Downloads
  // ============================
  const versionList = modal.querySelector(".apk-versions-list");
  versionList.innerHTML = "";

  data.versions.forEach(ver => {

    const li = document.createElement("li");

    li.innerHTML = `
            <div class="apk-version-info">
                <span class="apk-version-name">${ver.name}</span>
                <span class="apk-version-date">${ver.date}</span>
            </div>

            <a href="${ver.url}"
               target="_blank"
               class="btn btn--primary btn--sm apk-download-btn">
                <i class="fas fa-download"></i>
                Download
            </a>
        `;

    versionList.appendChild(li);
  });

  // Reset gallery scroll
  track.scrollLeft = 0;

  // Show modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Update gallery buttons
  setTimeout(updateApkGalleryButtons, 100);
}

function openImageViewer(src) {
  const viewer = document.getElementById("image-viewer");
  const img = document.getElementById("image-viewer-img");
  img.src = src;
  viewer.style.display = "flex";
}

function closeImageViewer() {
  const viewer = document.getElementById("image-viewer");
  viewer.style.display = "none";
}

document.getElementById("image-viewer").addEventListener("click", function (e) {
  if (e.target === this) {
    closeImageViewer();
  }

});

document.querySelector(".image-viewer-close").addEventListener("click", closeImageViewer);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeImageViewer();
  }

});

function updateApkGalleryButtons() {
  const track = document.getElementById('apk-gallery-track');
  const prevBtn = document.querySelector('.apk-gallery-btn.prev');
  const nextBtn = document.querySelector('.apk-gallery-btn.next');

  if (track && prevBtn && nextBtn) {
    // If the content is wider than the container, show buttons
    if (track.scrollWidth > track.clientWidth) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }
}

window.addEventListener('resize', () => {
  const modal = document.getElementById('apk-modal');
  if (modal && modal.style.display === 'flex') {
    updateApkGalleryButtons();
  }
});

function closeApkModal(e) {
  if (e) e.stopPropagation();
  const modal = document.getElementById('apk-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function scrollApkGallery(direction, e) {
  if (e) e.stopPropagation();
  const track = document.getElementById('apk-gallery-track');
  if (track) {
    const scrollAmount = 220 * direction;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}