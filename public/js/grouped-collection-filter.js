document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-ui-group-filter]').forEach(function (container) {
        const select = container.querySelector('[data-ui-group-filter-select]');
        const groups = container.querySelectorAll('[data-ui-group-filter-group]');

        if (!select || !groups.length) {
            return;
        }

        const applyFilter = function () {
            const selectedValue = select.value;

            groups.forEach(function (group) {
                const groupValue = group.getAttribute('data-ui-group-filter-group');
                group.style.display = selectedValue === 'all' || groupValue === selectedValue
                    ? ''
                    : 'none';
            });
        };

        select.addEventListener('change', applyFilter);
        applyFilter();
    });
});
