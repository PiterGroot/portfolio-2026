document.addEventListener('DOMContentLoaded', function () {
    let isScrolling = false;
    let scrollTarget = window.scrollY;
    let rafId = null;
    let autoScroll = false;

    function clampTarget(value) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return Math.max(0, Math.min(value, maxScroll));
    }

    document.addEventListener('wheel', function (e) {
        if (autoScroll) return;
        e.preventDefault();

        scrollTarget = clampTarget(scrollTarget + e.deltaY * 0.5);

        if (!isScrolling) {
            smoothScroll();
        }
    }, { passive: false });

    document.addEventListener('mousedown', function (e) {
        if (e.button === 1) {
            autoScroll = true;
            cancelSmoothScroll();
            return;
        }

        const scrollbarStart = document.documentElement.clientWidth;
        if (e.button === 0 && e.clientX >= scrollbarStart) {
            cancelSmoothScroll();
        }
    });

    document.addEventListener('mouseup', function (e) {
        if (e.button === 1) {
            autoScroll = false;
        }
    });

    window.addEventListener('scroll', function () {
        if (!isScrolling) {
            scrollTarget = window.scrollY;
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            if (!targetId) return;
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;
            e.preventDefault();
            const rect = targetEl.getBoundingClientRect();
            scrollTarget = clampTarget(window.scrollY + rect.top);
            if (!isScrolling) {
                smoothScroll();
            }
        });
    });

    function smoothScroll() {
        isScrolling = true;
        const current = window.scrollY;
        const distance = scrollTarget - current;

        const ease = distance * 0.1;

        if (Math.abs(distance) > 0.5) {
            window.scrollTo(0, current + ease);
            rafId = requestAnimationFrame(smoothScroll);
        } else {
            window.scrollTo(0, scrollTarget);
            isScrolling = false;
            rafId = null;
        }
    }

    function cancelSmoothScroll() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        isScrolling = false;
        scrollTarget = window.scrollY;
    }
});