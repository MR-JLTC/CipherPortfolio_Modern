/**
 * repair_records.js
 * Fetches records from the `repair_records` Supabase table and
 * lists images from each record's folder in the storage bucket.
 *
 * Depends on:
 *   - window.supabase (supabase-js v2 CDN)
 *   - window.SUPABASE_URL / window.SUPABASE_ANON_KEY (from supabaseConfig.js)
 *   - supabaseClient (initialized in license_directory.js)
 */

// ─── Config ────────────────────────────────────────────────────────────────
const RR_BUCKET = 'repair-photos';          // Storage bucket name
const RR_TABLE = 'repair_records';          // Table name
const RR_ORDER_COL = 'created_at';             // Sort column
const RR_ORDER_ASC = false;                    // newest first

// ─── State ─────────────────────────────────────────────────────────────────
let allRecords = [];                       // raw records from DB
let lbImages = [];                       // current lightbox image array
let lbIndex = 0;                        // current lightbox index

// ─── Bootstrap on DOM ready ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadRepairRecords();

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        const lb = document.getElementById('rr-lightbox');
        if (!lb || !lb.classList.contains('is-open')) return;
        if (e.key === 'ArrowLeft') shiftLightbox(-1, e);
        if (e.key === 'ArrowRight') shiftLightbox(1, e);
        if (e.key === 'Escape') closeLightbox();
    });
});

// ─── Fetch & Render ─────────────────────────────────────────────────────────
async function loadRepairRecords() {
    const grid = document.getElementById('rr-grid');
    const loading = document.getElementById('rr-loading');
    const empty = document.getElementById('rr-empty');
    const filters = document.getElementById('rr-filters');
    const badge = document.getElementById('rr-count-badge');
    const sbItem = document.getElementById('rr-status-bar-item');

    // Guard: supabase not ready yet (may initialise after DOMContentLoaded)
    await waitForSupabase();

    if (!supabaseClient) {
        showRrError('Supabase not configured — repair records unavailable.');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from(RR_TABLE)
            .select('*')
            .order(RR_ORDER_COL, { ascending: RR_ORDER_ASC });

        if (error) throw error;

        allRecords = data || [];

        // Remove skeleton loader
        if (loading) loading.remove();

        if (allRecords.length === 0) {
            if (empty) empty.style.display = 'flex';
            return;
        }

        // Show filter bar & badge
        if (filters) filters.style.display = 'flex';
        if (badge) {
            badge.textContent = `${allRecords.length} record${allRecords.length !== 1 ? 's' : ''}`;
            badge.style.display = 'inline-flex';
        }
        if (sbItem) sbItem.textContent = `RECORDS: ${allRecords.length} LOADED`;

        renderRecords(allRecords);

    } catch (err) {
        console.error('[RepairRecords] Fetch error:', err);
        if (loading) loading.remove();
        showRrError(`Failed to load records: ${err.message}`);
    }
}

async function renderRecords(records) {
    const grid = document.getElementById('rr-grid');
    const empty = document.getElementById('rr-empty');

    // Clear previous cards (but keep the empty placeholder)
    grid.querySelectorAll('.rr-card').forEach(c => c.remove());

    if (records.length === 0) {
        if (empty) empty.style.display = 'flex';
        return;
    }
    if (empty) empty.style.display = 'none';

    for (const rec of records) {
        const card = await buildRecordCard(rec);
        grid.appendChild(card);
    }
}

async function buildRecordCard(rec) {
    const card = document.createElement('div');
    card.className = 'rr-card';
    card.dataset.id = rec.id;
    card.dataset.status = (rec.status || '').toLowerCase();

    const statusClass = statusToClass(rec.status);
    const createdAt = formatDate(rec.created_at);
    const updatedAt = formatDate(rec.updated_at);

    // ── Fields (handle flexible column names) ──────────────────────────────
    const customerName = rec.customer_name || rec.customerName || '—';
    const deviceType = rec.repair_type || rec.device_type || '—';
    const deviceModel = rec.device_model || '';
    const issue = rec.customer_feedback || rec.issue_description || '—';
    const status = rec.status || 'Completed';
    const folderPath = rec.customer_image_folder_path || rec.imageFolderPath || null;
    const techNotes = rec.technician_notes || '';
    const cost = rec.repair_cost || null;
    const customerRate = rec.customer_rate || null;

    // ── Load images from bucket ────────────────────────────────────────────
    let imagesHtml = '';
    let imageUrls = [];
    let imageAltList = [];

    if (folderPath && supabaseClient) {
        const result = await fetchFolderImages(folderPath);
        imageUrls = result.urls;
        imageAltList = result.alts;
    }

    if (imageUrls.length > 0) {
        const thumbs = imageUrls.slice(0, 4).map((url, i) => {
            const isExtra = i === 3 && imageUrls.length > 4;
            const extraCount = imageUrls.length - 3;
            return `
            <button
              class="rr-thumb ${isExtra ? 'rr-thumb--more' : ''}"
              onclick="openLightbox(${JSON.stringify(imageUrls)}, ${i})"
              title="${imageAltList[i] || `Image ${i + 1}`}"
              aria-label="View image ${i + 1}"
            >
              <img src="${url}" alt="${imageAltList[i] || `Repair image ${i + 1}`}" loading="lazy" />
              ${isExtra ? `<span class="rr-thumb__more-label">+${extraCount} more</span>` : ''}
            </button>`;
        }).join('');

        imagesHtml = `
        <div class="rr-card__gallery">
          <div class="rr-card__gallery-label">
            <i class="bi bi-images"></i> PHOTOS (${imageUrls.length})
          </div>
          <div class="rr-card__thumbs">${thumbs}</div>
        </div>`;
    } else if (folderPath) {
        imagesHtml = `
        <div class="rr-card__gallery">
          <div class="rr-card__gallery-label"><i class="bi bi-images"></i> PHOTOS</div>
          <p class="rr-no-photos"><i class="bi bi-image-alt"></i> No images uploaded yet.</p>
        </div>`;
    }

    // ── Cost pill ─────────────────────────────────────────────────────────
    const costHtml = cost != null
        ? `<span class="rr-cost">₱${Number(cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>`
        : '';

    card.innerHTML = `
      <div class="rr-card__header">
        <div class="rr-card__meta">
          <span class="rr-card__id">#${String(rec.id).padStart(4, '0')}</span>
          <span class="rr-status rr-status--${statusClass}">${status}</span>
        </div>
        <div class="rr-card__customer">
          <i class="bi bi-person-fill"></i>
          <span>${escHtml(customerName)}</span>
        </div>
      </div>

      <div class="rr-card__body">
        <div class="rr-row">
          <i class="bi bi-tools"></i>
          <span><strong>${escHtml(deviceType)}</strong>${deviceModel ? ' · ' + escHtml(deviceModel) : ''}</span>
        </div>
        <div class="rr-row">
          <i class="bi bi-chat-right-quote"></i>
          <span>${escHtml(issue)}</span>
        </div>
        ${customerRate ? `
        <div class="rr-row">
          <i class="bi bi-star-fill" style="color: #ffd700;"></i>
          <span><strong>${customerRate} / 5</strong> Rating</span>
        </div>` : ''}
        ${techNotes ? `
        <div class="rr-row rr-row--notes">
          <i class="bi bi-chat-left-text"></i>
          <span>${escHtml(techNotes)}</span>
        </div>` : ''}
      </div>

      ${imagesHtml}

      <div class="rr-card__footer">
        <span class="rr-date">
          <i class="bi bi-calendar-event"></i> ${createdAt}
          ${updatedAt && updatedAt !== createdAt ? `<span class="rr-date__updated"> · Updated ${updatedAt}</span>` : ''}
        </span>
        ${costHtml}
      </div>
    `;

    return card;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────
// async function fetchFolderImages(folderPath) {
//     try {
//         const { data, error } = await supabaseClient
//             .storage
//             .from(RR_BUCKET)
//             .list(folderPath, { limit: 50, sortBy: { column: 'name', order: 'asc' } });

//         if (error) {
//             console.warn('[RepairRecords] Storage list error for folder:', folderPath, error);
//             return { urls: [], alts: [] };
//         }

//         const imageFiles = (data || []).filter(f =>
//             f.name && /\.(jpe?g|png|webp|gif|avif|heic|bmp)$/i.test(f.name)
//         );

//         const urls = imageFiles.map(f => {
//             const { data: urlData } = supabaseClient
//                 .storage
//                 .from(RR_BUCKET)
//                 .getPublicUrl(`${folderPath}/${f.name}`);
//             return urlData.publicUrl;
//         });

//         const alts = imageFiles.map(f => f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));

//         return { urls, alts };
//     } catch (err) {
//         console.warn('[RepairRecords] fetchFolderImages error:', err);
//         return { urls: [], alts: [] };
//     }
// }

async function fetchFolderImages(folderPath) {
    console.log('[RR-DEBUG] Fetching folder:', JSON.stringify(folderPath), 'from bucket:', RR_BUCKET);
    try {
        const { data, error } = await supabaseClient
            .storage
            .from(RR_BUCKET)
            .list(folderPath, { limit: 50, sortBy: { column: 'name', order: 'asc' } });

        console.log('[RR-DEBUG] list() result — data:', data, 'error:', error);

        if (error) {
            console.warn('[RepairRecords] Storage list error for folder:', folderPath, error);
            return { urls: [], alts: [] };
        }

        if (!data || data.length === 0) {
            console.warn('[RR-DEBUG] list() returned EMPTY for folder:', folderPath);
            return { urls: [], alts: [] };
        }

        console.log('[RR-DEBUG] Files found:', data.map(f => f.name));

        const imageFiles = (data || []).filter(f =>
            f.name && /\.(jpe?g|png|webp|gif|avif|heic|bmp)$/i.test(f.name)
        );

        console.log('[RR-DEBUG] Files matching image regex:', imageFiles.map(f => f.name));

        const urls = imageFiles.map(f => {
            const { data: urlData } = supabaseClient
                .storage
                .from(RR_BUCKET)
                .getPublicUrl(`${folderPath}/${f.name}`);
            return urlData.publicUrl;
        });

        console.log('[RR-DEBUG] Generated URLs:', urls);

        const alts = imageFiles.map(f => f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
        return { urls, alts };
    } catch (err) {
        console.error('[RR-DEBUG] Exception:', err);
        return { urls: [], alts: [] };
    }
}

// ─── Filter ──────────────────────────────────────────────────────────────────
function filterRepairRecords() {
    const query = (document.getElementById('rr-search')?.value || '').toLowerCase().trim();
    const status = (document.getElementById('rr-status-filter')?.value || '').toLowerCase();

    const filtered = allRecords.filter(rec => {
        const haystack = [
            rec.customer_name, rec.customerName,
            rec.repair_type, rec.device_type,
            rec.device_model,
            rec.customer_feedback, rec.issue_description,
            rec.technician_notes,
            rec.customer_rate
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesQuery = !query || haystack.includes(query);
        const matchesStatus = !status || (rec.status || '').toLowerCase() === status;
        return matchesQuery && matchesStatus;
    });

    renderRecords(filtered);
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function openLightbox(images, index) {
    lbImages = images;
    lbIndex = index;
    updateLightbox();
    const lb = document.getElementById('rr-lightbox');
    if (lb) lb.classList.add('is-open');
    document.body.classList.add('lb-open');
}

function closeLightbox() {
    const lb = document.getElementById('rr-lightbox');
    if (lb) lb.classList.remove('is-open');
    document.body.classList.remove('lb-open');
}

function shiftLightbox(dir, event) {
    if (event) event.stopPropagation();
    lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
    updateLightbox();
}

function updateLightbox() {
    const img = document.getElementById('rr-lightbox-img');
    const caption = document.getElementById('rr-lightbox-caption');
    const prev = document.getElementById('lb-prev');
    const next = document.getElementById('lb-next');

    if (!img) return;
    img.src = lbImages[lbIndex];
    img.alt = `Image ${lbIndex + 1} of ${lbImages.length}`;
    if (caption) caption.textContent = `${lbIndex + 1} / ${lbImages.length}`;

    const multi = lbImages.length > 1;
    if (prev) prev.style.display = multi ? 'flex' : 'none';
    if (next) next.style.display = multi ? 'flex' : 'none';
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function statusToClass(status = '') {
    const s = status.toLowerCase().replace(/\s+/g, '-');
    const map = {
        'pending': 'pending',
        'in-progress': 'progress',
        'in progress': 'progress',
        'completed': 'done',
        'cancelled': 'cancelled',
        'canceled': 'cancelled',
    };
    return map[s] || 'unknown';
}

function formatDate(iso) {
    if (!iso) return null;
    try {
        return new Date(iso).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch { return iso; }
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showRrError(msg) {
    const grid = document.getElementById('rr-grid');
    if (!grid) return;
    const el = document.createElement('p');
    el.className = 'rr-empty rr-empty--error';
    el.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${escHtml(msg)}`;
    grid.appendChild(el);
}

// Waits up to 2 s for supabaseClient to be defined by license_directory.js
function waitForSupabase(timeoutMs = 2000) {
    return new Promise(resolve => {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            resolve();
            return;
        }
        const start = Date.now();
        const poll = setInterval(() => {
            if ((typeof supabaseClient !== 'undefined' && supabaseClient) || Date.now() - start >= timeoutMs) {
                clearInterval(poll);
                resolve();
            }
        }, 50);
    });
}
