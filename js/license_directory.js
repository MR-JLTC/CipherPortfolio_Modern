// Initialize Supabase Client
// Credentials are injected at build time by `generate-config.js` into `js/supabaseConfig.js`
// as window.SUPABASE_URL and window.SUPABASE_ANON_KEY.
// On Netlify: populated from the dashboard Environment Variables.
// Locally: run `node generate-config.js` first (reads your .env file).
let supabaseClient = null;

(function initSupabase() {
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Supabase init failed: window.SUPABASE_URL or window.SUPABASE_ANON_KEY is not defined. ' +
            'Locally, run `node generate-config.js`. On Netlify, set the env vars in the dashboard.');
        return;
    }

    supabaseClient = window.supabase.createClient(url, key);
    console.log('Supabase client initialized.');
})();

let isAuthenticated = false;
let currentProduct = '';
let currentVersion = 'microsoft365';

// Office versions and their products
const officeVersions = {
    'microsoft365': [
        { id: 'O365ProPlusRetail', title: 'Microsoft 365 ProPlus', desc: 'Access, Excel, Teams, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-microsoft' },
        { id: 'O365AppsBasicRetail', title: 'Microsoft 365 Apps Basic', desc: 'Excel, OneNote, PowerPoint, Word, OneDrive', icon: 'bi-file-earmark-text' },
        { id: 'O365BusinessRetail', title: 'Microsoft 365 Business', desc: 'Access, Excel, Teams, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-briefcase' },
        { id: 'O365EduCloudRetail', title: 'Microsoft 365 Education', desc: 'Excel, OneNote, PowerPoint, Word, OneDrive, Teams', icon: 'bi-mortarboard' },
        { id: 'O365HomePremRetail', title: 'Microsoft 365 Home Premium', desc: 'Access, Excel, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-house' },
        { id: 'O365SmallBusPremRetail', title: 'Microsoft 365 Small Business Premium', desc: 'Access, Excel, Teams, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-building' },
        { id: 'ProjectProRetail', title: 'Project Professional', desc: 'Microsoft Project for project management', icon: 'bi-kanban' },
        { id: 'VisioProRetail', title: 'Visio Professional', desc: 'Visio for diagrams and flowcharts, OneDrive', icon: 'bi-diagram-3' }
    ],
    'office2024': [
        { id: 'ProPlus2024Retail', title: 'Office 2024 Professional Plus', desc: 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher', icon: 'bi-microsoft' },
        { id: 'HomeStudent2024Retail', title: 'Office 2024 Home & Student', desc: 'Word, Excel, PowerPoint, OneNote', icon: 'bi-mortarboard' },
        { id: 'HomeBusiness2024Retail', title: 'Office 2024 Home & Business', desc: 'Word, Excel, PowerPoint, Outlook, OneNote', icon: 'bi-briefcase' }
    ],
    'office2021': [
        { id: 'ProPlus2021Retail', title: 'Office 2021 Professional Plus', desc: 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher', icon: 'bi-microsoft' },
        { id: 'HomeStudent2021Retail', title: 'Office 2021 Home & Student', desc: 'Word, Excel, PowerPoint, OneNote', icon: 'bi-mortarboard' },
        { id: 'HomeBusiness2021Retail', title: 'Office 2021 Home & Business', desc: 'Word, Excel, PowerPoint, Outlook, OneNote', icon: 'bi-briefcase' },
        { id: 'Professional2021Retail', title: 'Office 2021 Professional', desc: '	Access, Excel, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-briefcase' }
    ],
    'office2019': [
        { id: 'ProPlus2019Retail', title: 'Office 2019 Professional Plus', desc: 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher', icon: 'bi-microsoft' },
        { id: 'HomeStudent2019Retail', title: 'Office 2019 Home & Student', desc: 'Word, Excel, PowerPoint, OneNote', icon: 'bi-mortarboard' },
        { id: 'HomeBusiness2019Retail', title: 'Office 2019 Home & Business', desc: 'Word, Excel, PowerPoint, Outlook, OneNote', icon: 'bi-briefcase' },
        { id: 'Professional2019Retail', title: 'Office 2019 Professional', desc: '	Access, Excel, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-briefcase' }
    ],
    'office2016': [
        { id: 'ProPlus2016Retail', title: 'Office 2016 Professional Plus', desc: 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher', icon: 'bi-microsoft' },
        { id: 'HomeStudent2016Retail', title: 'Office 2016 Home & Student', desc: 'Word, Excel, PowerPoint, OneNote', icon: 'bi-mortarboard' },
        { id: 'HomeBusiness2016Retail', title: 'Office 2016 Home & Business', desc: 'Word, Excel, PowerPoint, Outlook, OneNote', icon: 'bi-briefcase' },
        { id: 'Professional2016Retail', title: 'Office 2016 Professional', desc: '	Access, Excel, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-briefcase' }
    ],
    'office2013': [
        { id: 'ProPlus2013Retail', title: 'Office 2013 Professional Plus', desc: 'Word, Excel, PowerPoint, Outlook, OneNote, Access, Publisher', icon: 'bi-microsoft' },
        { id: 'HomeStudent2013Retail', title: 'Office 2013 Home & Student', desc: 'Word, Excel, PowerPoint, OneNote', icon: 'bi-mortarboard' },
        { id: 'HomeBusiness2013Retail', title: 'Office 2013 Home & Business', desc: 'Word, Excel, PowerPoint, Outlook, OneNote', icon: 'bi-briefcase' },
        { id: 'Professional2013Retail', title: 'Office 2013 Professional', desc: '	Access, Excel, OneNote, Outlook, PowerPoint, Publisher, Word, OneDrive', icon: 'bi-briefcase' }
    ]
};

// Download links for Office versions
const downloadLinks = {
    // Microsoft 365
    'O365ProPlusRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365ProPlusRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365ProPlusRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/O365ProPlusRetail.img'
    },
    'O365AppsBasicRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365AppsBasicRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365AppsBasicRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': null
    },
    'O365BusinessRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365BusinessRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365BusinessRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/O365BusinessRetail.img'
    },
    'O365EduCloudRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365EduCloudRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365EduCloudRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': null
    },
    'O365HomePremRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365HomePremRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365HomePremRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/O365HomePremRetail.img'
    },
    'O365SmallBusPremRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365SmallBusPremRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365SmallBusPremRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': null
    },
    'ProjectProRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProjectProRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProjectProRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProjectProRetail.img'
    },
    'VisioProRetail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=VisioProRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=VisioProRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/VisioProRetail.img'
    },

    // Office 2024
    'ProPlus2024Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2024Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2024Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProPlus2024Retail.img'
    },
    'HomeStudent2024Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=Home2024Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=Home2024Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/Home2024Retail.img'
    },
    'HomeBusiness2024Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusiness2024Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusiness2024Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeBusiness2024Retail.img'
    },

    // Office 2021
    'ProPlus2021Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2021Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2021Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProPlus2021Retail.img'
    },
    'HomeStudent2021Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudent2021Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudent2021Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeStudent2021Retail.img'
    },
    'HomeBusiness2021Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusiness2021Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusiness2021Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeBusiness2021Retail.img'
    },

    'Professional2021Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=Professional2021Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=Professional2021Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/Professional2021Retail.img'
    },

    // Office 2019
    'ProPlus2019Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2019Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2019Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProPlus2019Retail.img'
    },
    'HomeStudent2019Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudent2019Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudent2019Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeStudent2019Retail.img'
    },
    'HomeBusiness2019Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusiness2019Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusiness2019Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeBusiness2019Retail.img'
    },

    'Professional2019Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=Professional2019Retail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=Professional2019Retail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/Professional2019Retail.img'
    },

    // Office 2016
    'ProPlus2016Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlusRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlusRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProPlusRetail.img'
    },
    'HomeStudent2016Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudentRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudentRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeStudentRetail.img'
    },
    'HomeBusiness2016Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusinessRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusinessRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeBusinessRetail.img'
    },

    'Professional2016Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProfessionalRetail&platform=x64&language=en-us&version=O16GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProfessionalRetail&platform=x86&language=en-us&version=O16GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProfessionalRetail.img'
    },

    // Office 2013
    'ProPlus2013Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlusRetail&platform=x64&language=en-us&version=O15GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlusRetail&platform=x86&language=en-us&version=O15GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProPlus2013Retail.img'
    },
    'HomeStudent2013Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudentRetail&platform=x64&language=en-us&version=O15GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeStudentRetail&platform=x86&language=en-us&version=O15GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/HomeStudent2013Retail.img'
    },
    'HomeBusiness2013Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusinessRetail&platform=x64&language=en-us&version=O15GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=HomeBusinessRetail&platform=x86&language=en-us&version=O15GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/39168d7e-077b-48e7-872c-b232c3e72675/media/en-us/HomeBusinessRetail.img'
    },

    'Professional2013Retail': {
        'online-x64': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProfessionalRetail&platform=x64&language=en-us&version=O15GA',
        'online-x32': 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProfessionalRetail&platform=x86&language=en-us&version=O15GA',
        'offline-x32-x64': 'https://officecdn.microsoft.com/db/39168d7e-077b-48e7-872c-b232c3e72675/media/en-us/ProfessionalRetail.img'
    }
};

function switchVersion(version) {
    currentVersion = version;

    // Update active tab
    document.querySelectorAll('.version-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load products for selected version
    loadProducts(version);
}

function loadProducts(version) {
    const container = document.getElementById('office-versions');
    const products = officeVersions[version] || [];

    container.innerHTML = '';

    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'col-lg-4 col-md-6 fade-in';
        productCard.style.animationDelay = `${index * 0.1}s`;

        productCard.innerHTML = `
            <div class="office-card card h-100 p-4 text-center" onclick="showDownloadOptions('${product.id}')">
                <div class="card-body">
                    <i class="${product.icon} display-4 text-primary mb-3"></i>
                    <h5 class="card-title fw-bold">${product.title}</h5>
                    <p class="card-text text-muted small mb-4">${product.desc}</p>
                    <button class="btn download-btn text-white w-100">
                        <i class="bi bi-download me-2"></i>Select Download
                    </button>
                </div>
            </div>
        `;

        container.appendChild(productCard);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    loadProducts('microsoft365');

    // Restore auth state from session (persists until tab is closed)
    if (sessionStorage.getItem('lic_auth') === 'true') {
        isAuthenticated = true;
        showActivationCommand();  // restore the command bar on reload
    }
});

function openModal(modalId) {
    // If already authenticated, skip the passkey modal entirely
    if ((modalId === 'passkeyModal' || !modalId) && isAuthenticated) {
        showToast('Already verified! Access granted.', 'success', 'bi-shield-check');
        return;
    }

    const modal = document.getElementById(modalId || 'passkeyModal');
    if (modal) {
        modal.classList.add('is-open');
        if (modalId === 'passkeyModal' || !modalId) {
            setTimeout(() => {
                const passkeyInput = document.getElementById('passkey');
                if (passkeyInput) passkeyInput.focus();
            }, 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('is-open');
    }
}

// Shows the activation command bar on the page after successful verification
function showActivationCommand() {
    if (document.getElementById('activation-bar')) return; // already shown

    const command = 'irm https://get.activated.win | iex';

    const bar = document.createElement('div');
    bar.id = 'activation-bar';
    bar.style.cssText = [
        'position: fixed',
        'bottom: 1.5rem',
        'left: 50%',
        'transform: translateX(-50%)',
        'z-index: 9999',
        'background: linear-gradient(135deg, rgba(0,255,180,0.12), rgba(0,200,255,0.10))',
        'border: 1px solid rgba(0,255,180,0.4)',
        'border-radius: 10px',
        'padding: 0.85rem 1.4rem',
        'display: flex',
        'align-items: center',
        'gap: 1rem',
        'backdrop-filter: blur(12px)',
        'box-shadow: 0 0 24px rgba(0,255,180,0.2)',
        'font-family: "JetBrains Mono", monospace',
        'max-width: 90vw',
        'animation: slideUp 0.4s ease',
    ].join(';');

    bar.innerHTML = `
        <i class="bi bi-terminal" style="color:#00ffb4; font-size:1.1rem;"></i>
        <span style="color:#00ffb4; font-size:0.75rem; letter-spacing:0.05em;">ACTIVATION CMD</span>
        <code id="activation-bar-cmd"
              style="color:#fff; background:rgba(0,0,0,0.4); padding:0.3rem 0.8rem;
                     border-radius:6px; font-size:0.85rem; cursor:pointer;"
              title="Click to copy">${command}</code>
        <button onclick="copyActivationCmd(this)"
                style="background:rgba(0,255,180,0.15); border:1px solid rgba(0,255,180,0.4);
                       color:#00ffb4; border-radius:6px; padding:0.3rem 0.7rem;
                       font-size:0.78rem; cursor:pointer; white-space:nowrap;">
            <i class="bi bi-clipboard"></i> Copy
        </button>
    `;

    document.body.appendChild(bar);

    // Add slide-up animation if not already defined
    if (!document.getElementById('activation-bar-style')) {
        const style = document.createElement('style');
        style.id = 'activation-bar-style';
        style.textContent = `@keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`;
        document.head.appendChild(style);
    }
}

function copyActivationCmd(btn) {
    const cmd = document.getElementById('activation-bar-cmd').textContent;
    navigator.clipboard.writeText(cmd).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        btn.style.color = '#fff';
        setTimeout(() => { btn.innerHTML = original; btn.style.color = '#00ffb4'; }, 2000);
    });
}

function showToast(message, type = 'info', icon = 'bi-info-circle', duration = 3000) {
    let container = document.getElementById('neon-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'neon-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `neon-toast neon-toast--${type}`;
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem;">
            <i class="bi ${icon}"></i>
            <span>${message}</span>
        </div>
        <button type="button" onclick="this.parentElement.classList.remove('is-visible'); setTimeout(() => this.parentElement.remove(), 300)"><i class="bi bi-x"></i></button>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('is-visible'), 10);

    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('is-visible');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
    return toast;
}

function showDownloadOptions(productId) {
    if (!isAuthenticated) {
        showToast('Please verify your passkey first!', 'warning', 'bi-exclamation-triangle');
        return;
    }

    currentProduct = productId;
    const productName = productId.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase());
    document.getElementById('downloadTitle').textContent = productName;

    // Show/hide offline option
    const offlineOption = document.getElementById('offlineOption');
    const hasOfflineOption = downloadLinks[productId] && downloadLinks[productId]['offline-x32-x64'];
    offlineOption.style.display = hasOfflineOption ? 'block' : 'none';

    openModal('downloadModal');
}

async function verifyPasskey(event) {
    event.preventDefault();
    const passkeyInput = document.getElementById('passkey');
    const verifyBtn = document.getElementById('verifyBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Show loading state
    verifyBtn.innerHTML = '<span class="loading-spinner me-2"></span>Verifying...';
    verifyBtn.disabled = true;

    // Hide previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    // Check if Supabase is initialized
    if (!supabaseClient) {
        showToast("System Error: Supabase not configured. On Netlify, check Environment Variables. Locally, run: node generate-config.js", 'error', 'bi-x-circle');
        verifyBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Verify & Continue';
        verifyBtn.disabled = false;
        return;
    }

    // Fetch the stored hashed passkey from Supabase
    // Table: 'licenses', Column: 'key' (stores the SHA-256 hashed passkey)
    let storedHash = null;
    try {
        const { data, error } = await supabaseClient
            .from('licenses')
            .select('key')
            .limit(1)
            .maybeSingle();  // returns null instead of throwing when 0 rows

        if (error) throw error;

        if (!data) {
            throw new Error('No passkey record found in the licenses table.');
        }

        storedHash = data.key;
    } catch (error) {
        console.error("Error fetching passkey from Supabase:", error);
        showToast("Network Error: Could not connect to verification server.", 'error', 'bi-hdd-network');
        verifyBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Verify & Continue';
        verifyBtn.disabled = false;
        return;
    }

    // Hash the input passkey
    const inputPasskey = passkeyInput.value;
    const hashedInput = await hashString(inputPasskey);

    // ── DEV HELPER ──────────────────────────────────────────────────────────
    // Copy this hash and INSERT it into Supabase: licenses.key
    // SQL: INSERT INTO licenses (key) VALUES ('<hash>');
    console.log('%c[Passkey Hash] Copy this into Supabase → licenses.key:', 'color: #0ff; font-weight: bold;', hashedInput);
    // ────────────────────────────────────────────────────────────────────────

    if (hashedInput === storedHash) {
        isAuthenticated = true;
        sessionStorage.setItem('lic_auth', 'true');  // persist for this tab session

        successMessage.style.display = 'block';
        document.getElementById('commandSection').style.display = 'block';

        showToast('Access granted! Passkey verified.', 'success', 'bi-shield-check', 4000);
        showActivationCommand();

        setTimeout(() => {
            closeModal('passkeyModal');
            passkeyInput.value = '';
        }, 2000);
    } else {
        errorMessage.style.display = 'block';
        passkeyInput.value = '';
        passkeyInput.focus();
    }

    // Reset button
    verifyBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Verify & Continue';
    verifyBtn.disabled = false;
}

async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function downloadOffice(type) {
    const downloadUrl = downloadLinks[currentProduct] && downloadLinks[currentProduct][type];

    if (!downloadUrl) {
        // Create a dummy download for demonstration
        const fileName = `${currentProduct}_${type}.exe`;
        showDownloadProgress(fileName);
        return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show download notification
    showDownloadNotification();
}

function showDownloadProgress(fileName) {
    closeModal('downloadModal');

    const toast = showToast(`Downloading ${fileName}... 0%`, 'info', 'bi-arrow-repeat spin', 0);
    const textSpan = toast.querySelector('span');

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            textSpan.textContent = `Downloading ${fileName}... 100%`;
            setTimeout(() => {
                toast.classList.remove('is-visible');
                setTimeout(() => toast.remove(), 300);
                showDownloadComplete(fileName);
            }, 500);
        } else {
            textSpan.textContent = `Downloading ${fileName}... ${Math.round(progress)}%`;
        }
    }, 200);
}

function showDownloadComplete(fileName) {
    showToast(`${fileName} downloaded successfully!`, 'success', 'bi-check-circle');
}

function showDownloadNotification() {
    showToast('Download started! Check your Downloads folder.', 'info', 'bi-download');
}

function copyCommand() {
    const command = document.getElementById('activationCommand').textContent;
    navigator.clipboard.writeText(command).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check me-1"></i>Copied!';
        copyBtn.classList.add('btn-success');
        copyBtn.classList.remove('copy-btn');

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('btn-success');
            copyBtn.classList.add('copy-btn');
        }, 2000);
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay.is-open');
        modals.forEach(modal => {
            modal.classList.remove('is-open');
        });
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});