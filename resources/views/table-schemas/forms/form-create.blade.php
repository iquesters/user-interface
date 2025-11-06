<div class="card bg-light border-0">
    <div class="card-header bg-light border-0">
        <div class="d-flex align-items-center gap-2">
            <i class="far fa-fw fa-building"></i>
            <h5 class="mb-0 mt-1">Create New Table</h5>
        </div>
    </div>

    <div class="card-body">
        <div class="row row-cols-1 g-2">
            <div class="col">
                <div class="form-block">
                    <form id="create-form-schema-form" 
                          class="row row-cols-1 row-cols-md-4 needs-validation"
                          action="{{ route('table.store') }}" 
                          method="post">
                        @csrf

                        <div class="col-md-6">
                            <!-- Table Name -->
                            <div class="form-floating mb-2">
                                <input type="text" id="name" class="form-control" 
                                       name="name" value="{{ old('name') }}"
                                       placeholder="The name of your table" required>
                                <label for="name">Table Name</label>
                                <div class="help-info small text-secondary">
                                    <span>This will be the name of your table</span>
                                </div>
                            </div>

                            <!-- Slug -->
                            <div class="form-floating mb-2">
                                <input type="text" id="slug" class="form-control" 
                                       name="slug" value="{{ old('slug') }}"
                                       placeholder="A unique slug for this table">
                                <label for="slug">Slug (optional)</label>
                                <div class="help-info small text-secondary">
                                    <span>If left empty, a slug will be auto-generated from the table name</span>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="form-floating mb-2">
                                <textarea id="description" class="form-control" 
                                          name="description" 
                                          placeholder="The description of your table"
                                          style="height: 100px">{{ old('description') }}</textarea>
                                <label for="description">Description</label>
                                <div class="help-info small text-secondary">
                                    <span>This will be the description of your table</span>
                                </div>
                            </div>

                            <!-- Extra Info JSON -->
                            <div class="form-control mb-2">
                                <label for="extra_info">Extra Information</label>
                                <div id="extra_info-json" class="json-editor" 
                                     data-input="extra_info" data-json-schema=""></div>

                                <textarea id="extra_info" 
                                          class="form-control d-none" 
                                          name="extra_info" 
                                          placeholder="Extra information for your table"
                                          style="height: 100px"></textarea>

                                <div class="help-info small text-secondary">
                                    <span>This will be the extra information of your table</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <!-- Schema JSON -->
                            <div class="form-control mb-2">
                                <label for="schema">Schema</label>
                                <div id="schema-json" class="json-editor" 
                                     data-input="schema" data-json-schema=""></div>

                                <textarea id="schema" name="schema" required
                                          style="opacity:0; position:absolute; left:-9999px;"></textarea>

                                <div class="help-info small text-secondary">
                                    <span>This will be the schema of your table</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="card-footer bg-light border-0">
        <div class="d-flex justify-content-end">
            <button type="submit" form="create-form-schema-form" class="btn btn-secondary">Submit</button>
        </div>
    </div>
</div>

@push('scripts')
<script>
    const GLOBAL_JSON_EDITOR_OPTIONS = {
        mode: 'tree',
        modes: ['code', 'form', 'text', 'tree', 'view', 'preview'], // allowed modes
    };

    const jsonEditorElements = document.getElementsByClassName('json-editor') || [];
    const jsonEditors = {};

    Array.from(jsonEditorElements).forEach(element => {
        const inputField = document.getElementById(element.dataset.input);

        GLOBAL_JSON_EDITOR_OPTIONS.onChangeText = (jsonString) => {
            inputField.value = jsonString;
        };

        const editor = new JSONEditor(element, {
            ...GLOBAL_JSON_EDITOR_OPTIONS,
            ...(element?.options || {})
        });

        try {
            const jsonData = JSON.parse(element.dataset?.jsonSchema || "{}");
            editor.set(jsonData);
            inputField.value = JSON.stringify(jsonData, null, 2);
        } catch (err) {
            editor.set({});
            inputField.value = "{}";
        }

        jsonEditors[element.id] = editor;
    });
</script>
@endpush