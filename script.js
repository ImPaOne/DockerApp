(() => {
    document.documentElement.classList.add('js-enabled');
    const cards = [...document.querySelectorAll('.story-card')];
    const filterButtons = [...document.querySelectorAll('.filter-chip')];
    const searchInput = document.querySelector('#story-search');
    const sortSelect = document.querySelector('#story-sort');
    const resultCount = document.querySelector('#results-count');
    const emptyState = document.querySelector('#empty-state');
    const savedCount = document.querySelector('#saved-count');
    const savedFilter = document.querySelector('.saved-filter');
    const toast = document.querySelector('#site-toast');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const themeToggle = document.querySelector('#theme-toggle');
    const originalOrder = new Map(cards.map((card, index) => [card, index]));
    const storyNames = new Map(cards.map((card) => [
        card,
        card.querySelector('h3').textContent.trim(),
    ]));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeFilter = 'All stories';
    let savedStories = [];
    let toastTimer;

    const readStorage = (key, fallback) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || 'null');
            return value ?? fallback;
        } catch {
            return fallback;
        }
    };

    const writeStorage = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    };

    const announce = (message) => {
        toast.textContent = message;
        toast.classList.add('visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
    };

    const setSaved = (card, isSaved) => {
        const button = card.querySelector('.save-button');
        const name = storyNames.get(card);
        button.setAttribute('aria-pressed', String(isSaved));
        button.setAttribute('aria-label', `${isSaved ? 'Remove saved' : 'Save'} ${name}`);
        button.querySelector('span').textContent = isSaved ? '♥' : '♡';
        button.classList.toggle('is-saved', isSaved);
    };

    savedStories = readStorage('wayfarer-saved-stories', []);
    if (!Array.isArray(savedStories)) savedStories = [];
    cards.forEach((card) => setSaved(card, savedStories.includes(storyNames.get(card))));
    savedCount.textContent = String(savedStories.length);

    function sortCards() {
        const mode = sortSelect.value;
        const sortedCards = [...cards].sort((first, second) => {
            if (mode === 'title') {
                return storyNames.get(first).localeCompare(storyNames.get(second));
            }
            if (mode === 'reading-time') {
                const firstTime = Number.parseInt(first.querySelector('.story-meta span:last-child').textContent, 10);
                const secondTime = Number.parseInt(second.querySelector('.story-meta span:last-child').textContent, 10);
                return firstTime - secondTime;
            }
            return originalOrder.get(first) - originalOrder.get(second);
        });
        sortedCards.forEach((card) => card.parentElement.append(card));
    }

    function updateStories() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
            const name = storyNames.get(card);
            const matchesCategory = activeFilter === 'All stories'
                || (activeFilter === 'Saved'
                    ? savedStories.includes(name)
                    : card.dataset.category === activeFilter);
            const matchesSearch = !query || card.dataset.search.includes(query);
            const visible = matchesCategory && matchesSearch;
            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        resultCount.textContent = `Showing ${visibleCount} thoughtful ${visibleCount === 1 ? 'escape' : 'escapes'}`;
        emptyState.querySelector('h3').textContent = activeFilter === 'Saved' && !savedStories.length
            ? 'Your saved places will be waiting here.'
            : 'No stories found just yet.';
        emptyState.querySelector('p').textContent = activeFilter === 'Saved' && !savedStories.length
            ? 'Tap the heart on any story to keep it close.'
            : 'Try another place, feeling, or category.';
        emptyState.hidden = visibleCount !== 0;
        savedCount.textContent = String(savedStories.length);
        savedFilter.setAttribute('aria-pressed', String(activeFilter === 'Saved'));
    }

    filterButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            filterButtons.forEach((item) => {
                const isActive = item === button;
                item.classList.toggle('active', isActive);
                item.setAttribute('aria-pressed', String(isActive));
            });
            updateStories();
        });
    });

    searchInput.addEventListener('input', updateStories);
    sortSelect.addEventListener('change', () => {
        sortCards();
        updateStories();
    });

    document.addEventListener('keydown', (event) => {
        const target = event.target;
        const isTyping = target instanceof HTMLElement
            && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

        if (event.key === '/' && !isTyping) {
            event.preventDefault();
            searchInput.focus();
        }
        if (event.key === 'Escape') {
            if (document.activeElement === searchInput) {
                if (searchInput.value) {
                    searchInput.value = '';
                    updateStories();
                }
                searchInput.blur();
            }
            closeMenu();
        }
    });

    function closeMenu() {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        mainNav.classList.remove('open');
    }

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
        mainNav.classList.toggle('open', !isOpen);
    });
    mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('click', (event) => {
        if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });

    cards.forEach((card) => {
        const name = storyNames.get(card);
        const button = card.querySelector('.save-button');
        button.addEventListener('click', () => {
            const isSaved = savedStories.includes(name);
            savedStories = isSaved
                ? savedStories.filter((story) => story !== name)
                : [...savedStories, name];
            const stored = writeStorage('wayfarer-saved-stories', savedStories);
            setSaved(card, !isSaved);
            updateStories();
            announce(stored
                ? (isSaved ? 'Removed from your saved places.' : 'Added to your saved places.')
                : 'Updated for this visit. Browser storage is unavailable.');
        });
    });

    const surpriseButtons = document.querySelectorAll('#surprise-button');
    surpriseButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const visibleCards = cards.filter((card) => !card.hidden);
            if (!visibleCards.length) {
                announce('No places match those filters. Try another search.');
                return;
            }
            const choice = visibleCards[Math.floor(Math.random() * visibleCards.length)];
            choice.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
            choice.classList.remove('is-picked');
            window.requestAnimationFrame(() => choice.classList.add('is-picked'));
            announce(`Your next little escape: ${storyNames.get(choice)}.`);
        });
    });

    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const storedTheme = readStorage('wayfarer-theme', preferredTheme);
    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('theme-dark', isDark);
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
        themeToggle.querySelector('span').textContent = isDark ? '☀' : '☾';
    };
    applyTheme(storedTheme === 'dark' ? 'dark' : 'light');
    themeToggle.addEventListener('click', () => {
        const nextTheme = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
        applyTheme(nextTheme);
        writeStorage('wayfarer-theme', nextTheme);
    });

    const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const formMessage = document.querySelector('.form-message');
    emailInput.addEventListener('input', () => {
        emailInput.removeAttribute('aria-invalid');
        formMessage.textContent = '';
        formMessage.classList.remove('success');
    });
    newsletterForm.addEventListener('submit', (event) => {
        if (!emailInput.value.trim() || !emailInput.validity.valid) {
            event.preventDefault();
            formMessage.textContent = 'Please enter a valid email address and try again.';
            formMessage.classList.remove('success');
            emailInput.setAttribute('aria-invalid', 'true');
            emailInput.focus();
        }
    });

    const progressBar = document.querySelector('#reading-progress span');
    const backToTop = document.querySelector('#back-to-top');
    let scrollScheduled = false;
    const updateScrollUI = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
        backToTop.hidden = window.scrollY < 520;
        scrollScheduled = false;
    };
    window.addEventListener('scroll', () => {
        if (!scrollScheduled) {
            window.requestAnimationFrame(updateScrollUI);
            scrollScheduled = true;
        }
    }, { passive: true });
    window.addEventListener('resize', updateScrollUI);
    updateScrollUI();
    backToTop.addEventListener('click', () => window.scrollTo({
        top: 0,
        behavior: reducedMotion ? 'auto' : 'smooth',
    }));

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
    } else {
        document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    }
})();
