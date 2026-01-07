function openSection(headerId, collapseId) {
    const header = document.getElementById(headerId);
    const collapse = document.getElementById(collapseId);
    
    // Get the collapse instance
    const collapseInstance = bootstrap.Collapse.getOrCreateInstance(collapse, {
        toggle: false // Don't auto-toggle
    });
    
    // Check if it's currently hidden
    if (!collapse.classList.contains('show')) {
        // If closed, open it
        collapseInstance.show();
    }
    
    // Scroll to the section after a brief delay to allow animation
    setTimeout(() => {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
}

function toggleSystemFields(checkbox) {
    document.querySelectorAll('.system-field').forEach(row => {
        row.style.display = checkbox.checked ? '' : 'none';
    });
}

function removeRow(btn) {
    const row = btn.closest('tr');
    row.remove();
    updateRowNumbers();
}

function updateRowNumbers() {
    document.querySelectorAll('#fieldsMainTableBody tr:not(.no-data-row)').forEach((row, index) => {
        row.querySelector('td:first-child').textContent = index + 1;
    });
    
    document.querySelectorAll('#metaFieldsTableBody tr:not(.no-data-row)').forEach((row, index) => {
        row.querySelector('td:first-child').textContent = index + 1;
    });
}

function addPrimaryField() {
    const tbody = document.getElementById('fieldsMainTableBody');
    const noDataRow = tbody.querySelector('.no-data-row');
    if (noDataRow) noDataRow.remove();
    
    const fieldIndex = tbody.querySelectorAll('tr').length;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${fieldIndex + 1}</td>
        <td><input type="text" class="form-control form-control-sm" name="fields[${fieldIndex}][name]" required></td>
        <td>
            <select class="form-select form-select-sm" name="fields[${fieldIndex}][type]" required>
                <option value="string">String</option>
                <option value="text">Text</option>
                <option value="integer">Integer</option>
                <option value="decimal">Decimal</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
                <option value="datetime">DateTime</option>
            </select>
        </td>
        <td><input type="text" class="form-control form-control-sm" name="fields[${fieldIndex}][label]" required></td>
        <td>
            <select class="form-select form-select-sm" name="fields[${fieldIndex}][required]">
                <option value="0" selected>NO</option>
                <option value="1">YES</option>
            </select>
        </td>
        <td>
            <select class="form-select form-select-sm" name="fields[${fieldIndex}][nullable]">
                <option value="1" selected>YES</option>
                <option value="0">NO</option>
            </select>
        </td>
        <td>
            <select class="form-select form-select-sm" name="fields[${fieldIndex}][input_type]" required>
                <option value="text" selected>Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
                <option value="date">Date</option>
                <option value="checkbox">Checkbox</option>
                <option value="select">Select</option>
            </select>
        </td>
        <td><input type="text" class="form-control form-control-sm" name="fields[${fieldIndex}][default]"></td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
}

function addMetaField() {
    const tbody = document.getElementById('metaFieldsTableBody');
    const noDataRow = tbody.querySelector('.no-data-row');
    if (noDataRow) noDataRow.remove();
    
    const metaFieldIndex = tbody.querySelectorAll('tr').length;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${metaFieldIndex + 1}</td>
        <td><input type="text" class="form-control form-control-sm" name="meta_fields[${metaFieldIndex}][meta_key]" required></td>
        <td>
            <select class="form-select form-select-sm" name="meta_fields[${metaFieldIndex}][type]" required>
                <option value="string" selected>String</option>
                <option value="text">Text</option>
                <option value="integer">Integer</option>
                <option value="decimal">Decimal</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
            </select>
        </td>
        <td><input type="text" class="form-control form-control-sm" name="meta_fields[${metaFieldIndex}][label]" required></td>
        <td>
            <select class="form-select form-select-sm" name="meta_fields[${metaFieldIndex}][required]">
                <option value="0" selected>NO</option>
                <option value="1">YES</option>
            </select>
        </td>
        <td>
            <select class="form-select form-select-sm" name="meta_fields[${metaFieldIndex}][nullable]">
                <option value="1" selected>YES</option>
                <option value="0">NO</option>
            </select>
        </td>
        <td>
            <select class="form-select form-select-sm" name="meta_fields[${metaFieldIndex}][input_type]" required>
                <option value="text" selected>Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
            </select>
        </td>
        <td>
            <select class="form-select form-select-sm" name="meta_fields[${metaFieldIndex}][display]">
                <option value="1" selected>YES</option>
                <option value="0">NO</option>
            </select>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
}