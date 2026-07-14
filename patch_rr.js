const fs = require('fs');

let content = fs.readFileSync('js/repair_records.js', 'utf-8');

// Replace renderRecords
const renderRecordsNew = `async function renderRecords(records) {
    const grid = document.getElementById('rr-grid');
    const empty = document.getElementById('rr-empty');

    // Clear previous cards (but keep the empty placeholder)
    grid.querySelectorAll('.rr-card').forEach(c => c.remove());

    if (records.length === 0) {
        if (empty) empty.style.display = 'flex';
        return;
    }
    if (empty) empty.style.display = 'none';

    // Group records by customerName
    const groupedRecords = {};
    for (const rec of records) {
        const name = (rec.customer_name || rec.customerName || '—').trim();
        const key = name.toLowerCase();
        if (!groupedRecords[key]) {
            groupedRecords[key] = {
                customerName: name,
                records: []
            };
        }
        groupedRecords[key].records.push(rec);
    }

    for (const groupKey in groupedRecords) {
        const card = await buildGroupCard(groupedRecords[groupKey]);
        grid.appendChild(card);
    }
}`;

content = content.replace(/async function renderRecords\(records\) \{[\s\S]*?async function buildRecordCard/m, renderRecordsNew + '\n\nasync function buildGroupCard');

// Replace buildRecordCard -> buildGroupCard
const buildGroupCardNew = `(group) {
    const card = document.createElement('div');
    card.className = 'rr-card';

    const customerName = group.customerName;
    const records = group.records;

    let innerHtml = \`
      <div class="rr-card__header">
        <div class="rr-card__customer" style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <i class="bi bi-person-fill"></i>
            <span>\${escHtml(customerName)}</span>
          </div>
          <span class="rr-badge">\${records.length} Record\${records.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    \`;

    for (const rec of records) {
        const status = rec.status || 'Completed';
        const statusClass = statusToClass(status);
        const createdAt = formatDate(rec.created_at);
        const updatedAt = formatDate(rec.updated_at);

        const deviceType = rec.repair_type || rec.device_type || '—';
        const deviceModel = rec.device_model || '';
        const issue = rec.customer_feedback || rec.issue_description || '—';
        const folderPath = rec.customer_image_folder_path || rec.imageFolderPath || null;
        const techNotes = rec.technician_notes || '';
        const cost = rec.repair_cost || null;
        const customerRate = rec.customer_rate || null;

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
                return \`
                <button
                  class="rr-thumb \${isExtra ? 'rr-thumb--more' : ''}"
                  onclick='openLightbox(\${JSON.stringify(imageUrls)}, \${i})'
                  title="\${imageAltList[i] || \`Image \${i + 1}\`}"
                  aria-label="View image \${i + 1}"
                >
                  <img src="\${url}" alt="\${imageAltList[i] || \`Repair image \${i + 1}\`}" loading="lazy" />
                  \${isExtra ? \`<span class="rr-thumb__more-label">+\${extraCount} more</span>\` : ''}
                </button>\`;
            }).join('');

            imagesHtml = \`
            <div class="rr-card__gallery">
              <div class="rr-card__gallery-label">
                <i class="bi bi-images"></i> PHOTOS (\${imageUrls.length})
              </div>
              <div class="rr-card__thumbs">\${thumbs}</div>
            </div>\`;
        } else if (folderPath) {
            imagesHtml = \`
            <div class="rr-card__gallery">
              <div class="rr-card__gallery-label"><i class="bi bi-images"></i> PHOTOS</div>
              <p class="rr-no-photos"><i class="bi bi-image-alt"></i> No images uploaded yet.</p>
            </div>\`;
        }

        const costHtml = cost != null
            ? \`<span class="rr-cost">₱\${Number(cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>\`
            : '';

        const borderTop = records.indexOf(rec) > 0 ? 'border-top: 1px solid var(--color-border); padding-top: 1rem;' : '';

        innerHtml += \`
          <div class="rr-card__body" style="\${borderTop}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
               <span class="rr-card__id">#\${String(rec.id).padStart(4, '0')}</span>
               <span class="rr-status rr-status--\${statusClass}">\${status}</span>
            </div>
            <div class="rr-row">
              <i class="bi bi-tools"></i>
              <span><strong>\${escHtml(deviceType)}</strong>\${deviceModel ? ' · ' + escHtml(deviceModel) : ''}</span>
            </div>
            <div class="rr-row">
              <i class="bi bi-chat-right-quote"></i>
              <span>\${escHtml(issue)}</span>
            </div>
            \${customerRate ? \`
            <div class="rr-row">
              <i class="bi bi-star-fill" style="color: #ffd700;"></i>
              <span><strong>\${customerRate} / 5</strong> Rating</span>
            </div>\` : ''}
            \${techNotes ? \`
            <div class="rr-row rr-row--notes">
              <i class="bi bi-chat-left-text"></i>
              <span>\${escHtml(techNotes)}</span>
            </div>\` : ''}
          </div>

          \${imagesHtml}

          <div class="rr-card__footer" \${records.indexOf(rec) < records.length - 1 ? 'style="border-bottom: 0;"' : ''}>
            <span class="rr-date">
              <i class="bi bi-calendar-event"></i> \${createdAt}
              \${updatedAt && updatedAt !== createdAt ? \`<span class="rr-date__updated"> · Updated \${updatedAt}</span>\` : ''}
            </span>
            \${costHtml}
          </div>
        \`;
    }

    card.innerHTML = innerHtml;
    return card;
}

// ─── Storage helpers`;

content = content.replace(/\(rec\) \{[\s\S]*?\/\/ ─── Storage helpers/m, buildGroupCardNew);

fs.writeFileSync('js/repair_records.js', content, 'utf-8');
console.log('Patch applied successfully.');
