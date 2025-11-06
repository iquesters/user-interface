<div class="card bg-light border-0">
    <div class="card-header bg-light border-0">
        <div class="d-flex align-items-center gap-2">
            <i class="far fa-fw fa-building"></i>
            <h5 class="mb-0 mt-1">Update Form</h5>
        </div>
    </div>

    <div class="card-body">
        <div class="row row-cols-1 g-2">
            <div class="col">
                <div class="form-block">
                    <form id="update-form-schema-form"
                          class="row row-cols-1 row-cols-md-4 needs-validation"
                          action="{{ route('table.update.schema', $table->id) }}"
                          method="post">

                        @csrf

                        <div class="col-md-6">
                            <!-- Name -->
                            <div class="form-floating mb-2">
                                <input type="text" id="name" class="form-control"
                                       name="name" value="{{ old('name', $table->name) }}"
                                       placeholder="The name of your form" required>
                                <label for="name">Form Name</label>
                                <div class="help-info small text-secondary">
                                    <span>This will be the name of your form</span>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="form-floating mb-2">
                                <textarea id="description" class="form-control"
                                          name="description" placeholder="The description of your form"
                                          style="height: 100px">{{ old('description', $table->description) }}</textarea>
                                <label for="description">Description</label>
                                <div class="help-info small text-secondary">
                                    <span>This will be the description of your form</span>
                                </div>
                            </div>

                            <!-- Extra Info JSON -->
                            <div class="form-control mb-2">
                                <label for="extra_info">Extra Information</label>
                                <div id="extra_info-json"
                                     class="json-editor"
                                     data-input="extra_info"
                                     data-json-schema='@json($table->extra_info)'></div>

                                <textarea id="extra_info"
                                          class="form-control d-none"
                                          name="extra_info"
                                          placeholder="The extra information of your form"
                                          style="height: 100px">{{ json_encode($table->extra_info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</textarea>

                                <div class="help-info small text-secondary">
                                    <span>This will be the extra information of your form</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <!-- Schema JSON -->
                            <div class="form-control mb-2">
                                <label for="schema">Schema</label>
                                <div id="schema-json"
                                     class="json-editor"
                                     data-input="schema"
                                     data-json-schema='@json($table->schema)'></div>

                                <textarea id="schema"
                                          class="form-control d-none"
                                          name="schema"
                                          required
                                          style="height: 500px">{{ json_encode($table->schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</textarea>

                                <div class="help-info small text-secondary">
                                    <span>This will be the schema of your form</span>
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
            <button type="submit" form="update-form-schema-form" class="btn btn-secondary">Submit</button>
        </div>
    </div>
</div>