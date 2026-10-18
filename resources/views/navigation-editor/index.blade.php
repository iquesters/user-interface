@extends('userinterface::layouts.app')

@php
    $activeNode = $selectedNode ?? null;
    $payload = $selectedPayload ?? [];
    $path = $selectedPath ?? [];
    $isEditing = !empty($editingUid) && !empty($activeNode);
    $openModuleLabel = null;
    $openSidebarLabel = null;

    if ($isEditing && !empty($selectedMode)) {
        if ($selectedMode === 'sidebar' || $selectedMode === 'tab') {
            $openModuleLabel = $path[0] ?? null;
        }

        if ($selectedMode === 'tab') {
            $openSidebarLabel = $path[1] ?? null;
        }
    }
@endphp

@section('content')
<div class="navigation-editor-page" data-selected-module-uid="{{ $selectedModuleUid ?? '' }}">
    <div id="navigation-editor-feedback" class="mb-3"></div>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
            <h3 class="mb-1">Navigation Editor</h3>
            <p class="text-muted mb-0">Browse every navigation record, then click Edit to open the JSON editor for the selected node.</p>
        </div>
        <div class="text-end">
            <div class="small text-muted">Current selection</div>
            <div class="fw-semibold" id="navigation-current-selection">{{ implode(' / ', $path) ?: 'None selected' }}</div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-xl-4">
            <div class="card shadow-sm h-100 navigation-editor__selector-pane">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div>
                            <h5 class="mb-1">Navigation Tree</h5>
                            <p class="text-muted small mb-0">Choose a module first. Children will load only after selection.</p>
                        </div>
                    </div>

                    <label for="navigation-module-select" class="form-label">Module</label>
                    <select id="navigation-module-select" class="form-select mb-3">
                        <option value="">Select a module</option>
                        @foreach($navigationTree as $moduleNode)
                            <option
                                value="{{ $moduleNode['module_id'] ?? $moduleNode['module_uid'] ?? '' }}"
                                data-module-uid="{{ $moduleNode['module_uid'] ?? '' }}"
                                {{ ($selectedModuleUid ?? '') === ($moduleNode['module_uid'] ?? '') ? 'selected' : '' }}
                            >
                                {{ $moduleNode['label'] }}
                            </option>
                        @endforeach
                    </select>

                    <div class="small text-muted mb-1">Selected path</div>
                    <div class="fw-semibold mb-3" id="navigation-selection-path">{{ implode(' / ', $path) ?: 'None selected' }}</div>

                    <div class="small text-muted mb-2">Selected module</div>
                    <div id="navigation-tree-container" class="navigation-tree d-none">
                        <div class="navigation-tree__group mb-3" data-tree-group data-node-kind="module" data-module-uid="" data-nav-uid="" data-loaded-children="false">
                            <div class="navigation-tree__module">
                                <div class="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                        <div class="fw-semibold" data-nav-label></div>
                                        <div class="text-muted small" data-nav-title></div>
                                    </div>
                                </div>
                                <div class="mt-2 d-flex gap-2 flex-wrap align-items-center navigation-tree__actions">
                                    <a class="btn btn-sm btn-outline-dark navigation-tree__edit-btn" href="#" title="Edit" aria-label="Edit">
                                        <i class="fas fa-fw fa-edit"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="navigation-child-selectors" class="d-none"></div>
                </div>
            </div>
        </div>

        <div class="col-12 col-xl-8">
            <div class="card shadow-sm mb-4 navigation-editor__pane">
                <div class="card-body">
                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                        <div>
                            <h5 class="mb-1">Editor</h5>
                            @if($isEditing)
                                <p class="text-muted small mb-0">This editor writes back to the selected navigation record in `navigations` and `navigation_metas`.</p>
                            @endif
                        </div>
                        @if($isEditing)
                            <div class="text-end">
                                <div class="small text-muted">Mode</div>
                                <div class="fw-semibold text-uppercase">{{ $selectedMode ?? 'module' }}</div>
                            </div>
                        @endif
                    </div>

                    @if($isEditing && $activeNode)
                        <div class="row g-3 mb-3">
                            <div class="col-12 col-lg-4">
                                <label class="form-label">Navigation name</label>
                                <input type="text" class="form-control" value="{{ $activeNode['navigation_name'] }}" readonly>
                            </div>
                            <div class="col-12 col-lg-4">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" value="{{ $activeNode['title'] }}" readonly>
                            </div>
                            <div class="col-12 col-lg-4">
                                <label class="form-label">Selection path</label>
                                <input type="text" class="form-control" value="{{ implode(' / ', $path) }}" readonly>
                            </div>
                        </div>

                        <form method="POST" action="{{ route('navigation-editor.update', $activeNode['navigation_uid']) }}" id="navigationEditorForm">
                            @csrf
                            @method('PUT')
                            <input type="hidden" name="navigation_uid" value="{{ $activeNode['navigation_uid'] }}">
                            <input type="hidden" name="navigation_type" value="{{ $selectedMode ?? 'module' }}">

                            <div class="mb-3">
                                <label class="form-label">Navigation JSON</label>
                                <div id="navigation-json-editor" class="navigation-json-editor border rounded" data-input="navigation_payload" data-json-schema='@json($payload)'></div>
                                <textarea name="navigation_payload" id="navigation_payload" class="d-none" required></textarea>
                            </div>

                            <div class="d-flex justify-content-end gap-2">
                                <button type="submit" class="btn btn-primary">Save Navigation</button>
                            </div>
                        </form>
                        <div class="mt-4">
                            <h5 class="mb-3">Live JSON Preview</h5>
                            <pre id="navigation-json-preview" class="bg-light rounded p-3 mb-0 navigation-json-preview"></pre>
                        </div>
                    @else
                        <div class="editor-placeholder border rounded d-flex align-items-center justify-content-center text-muted">
                            Select a navigation item, then click Edit to open the JSON editor.
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
.navigation-tree__module,
.navigation-tree__child,
.navigation-tree__grandchild {
    padding: 0.9rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 0.75rem;
    background: #fff;
}

.navigation-tree__children,
.navigation-tree__grandchildren {
    border-left: 2px solid rgba(13, 110, 253, 0.12);
}

.navigation-json-editor {
    min-height: 420px;
}

.navigation-tree__toggle-spacer {
    width: 1rem;
    display: inline-block;
}

.navigation-tree__actions {
    min-height: 0;
}

.navigation-tree__toggle {
    color: #0d6efd;
    line-height: 1;
    box-shadow: none;
    padding: 0.1rem 0.15rem;
}

.navigation-tree__edit-btn {
    line-height: 1;
    padding: 0.25rem 0.4rem;
}

.editor-placeholder {
    min-height: 520px;
    background: #fff;
}

.navigation-json-preview {
    min-height: 260px;
    white-space: pre-wrap;
}

.navigation-editor__pane .card-body,
.navigation-editor__selector-pane .card-body {
    min-height: 640px;
}

.is-selected > .navigation-tree__module,
.is-selected > .navigation-tree__child,
.is-selected > .navigation-tree__grandchild {
    border-color: rgba(13, 110, 253, 0.5);
    box-shadow: 0 0 0 1px rgba(13, 110, 253, 0.08);
}

.navigation-tree__toggle {
    color: #0d6efd;
    line-height: 1;
    box-shadow: none;
}

.navigation-tree__toggle i {
    transition: transform 0.18s ease;
}

.navigation-tree__group.is-expanded > .navigation-tree__module .navigation-tree__toggle i,
.navigation-tree__child.is-expanded .navigation-tree__toggle i {
    transform: rotate(180deg);
}
</style>
@endpush

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const editorElement = document.getElementById('navigation-json-editor');
    const hiddenInput = document.getElementById('navigation_payload');
    const preview = document.getElementById('navigation-json-preview');
    const treeGroups = document.querySelectorAll('[data-tree-group]');
    const form = document.getElementById('navigationEditorForm');
    const feedback = document.getElementById('navigation-editor-feedback');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const appSidebar = document.getElementById('appSidebar');
    const navigationEditorPage = document.querySelector('.navigation-editor-page');
    const moduleSelect = document.getElementById('navigation-module-select');
    const treeContainer = document.getElementById('navigation-tree-container');
    const childSelectors = document.getElementById('navigation-child-selectors');
    const selectionPath = document.getElementById('navigation-selection-path');
    const childEndpoint = `{{ url('/navigation-editor/children') }}`;
    const flashKey = 'navigation_editor_flash_message';
    const flashTypeKey = 'navigation_editor_flash_type';

    const readFlashMessage = function () {
        const message = window.sessionStorage.getItem(flashKey);
        const type = window.sessionStorage.getItem(flashTypeKey) || 'success';

        if (message) {
            window.sessionStorage.removeItem(flashKey);
            window.sessionStorage.removeItem(flashTypeKey);
            renderFeedback(message, type);
        }
    };

    if (!editorElement || !hiddenInput) {
        // Tree toggles still work in browse mode.
    }

    const escapeHtml = function (value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    };

    const getEditUrl = function (selectionUid, editUid, mode) {
        return `{{ route('navigation-editor.index') }}` + `?selected_uid=${encodeURIComponent(selectionUid || '')}&edit_uid=${encodeURIComponent(editUid || '')}&edit_mode=${encodeURIComponent(mode)}&mode=${encodeURIComponent(mode)}`;
    };

    const renderNodeCard = function (item, nodeKind) {
        const hasChildren = Boolean(item?.has_children);
        const selectionUid = item?.selection_uid || item?.node_id || item?.navigation_uid || '';
        const editUid = item?.edit_uid || item?.navigation_uid || '';
        return `
            <div class="navigation-tree__group mb-3" data-tree-group data-node-kind="${nodeKind}" data-module-uid="${escapeHtml(item?.module_uid || '')}" data-nav-uid="${escapeHtml(item?.navigation_uid || '')}" data-loaded-children="false">
                <div class="navigation-tree__module">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                        <div>
                            <div class="fw-semibold" data-nav-label>${escapeHtml(item?.label || item?.title || 'Navigation')}</div>
                            <div class="text-muted small" data-nav-title>${escapeHtml(item?.title || '')}</div>
                        </div>
                    </div>
                    <div class="mt-2 d-flex gap-2 flex-wrap align-items-center navigation-tree__actions">
                        <a class="btn btn-sm btn-outline-dark navigation-tree__edit-btn" href="${getEditUrl(selectionUid, editUid, nodeKind)}" title="Edit" aria-label="Edit">
                            <i class="fas fa-fw fa-edit"></i>
                        </a>
                        ${hasChildren ? `<button type="button" class="btn btn-sm btn-link p-0 text-decoration-none navigation-tree__toggle" data-tree-toggle aria-expanded="false" title="Load children" aria-label="Load children"><i class="fa-solid fa-chevron-down me-1"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const renderChildSelector = function (parentItem, children, levelLabel) {
        if (!childSelectors || !parentItem) {
            return;
        }

        const childList = Array.isArray(children) ? children : [];
        const selectId = `nav-child-select-${parentItem.navigation_uid || 'root'}`;
        const options = childList.map((item) => `<option value="${escapeHtml(item.navigation_uid || '')}">${escapeHtml(item.label || item.title || 'Navigation')}</option>`).join('');

        childSelectors.classList.remove('d-none');
        childSelectors.innerHTML = `
            <div class="navigation-tree__child-chooser mb-3" data-child-chooser data-parent-uid="${escapeHtml(parentItem.navigation_uid || '')}" data-parent-kind="${escapeHtml(parentItem.mode || 'module')}">
                <label class="form-label">${escapeHtml(levelLabel || 'Child')}</label>
                <select id="${selectId}" class="form-select" data-child-select>
                    <option value="">Select ${escapeHtml(levelLabel || 'child')}</option>
                    ${options}
                </select>
            </div>
            <div class="navigation-tree__child-output" data-child-output></div>
        `;
    };

    const renderSelectedModule = function (moduleItem, children) {
        if (!treeContainer || !moduleItem) {
            return;
        }

        treeContainer.classList.remove('d-none');
        const moduleGroup = treeContainer.querySelector('[data-tree-group]');
        const labelNode = treeContainer.querySelector('[data-nav-label]');
        const titleNode = treeContainer.querySelector('[data-nav-title]');
        const editButton = treeContainer.querySelector('.navigation-tree__edit-btn');
        const toggleButton = treeContainer.querySelector('[data-tree-toggle]');

        treeContainer.dataset.moduleUid = moduleItem.navigation_uid || '';
        treeContainer.dataset.navUid = moduleItem.navigation_uid || '';
        treeContainer.dataset.loadedChildren = 'true';

        if (moduleGroup) {
            moduleGroup.dataset.moduleUid = moduleItem.module_uid || '';
            moduleGroup.dataset.navUid = moduleItem.navigation_uid || '';
            moduleGroup.dataset.loadedChildren = 'true';
            moduleGroup.classList.add('is-expanded');
        }

        if (labelNode) {
            labelNode.textContent = moduleItem.label || 'Navigation';
        }

        if (titleNode) {
            titleNode.textContent = moduleItem.title || '';
        }

        if (editButton) {
            editButton.href = getEditUrl(
                moduleItem.selection_uid || moduleItem.module_uid || moduleItem.node_id || moduleItem.navigation_uid || '',
                moduleItem.edit_uid || moduleItem.navigation_uid || moduleItem.selection_uid || moduleItem.module_uid || moduleItem.node_id || '',
                'module'
            );
        }

        if (toggleButton) {
            toggleButton.style.display = moduleItem.has_children ? '' : 'none';
            toggleButton.setAttribute('aria-expanded', 'true');
        }

        renderChildSelector(moduleItem, children, 'Sidebar');
    };

    const loadChildren = async function (group) {
        const parentUid = group.dataset.moduleUid || group.dataset.navUid;
        const childrenContainer = group.querySelector('[data-tree-children]');

        if (!parentUid || !childrenContainer) {
            return;
        }

        if (group.dataset.loadedChildren === 'true') {
            childrenContainer.classList.remove('d-none');
            group.classList.add('is-expanded');
            const toggle = group.querySelector('[data-tree-toggle]');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'true');
            }
            return;
        }

        group.dataset.loadingChildren = 'true';

        try {
            const response = await fetch(`${childEndpoint}/${encodeURIComponent(parentUid)}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
                cache: 'no-store',
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Failed to load children.');
            }

            const children = result?.data?.children || [];
            const parentType = result?.data?.parent_type || group.dataset.nodeKind || 'module';

            if (group.dataset.nodeKind === 'module' || parentType === 'module') {
                const moduleItem = {
                    navigation_uid: group.dataset.navUid || parentUid,
                    module_uid: group.dataset.moduleUid || parentUid,
                    label: group.querySelector('[data-nav-label]')?.textContent?.trim() || 'Navigation',
                    title: group.querySelector('[data-nav-title]')?.textContent?.trim() || '',
                    has_children: children.length > 0,
                    mode: 'module',
                };
                renderSelectedModule(moduleItem, children);
            } else {
                const parentItem = {
                    navigation_uid: group.dataset.navUid || parentUid,
                    module_uid: group.dataset.moduleUid || '',
                    label: group.querySelector('[data-nav-label]')?.textContent?.trim() || 'Navigation',
                    title: group.querySelector('[data-nav-title]')?.textContent?.trim() || '',
                    mode: group.dataset.nodeKind || 'sidebar',
                    has_children: children.length > 0,
                };
                renderChildSelector(parentItem, children, parentItem.mode === 'sidebar' ? 'Tab' : 'Child');
            }
        } catch (error) {
            console.error(error);
            renderFeedback(error.message || 'Failed to load children.', 'error');
        } finally {
            group.dataset.loadingChildren = 'false';
        }
    };

    document.addEventListener('click', async function (event) {
        const toggle = event.target.closest('[data-tree-toggle]');

        if (!toggle) {
            return;
        }

        const group = toggle.closest('[data-tree-group]');
        if (!group) {
            return;
        }

        const isExpanded = group.classList.contains('is-expanded');
        const childrenContainer = group.querySelector('[data-tree-children]');

        if (isExpanded && childrenContainer) {
            group.classList.remove('is-expanded');
            childrenContainer.classList.add('d-none');
            toggle.setAttribute('aria-expanded', 'false');
            return;
        }

        await loadChildren(group);
    });

    document.addEventListener('change', async function (event) {
        const select = event.target.closest('[data-child-select]');
        if (!select || !childSelectors) {
            return;
        }

        const chooser = select.closest('[data-child-chooser]');
        if (!chooser) {
            return;
        }

        const selectedUid = select.value;
        const output = childSelectors.querySelector('[data-child-output]');

        if (!selectedUid) {
            if (output) {
                output.innerHTML = '';
            }
            return;
        }

        try {
            const response = await fetch(`${childEndpoint}/${encodeURIComponent(selectedUid)}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
                cache: 'no-store',
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Failed to load child node.');
            }

            const children = result?.data?.children || [];
            const selectedOption = select.selectedOptions?.[0];
            const selectedLabel = selectedOption?.textContent?.trim() || 'Navigation';
            const nodeKind = result?.data?.parent_type === 'sidebar' ? 'sidebar' : 'tab';
            const parentNodeId = result?.data?.parent_node_id || selectedUid;
            const parentNavigationUid = result?.data?.parent_navigation_uid || selectedUid;

            if (output) {
                output.innerHTML = renderNodeCard({
                    node_id: parentNodeId,
                    selection_uid: parentNodeId,
                    edit_uid: parentNavigationUid,
                    navigation_uid: selectedUid,
                    module_uid: chooser.dataset.parentKind === 'module' ? chooser.dataset.parentUid : '',
                    label: selectedLabel,
                    title: selectedLabel,
                    has_children: children.length > 0,
                    mode: nodeKind,
                }, nodeKind);
            }

            const card = output?.querySelector('[data-tree-group]');
            if (card && children.length > 0) {
                const loadButton = card.querySelector('[data-tree-toggle]');
                loadButton?.addEventListener('click', async function () {
                    await loadChildren(card);
                });
            }

            if (children.length > 0) {
                renderChildSelector({
                    node_id: parentNodeId,
                    selection_uid: parentNodeId,
                    edit_uid: parentNavigationUid,
                    navigation_uid: selectedUid,
                    module_uid: chooser.dataset.parentKind === 'module' ? chooser.dataset.parentUid : '',
                    label: selectedLabel,
                    title: selectedLabel,
                    mode: nodeKind,
                    has_children: true,
                }, children, nodeKind === 'sidebar' ? 'Tab' : 'Child');
            } else if (childSelectors) {
                const nextOutput = childSelectors.querySelector('[data-child-output]');
                if (nextOutput) {
                    nextOutput.innerHTML = '';
                }
            }
        } catch (error) {
            console.error(error);
            renderFeedback(error.message || 'Failed to load child node.', 'error');
        }
    });

    moduleSelect?.addEventListener('change', async function () {
        const selectedOption = moduleSelect.selectedOptions?.[0];
        const moduleId = moduleSelect.value;
        const moduleUid = selectedOption?.dataset?.moduleUid || moduleId;

        if (!moduleId && !moduleUid) {
            if (treeContainer) {
                treeContainer.classList.add('d-none');
            }
            return;
        }

        const moduleLabel = selectedOption?.textContent?.trim() || 'Navigation';

        try {
            const response = await fetch(`${childEndpoint}/${encodeURIComponent(moduleId || moduleUid)}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
                cache: 'no-store',
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Failed to load module.');
            }

            const children = result?.data?.children || [];
            const parentNavigationUid = result?.data?.parent_navigation_uid || moduleUid || moduleId;
            const parentNodeId = result?.data?.parent_node_id || parentNavigationUid;
            const moduleItem = {
                node_id: parentNodeId,
                selection_uid: moduleUid || moduleId,
                edit_uid: parentNavigationUid,
                navigation_uid: parentNavigationUid,
                module_id: moduleId,
                module_uid: moduleUid || moduleId,
                label: moduleLabel,
                title: moduleLabel,
                has_children: children.length > 0,
                mode: 'module',
            };
            renderSelectedModule(moduleItem, children);
            if (selectionPath) {
                selectionPath.textContent = moduleLabel;
            }
            if (navigationEditorPage) {
                navigationEditorPage.dataset.selectedModuleUid = moduleUid || moduleId;
            }
        } catch (error) {
            console.error(error);
            renderFeedback(error.message || 'Failed to load module.', 'error');
        }
    });

    const hasExplicitSelectionQuery = new URLSearchParams(window.location.search).has('selected_uid')
        || new URLSearchParams(window.location.search).has('edit_uid')
        || new URLSearchParams(window.location.search).has('node_id')
        || new URLSearchParams(window.location.search).has('navigation_uid');
    if (hasExplicitSelectionQuery && moduleSelect?.value) {
        moduleSelect.dispatchEvent(new Event('change'));
    }

    if (!editorElement || !hiddenInput) {
        return;
    }

    const updatePayload = function (jsonString) {
        hiddenInput.value = jsonString;
        if (preview) {
            preview.textContent = jsonString || '{}';
        }
    };

    const applySavedState = function (result, navigationUid, navigationType) {
        const savedItems = result?.data?.navigation_items;
        const firstItem = Array.isArray(savedItems) ? savedItems[0] : null;
        const savedLabel = firstItem?.label || firstItem?.title || null;
        const sourceModuleUid = firstItem?.module_uid || firstItem?.target_module_uid || null;

        if (firstItem) {
            updatePayload(JSON.stringify(savedItems, null, 2));
        }

        if (savedLabel) {
            document.querySelectorAll(`[data-nav-uid="${CSS.escape(navigationUid)}"]`).forEach((group) => {
                const labelNode = group.querySelector('[data-nav-label]');
                const titleNode = group.querySelector('[data-nav-title]');

                if (labelNode) {
                    labelNode.textContent = savedLabel;
                }

                if (titleNode && navigationType === 'module') {
                    titleNode.textContent = savedLabel;
                }
            });
        }

        return sourceModuleUid;
    };

    const patchMenuByNavigationUid = function (items, navigationUid, savedItems) {
        if (!Array.isArray(items) || !navigationUid) {
            return items;
        }

        return items.map((item) => {
            if (!item || typeof item !== 'object') {
                return item;
            }

            if (String(item.navigation_uid || '') === String(navigationUid)) {
                const firstSaved = Array.isArray(savedItems) ? savedItems[0] : null;

                return {
                    ...item,
                    ...firstSaved,
                    navigation_uid: item.navigation_uid || navigationUid,
                    label: firstSaved?.label || item.label || item.title || 'Navigation',
                    url: firstSaved?.url || item.url || '#',
                };
            }

            if (Array.isArray(item.children) && item.children.length > 0) {
                return {
                    ...item,
                    children: patchMenuByNavigationUid(item.children, navigationUid, savedItems),
                };
            }

            return item;
        });
    };

    const serializeMenuItems = function (items) {
        return Array.isArray(items)
            ? items.map((item) => ({
                icon: item?.icon || 'fas fa-circle',
                label: item?.label || item?.title || 'Navigation',
                url: item?.url || '#',
            }))
            : [];
    };

    const renderSidebarMenu = function (items) {
        if (!sidebarMenu) {
            return;
        }

        sidebarMenu.innerHTML = '';

        if (!Array.isArray(items) || items.length === 0) {
            sidebarMenu.innerHTML = '<div class="text-muted ps-3 pe-2 py-1">No menu available.</div>';
            return;
        }

        items.forEach((item) => {
            const link = document.createElement('a');
            link.className = 'list-group-item list-group-item-action dropdown-item ps-3 pe-2 py-2 d-flex justify-content-between align-items-center';
            link.href = item.url || '#';
            link.innerHTML = `
                <span class="d-flex align-items-center gap-2 text-truncate">
                    <i class="${item.icon || 'fas fa-circle'}"></i>
                    <span>${item.label || item.title || 'Navigation'}</span>
                </span>
            `;
            sidebarMenu.appendChild(link);
        });
    };

    const updateModuleTabMenus = function (moduleUid, items) {
        if (!moduleUid) {
            return;
        }

        const serializedMenu = JSON.stringify(serializeMenuItems(items));

        document.querySelectorAll(`.module-tab[data-module-uid="${CSS.escape(moduleUid)}"], .dropdown-item[data-module-uid="${CSS.escape(moduleUid)}"]`).forEach((element) => {
            element.dataset.menu = serializedMenu;
            const labelNode = element.querySelector('.module-tab-label, span.text-truncate span');
            if (labelNode && Array.isArray(items) && items.length > 0) {
                const firstVisible = items.find((item) => item && item.label);
                if (firstVisible) {
                    element.setAttribute('title', firstVisible.label);
                }
            }
        });
    };

    const getCurrentModuleMenu = function (moduleUid) {
        if (!moduleUid) {
            return null;
        }

        const activeElement =
            document.querySelector(`.module-tab[data-module-uid="${CSS.escape(moduleUid)}"]`) ||
            document.querySelector(`.dropdown-item[data-module-uid="${CSS.escape(moduleUid)}"]`);

        if (!activeElement) {
            return null;
        }

        try {
            return JSON.parse(activeElement.dataset.menu || '[]');
        } catch (e) {
            return null;
        }
    };

    const notifySidebarRefresh = function (moduleUid, items) {
        if (!moduleUid) {
            return;
        }

        document.dispatchEvent(new CustomEvent('navigation:sidebar-refresh', {
            detail: {
                moduleUid,
                menu: serializeMenuItems(items),
            },
        }));
    };

    const refreshLiveSidebar = async function (moduleUid) {
        if (!moduleUid) {
            return;
        }

        try {
            const response = await fetch(`{{ url('/navigation-editor/sidebar') }}/${encodeURIComponent(moduleUid)}`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                cache: 'no-store',
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                return;
            }

            const html = result?.data?.html || '';
            if (html && appSidebar) {
                appSidebar.outerHTML = html;
            }

            const refreshedSidebar = document.getElementById('appSidebar');
            const refreshedMenu = refreshedSidebar?.querySelector('#sidebarMenu');
            if (refreshedMenu) {
                const items = [];
                refreshedMenu.querySelectorAll('.dropdown-item').forEach((node) => {
                    const label = node.querySelector('span.text-truncate span')?.textContent?.trim() || node.textContent?.trim() || 'Navigation';
                    const icon = node.querySelector('i')?.className || 'fas fa-circle';
                    items.push({
                        label,
                        icon,
                        url: node.getAttribute('href') || '#',
                    });
                });

                updateModuleTabMenus(moduleUid, items);
                notifySidebarRefresh(moduleUid, items);
                if (typeof window.__refreshNavigationSidebar === 'function') {
                    window.__refreshNavigationSidebar(moduleUid, items);
                }
            }
        } catch (error) {
            console.error('Failed to refresh live sidebar', error);
        }
    };

    const renderFeedback = function (message, type = 'success') {
        if (!feedback) {
            return;
        }

        const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
        feedback.innerHTML = `
            <div class="alert ${alertClass} m-0 p-2" role="alert">
                ${message}
            </div>
        `;
    };

    const editor = new JSONEditor(editorElement, {
        mode: 'tree',
        modes: ['code', 'form', 'text', 'tree', 'view', 'preview'],
        onChangeText: function (jsonString) {
            updatePayload(jsonString);
        }
    });

    let initialData = {};

    try {
        initialData = JSON.parse(editorElement.dataset.jsonSchema || '{}');
    } catch (e) {
        initialData = {};
    }

    editor.set(initialData);
    updatePayload(JSON.stringify(initialData, null, 2));

    form?.addEventListener('submit', async function (event) {
        event.preventDefault();

        try {
            hiddenInput.value = JSON.stringify(editor.get(), null, 2);
        } catch (e) {
            hiddenInput.value = '{}';
        }

        const navigationUid = form.querySelector('input[name="navigation_uid"]')?.value;
        const navigationType = form.querySelector('input[name="navigation_type"]')?.value;
        const payload = hiddenInput.value || '{}';

        try {
            const response = await fetch(`{{ url('/navigation-editor/update') }}/${encodeURIComponent(navigationUid)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    navigation_type: navigationType,
                    navigation_payload: payload,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(result?.message || 'Failed to save navigation.');
            }

            const sourceModuleUid = applySavedState(result, navigationUid, navigationType);
            const currentModuleUid = navigationEditorPage?.dataset.selectedModuleUid || sourceModuleUid;
            const savedItems = result?.data?.navigation_items || [];
            const currentMenu = getCurrentModuleMenu(currentModuleUid);
            const patchedMenu = patchMenuByNavigationUid(currentMenu, navigationUid, savedItems);
            window.sessionStorage.setItem(flashKey, result?.message || 'Navigation saved successfully.');
            window.sessionStorage.setItem(flashTypeKey, 'success');
            renderFeedback(result?.message || 'Navigation saved successfully.', 'success');

            if (Array.isArray(patchedMenu)) {
                renderSidebarMenu(serializeMenuItems(patchedMenu));
                updateModuleTabMenus(currentModuleUid, patchedMenu);
                notifySidebarRefresh(currentModuleUid, patchedMenu);
                if (typeof window.__refreshNavigationSidebar === 'function') {
                    window.__refreshNavigationSidebar(currentModuleUid, patchedMenu);
                }
            } else {
                await refreshLiveSidebar(currentModuleUid);
            }
        } catch (error) {
            console.error(error);
            renderFeedback(error.message || 'Failed to save navigation.', 'error');
        }
    });

    readFlashMessage();
});
</script>
@endpush
