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
                    <form id="create-form-schema-form" class="row row-cols-1 row-cols-md-4 needs-validation" action="{{ route('table.store') }}" method="post">
                        @csrf
                        <div class="col-md-6">
                            <div class="form-floating mb-2">
                                <input type="text" id="name" class="form-control" name="name" value="" placeholder="The name of your table" required>
                                <label for="name">Table Name</label>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the name of your table
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Table name is required</strong>
                                </div>
                            </div>
                            <div class="form-floating mb-2">
                                <textarea type="text" id="description" class="form-control " name="description" value="" placeholder="The description of your table" style="height: 100px"></textarea>
                                <label for="description">Description</label>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the description of your table
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Table description is required</strong>
                                </div>
                            </div>
                            <div class="form-control mb-2">
                                <label for="extra_info">Extra Information</label>
                                <div id="extra_info-json" class="json-editor" data-input="extra_info" data-json-schema=""></div>
                                <textarea type="text" id="extra_info" class="form-control d-none" name="extra_info" value="" placeholder="The extra information of your table" style="height: 100px"></textarea>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the extra information of your table
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Table extra information is required</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-control mb-2">
                                <label for="schema">Schema</label>
                                <div id="schema-json" class="json-editor" data-input="schema" data-json-schema=""></div>
                                <textarea type="text" id="schema" class="form-control d-none" name="schema" value="" placeholder="The schema of your table" required style="height: 200px"></textarea>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the schema of your table
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Table schema is required</strong>
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
        // ensure input field is linked correctly
        const inputField = document.getElementById(element.dataset.input);

        GLOBAL_JSON_EDITOR_OPTIONS.onChangeText = (jsonString) => {
            inputField.value = jsonString; // sync to textarea
        };

        // create the editor
        const editor = new JSONEditor(element, {
            ...GLOBAL_JSON_EDITOR_OPTIONS,
            ...(element?.options || {})
        });

        // set initial value
        try {
            const jsonData = JSON.parse(element.dataset?.jsonSchema || "{}");
            editor.set(jsonData);
            inputField.value = JSON.stringify(jsonData, null, 2);
        } catch (err) {
            editor.set({});
            inputField.value = "{}";
        }

        // store reference
        jsonEditors[element.id] = editor;
    });
</script>
@endpush
