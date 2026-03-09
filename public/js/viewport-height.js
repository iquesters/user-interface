(function () {
    const managerName = 'AutoViewportHeightManager';
    const commonWatchSelectors = [
        '#super-admin-navbar',
        'header.sticky-top',
        '.entity-sticky-top',
        '.breadcrumbs',
    ];

    if (window[managerName]) {
        window[managerName].observe();
        window[managerName].refresh();
        return;
    }

    const observedElements = new Set();
    let resizeObserver = null;

    const parseSelectorList = (value) => {
        return String(value || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const update = () => {
        document.querySelectorAll('[data-auto-viewport-height]').forEach((element) => {
            if (element.offsetParent === null) {
                return;
            }

            const breakpoint = Number(element.dataset.viewportHeightBreakpoint || 0);
            const mobileMode = element.dataset.viewportHeightMobile || 'auto';

            if (breakpoint && window.innerWidth < breakpoint && mobileMode === 'auto') {
                element.style.height = '';
                return;
            }

            const offset = Number(element.dataset.viewportHeightOffset || 0);
            const minHeight = Number(element.dataset.viewportHeightMin || 320);
            const rect = element.getBoundingClientRect();
            const availableHeight = Math.floor(window.innerHeight - rect.top - offset);

            element.style.height = `${Math.max(minHeight, availableHeight)}px`;
        });
    };

    const schedule = () => {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(update);
        });
    };

    const observe = () => {
        if (!('ResizeObserver' in window)) {
            return;
        }

        if (!resizeObserver) {
            resizeObserver = new ResizeObserver(() => schedule());
        }

        const selectors = new Set(commonWatchSelectors);
        document.querySelectorAll('[data-auto-viewport-height]').forEach((element) => {
            parseSelectorList(element.dataset.viewportHeightWatch).forEach((selector) => selectors.add(selector));
        });

        selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
                if (observedElements.has(element)) {
                    return;
                }

                resizeObserver.observe(element);
                observedElements.add(element);
            });
        });
    };

    window[managerName] = {
        refresh: schedule,
        observe,
    };

    const init = () => {
        schedule();
        observe();
        window.addEventListener('resize', schedule, { passive: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
