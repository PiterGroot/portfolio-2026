(() => {
    const content = document.querySelector('.blog-post-content');
    if (!content) return;

    const headings = [...content.querySelectorAll('h2[id]')];
    if (headings.length < 2) return;

    const nav = document.createElement('nav');
    nav.className = 'toc-sidebar';
    nav.setAttribute('aria-label', 'Sections');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toc-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const currentLabel = document.createElement('span');
    currentLabel.className = 'toc-current';
    toggle.append(currentLabel);

    const list = document.createElement('ol');
    list.className = 'toc-list';

    const links = headings.map(heading => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent.trim();
        item.append(link);
        list.append(item);
        return link;
    });

    nav.append(toggle, list);
    document.body.append(nav);

    let activeIndex = -1;

    function setActive(index) {
        if (index === activeIndex) return;

        if (activeIndex >= 0) {
            links[activeIndex].classList.remove('is-active');
            links[activeIndex].removeAttribute('aria-current');
        }

        activeIndex = index;
        const link = links[index];
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'location');
        currentLabel.textContent = link.textContent;

        const top = link.offsetTop;
        const bottom = top + link.offsetHeight;
        if (top < list.scrollTop) list.scrollTop = top - 8;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 8;
    }

    function update() {
        const triggerLine = window.innerHeight * 0.3;

        let index = 0;
        for (let i = 0; i < headings.length; i++) {
            if (headings[i].getBoundingClientRect().top <= triggerLine) index = i;
            else break;
        }

        if (content.getBoundingClientRect().bottom <= window.innerHeight + 2)
            index = headings.length - 1;

        setActive(index);
    }

    let queued = false;
    function requestUpdate() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            update();
        });
    }

    document.addEventListener('scroll', requestUpdate, { passive: true, capture: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
    update();

    function setOpen(open) {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    list.addEventListener('click', event => {
        if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', event => {
        if (!nav.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setOpen(false);
    });
})();
