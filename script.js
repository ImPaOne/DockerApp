(() => {
    const cards = [...document.querySelectorAll('.story-card')];
    const filterButtons = [...document.querySelectorAll('.filter-chip')];
    const searchInput = document.querySelector('#story-search');
    const resultCount = document.querySelector('#results-count');
    const emptyState = document.querySelector('#empty-state');
    let activeFilter = 'All stories';

    function updateStories() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
            const matchesCategory = activeFilter === 'All stories' || card.dataset.category === activeFilter;
            const matchesSearch = !query || card.dataset.search.includes(query);
            const visible = matchesCategory && matchesSearch;
            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        resultCount.textContent = `Showing ${visibleCount} thoughtful ${visibleCount === 1 ? 'escape' : 'escapes'}`;
        emptyState.hidden = visibleCount !== 0;
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            filterButtons.forEach((item) => item.classList.toggle('active', item === button));
            updateStories();
        });
    });

    searchInput.addEventListener('input', updateStories);
    document.addEventListener('keydown', (event) => {
        if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            event.preventDefault();
            searchInput.focus();
        }
        if (event.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.blur();
            updateStories();
        }
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
        mainNav.classList.toggle('open', !isOpen);
    });
    mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        mainNav.classList.remove('open');
    }));

    let savedStories = [];
    try {
        savedStories = JSON.parse(localStorage.getItem('wayfarer-saved-stories') || '[]');
        if (!Array.isArray(savedStories)) savedStories = [];
    } catch {
        savedStories = [];
    }

    document.querySelectorAll('.save-button').forEach((button) => {
        const title = button.closest('.story-card').querySelector('h3').textContent.trim();
        const icon = button.querySelector('span');
        const setSaved = (saved) => {
            button.setAttribute('aria-pressed', String(saved));
            button.setAttribute('aria-label', `${saved ? 'Remove saved' : 'Save'} ${title}`);
            icon.textContent = saved ? '♥' : '♡';
        };
        setSaved(savedStories.includes(title));
        button.addEventListener('click', () => {
            savedStories = savedStories.includes(title)
                ? savedStories.filter((story) => story !== title)
                : [...savedStories, title];
            try {
                localStorage.setItem('wayfarer-saved-stories', JSON.stringify(savedStories));
            } catch {
                // Saving still works for this page view if browser storage is unavailable.
            }
            setSaved(savedStories.includes(title));
        });
    });

    const newsletterForm = document.querySelector('.newsletter-form');
    newsletterForm.addEventListener('submit', (event) => {
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const message = document.querySelector('.form-message');
        if (!emailInput.value.trim() || !emailInput.validity.valid) {
            event.preventDefault();
            message.textContent = 'Please enter a valid email address and try again.';
            message.classList.remove('success');
            emailInput.focus();
        }
    });
})();
