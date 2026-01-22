// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Initial theme setup
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
setTheme(savedTheme || systemTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Blog Logic
async function loadBlogGrid() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const postsUrl = 'data/posts.json';
    console.log(`[Blog] Attempting to fetch posts from: ${postsUrl}`);

    try {
        const response = await fetch(postsUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${postsUrl}`);
        }

        const posts = await response.json();
        console.log(`[Blog] Successfully loaded ${posts.length} posts.`);

        grid.innerHTML = posts.map(post => `
      <article class="card blog-card">
        ${post.image ? `<img src="${post.image}" alt="${post.title}" loading="lazy">` : ''}
        <h3 class="blog-title"><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
        <p class="blog-excerpt">${post.description}</p>
        <div class="blog-date">${new Date(post.date).toLocaleDateString()}</div>
      </article>
    `).join('');
    } catch (error) {
        console.error('[Blog] Error loading blog posts:', error);
        grid.innerHTML = `
            <div class="error-message">
                <p>Error loading blog posts. Please check back later.</p>
                <small style="display: block; margin-top: 10px; color: #666;">
                    Diagnostic Info: ${error.message}
                </small>
            </div>`;
    }
}

async function loadBlogPost() {
    const container = document.getElementById('post-content');
    const titleElem = document.getElementById('post-title');
    const dateElem = document.getElementById('post-date');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'blog.html';
        return;
    }

    try {
        // Load metadata
        const metaUrl = 'data/posts.json';
        console.log(`[Post] Attempting to fetch metadata from: ${metaUrl}`);
        const metaResponse = await fetch(metaUrl);

        if (!metaResponse.ok) {
            throw new Error(`HTTP error! status: ${metaResponse.status} while fetching metadata ${metaUrl}`);
        }

        const posts = await metaResponse.json();
        const postMeta = posts.find(p => p.slug === slug);

        if (postMeta) {
            titleElem.textContent = postMeta.title;
            dateElem.textContent = new Date(postMeta.date).toLocaleDateString();
            document.title = `${postMeta.title} | Sukrit Pant`;
        } else {
            console.warn(`[Post] No metadata found for slug: ${slug}`);
        }

        // Load content
        const contentUrl = `posts/${slug}.md`;
        console.log(`[Post] Attempting to fetch content from: ${contentUrl}`);
        const contentResponse = await fetch(contentUrl);

        if (!contentResponse.ok) {
            throw new Error(`HTTP error! status: ${contentResponse.status} while fetching content ${contentUrl}`);
        }

        const markdown = await contentResponse.text();
        container.innerHTML = parseMarkdown(markdown);
        console.log(`[Post] Successfully loaded post content for: ${slug}`);
    } catch (error) {
        console.error('[Post] Error loading post content:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Error loading blog post. Please check back later.</p>
                <small style="display: block; margin-top: 10px; color: #666;">
                    Diagnostic Info: ${error.message}
                </small>
            </div>`;
    }
}

function parseMarkdown(text) {
    return text
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\n<ul>/gim, '') // merge lists
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n\n/g, '<p></p>') // basic paragraph split
        .split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    loadBlogGrid();
    loadBlogPost();
});
