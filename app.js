const postFiles = [];

const pfpImages = {
    light: './assest/spidey.jpg',
    dark: './assest/black.jpg'
};

const GITHUB_USERNAME = 'Haruki-codee';
const GITHUB_REPO = 'Haruki-codee.github.io';

let allPosts = [];

async function fetchAndParsePosts() {
    allPosts = [];
    for (const file of postFiles) {
        try {
            const res = await fetch(file);
            if (!res.ok) continue;
            const text = await res.text();
            
            const parts = text.split('---');
            if (parts.length >= 3) {
                const metadata = jsyaml.load(parts[1]);
                const body = parts.slice(2).join('---');
                allPosts.push({ ...metadata, body, filename: file });
            }
        } catch (err) {
            console.error(`Failed to load ${file}`, err);
        }
    }
    showAllPosts();
    renderLogs();
}

// Render Horizontal Post Cards with Thumbnails (Matching Screenshot UI)
function renderPosts(posts) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="p-8 bg-white dark:bg-cardBg/60 backdrop-blur-sm border border-gray-200 dark:border-borderClr rounded-2xl text-center shadow-sm">
                <p class="text-gray-700 dark:text-gray-300 font-medium text-sm">No posts available yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = posts.map((post, idx) => `
        <article onclick="openPostView(${idx})" class="group cursor-pointer bg-white dark:bg-cardBg/60 backdrop-blur-sm border border-gray-200 dark:border-borderClr rounded-xl p-5 hover:border-indigo-500/40 shadow-sm hover:shadow-indigo-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 mb-4">
            <div class="flex-1 space-y-2">
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">${post.title}</h3>
                <p class="text-xs text-gray-600 dark:text-accentText leading-relaxed line-clamp-2">${post.summary || ''}</p>
                <div class="flex items-center gap-4 text-xs font-mono text-gray-500 pt-1">
                    <span><i class="fa-regular fa-calendar mr-1.5 text-indigo-500/80"></i>${post.date || ''}</span>
                    <span><i class="fa-solid fa-folder mr-1.5 text-indigo-500/80"></i>${post.category || 'General'}</span>
                </div>
            </div>
            ${post.image ? `
                <div class="w-full md:w-48 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-borderClr bg-gray-100 dark:bg-darkBg">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
            ` : ''}
        </article>
    `).join('');
}

// Full Reading View when a card is clicked
function openPostView(index) {
    const post = allPosts[index];
    if (!post) return;

    document.getElementById('current-view-title').innerText = `Home / ${post.title}`;
    const container = document.getElementById('posts-container');

    const htmlBody = typeof marked !== 'undefined' ? marked.parse(post.body) : post.body;

    container.innerHTML = `
        <div class="bg-white dark:bg-cardBg/60 backdrop-blur-sm border border-gray-200 dark:border-borderClr rounded-2xl p-6 md:p-8 space-y-6">
            <button onclick="showAllPosts()" class="text-xs font-mono text-indigo-500 hover:underline flex items-center gap-1">
                <i class="fa-solid fa-arrow-left"></i> Back to posts
            </button>
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">${post.title}</h1>
                <div class="flex items-center gap-4 text-xs font-mono text-gray-500 border-b border-gray-200 dark:border-borderClr pb-4">
                    <span><i class="fa-regular fa-calendar mr-1 text-indigo-500"></i> ${post.date || ''}</span>
                    <span><i class="fa-solid fa-folder mr-1 text-indigo-500"></i> ${post.category || 'General'}</span>
                </div>
            </div>
            ${post.image ? `<img src="${post.image}" class="w-full rounded-xl max-h-96 object-cover border border-gray-200 dark:border-borderClr">` : ''}
            <div class="prose dark:prose-invert text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                ${htmlBody}
            </div>
        </div>
    `;
}

function showCategoryFolders() {
    setActiveNav('nav-category');
    document.getElementById('current-view-title').innerText = 'Category / Directory';
    
    const container = document.getElementById('posts-container');
    const categoriesMap = {};
    
    allPosts.forEach(post => {
        const cat = post.category || 'General';
        categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    const categories = Object.keys(categoriesMap);

    if (categories.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-500">No category folders created yet.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${categories.map(cat => `
                <div onclick="openFolder('${cat}')" class="group cursor-pointer p-5 bg-white dark:bg-cardBg/60 backdrop-blur-sm border border-gray-200 dark:border-borderClr rounded-xl hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                            <i class="fa-solid fa-folder text-xl"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-400">${cat}</h4>
                            <p class="text-xs text-gray-500 dark:text-accentText">${categoriesMap[cat]} item${categoriesMap[cat] > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs text-gray-400 group-hover:translate-x-1 transition-transform"></i>
                </div>
            `).join('')}
        </div>
    `;
}

function openFolder(category) {
    document.getElementById('current-view-title').innerText = `Category / ${category}`;
    const filtered = allPosts.filter(p => (p.category || 'General').toLowerCase() === category.toLowerCase());
    renderPosts(filtered);
}

function showAllPosts() {
    document.getElementById('current-view-title').innerText = 'Home / All Posts';
    setActiveNav('nav-home');
    renderPosts(allPosts);
}

function setActiveNav(navId) {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.className = 'nav-item flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-accentText hover:bg-gray-100 dark:hover:bg-cardBg hover:text-gray-900 dark:hover:text-gray-200 border border-transparent';
    });
    
    const activeEl = document.getElementById(navId);
    if (activeEl) {
        activeEl.className = 'nav-item flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold';
    }
}

function showAbout() {
    setActiveNav('nav-about');
    document.getElementById('current-view-title').innerText = 'About / Profile';
    
    const container = document.getElementById('posts-container');
    container.innerHTML = `
        <div class="p-8 bg-white dark:bg-cardBg/60 backdrop-blur-sm border border-gray-200 dark:border-borderClr rounded-2xl shadow-sm space-y-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">About Me</h3>
            <p class="text-sm text-gray-600 dark:text-accentText leading-relaxed">
                Hello! I'm Rishabh Sharma, a developer and student passionate about web development, UI design, and open-source software.
            </p>
        </div>
    `;
}

function toggleTheme() {
    const html = document.documentElement;
    const avatar = document.getElementById('avatar-img');
    const icon = document.getElementById('theme-icon');

    requestAnimationFrame(() => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (avatar) avatar.src = pfpImages.light;
            if (icon) icon.className = 'fa-solid fa-moon text-xs';
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (avatar) avatar.src = pfpImages.dark;
            if (icon) icon.className = 'fa-solid fa-sun text-xs';
        }
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    const avatar = document.getElementById('avatar-img');
    const icon = document.getElementById('theme-icon');

    if (savedTheme === 'light') {
        html.classList.remove('dark');
        if (avatar) avatar.src = pfpImages.light;
        if (icon) icon.className = 'fa-solid fa-moon text-xs';
    } else {
        html.classList.add('dark');
        if (avatar) avatar.src = pfpImages.dark;
        if (icon) icon.className = 'fa-solid fa-sun text-xs';
    }
}

async function renderLogs() {
    const container = document.getElementById('logs-container');
    if (!container) return;

    // ONLY show these specific category folders in the activity log
    // Add your actual category folder names here (lowercase)
    const allowedCategories = ['projects/', 'blog/', 'gsoc/', 'notes/'];

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/commits?per_page=15`);
        if (!response.ok) throw new Error('Failed to fetch commits');
        
        const commits = await response.json();

        const commitDetails = await Promise.all(
            commits.map(async (item) => {
                const detailRes = await fetch(item.url);
                if (!detailRes.ok) return null;
                const detailData = await detailRes.json();
                
                const categoryFolders = (detailData.files || [])
                    .filter(f => f.filename.includes('/')) 
                    .map(f => f.filename.split('/')[0].toLowerCase() + '/')
                    // Only keep folders that are in our explicit allowed list
                    .filter(folder => allowedCategories.includes(folder));
                
                const uniqueFolders = [...new Set(categoryFolders)];
                if (uniqueFolders.length === 0) return null;

                return {
                    date: new Date(item.commit.author.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    message: item.commit.message,
                    folders: uniqueFolders
                };
            })
        );

        const categoryLogs = commitDetails.filter(log => log !== null);

        if (categoryLogs.length === 0) {
            container.innerHTML = `<div class="text-[11px] text-gray-400 dark:text-accentText py-2 italic pl-4">No active category updates found.</div>`;
            return;
        }

        container.innerHTML = categoryLogs.map(log => `
            <div class="relative pl-6">
                <span class="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white dark:border-darkBg shadow-sm"></span>
                <div class="text-xs">
                    <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span class="text-[10px] font-mono text-indigo-500 dark:text-indigo-400/80">${log.date}</span>
                        ${log.folders.map(folder => `
                            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 truncate max-w-[110px]" title="${folder}">
                                📁 ${folder}
                            </span>
                        `).join('')}
                    </div>
                    <p class="font-medium text-gray-800 dark:text-gray-300 line-clamp-2 leading-tight">${log.message}</p>
                </div>
            </div>
        `).join('');

    } catch (err) {
        container.innerHTML = `<div class="text-[11px] text-gray-400 dark:text-accentText py-2 italic pl-4">No active category updates found.</div>`;
    }
}
window.onload = () => {
    initTheme();
    fetchAndParsePosts();
};