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
                    <form id="update-form-schema-form" class="row row-cols-1 row-cols-md-4 needs-validation" action="{{ route('table.update.schema', $table->id) }}" method="post">
                        @csrf
                        <div class="col-md-6">
                            <div class="form-floating mb-2">
                                <input type="text" id="name" class="form-control" name="name" value="{{ $table->name }}" placeholder="The name of your form" required>
                                <label for="name">Form Name</label>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the name of your form
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Form name is required</strong>
                                </div>
                            </div>
                            <div class="form-floating mb-2">
                                <textarea type="text" id="description" class="form-control " name="description" value="" placeholder="The description of your form" style="height: 100px">{{ $table->description }}</textarea>
                                <label for="description">Description</label>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the description of your form
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Form description is required</strong>
                                </div>
                            </div>
                            <div class="form-control mb-2">
                                <label for="extra_info">Extra Information</label>
                                <div id="extra_info-json" class="json-editor" data-input="extra_info" data-json-schema="{{ $table->extra_info }}"></div>
                                <textarea type="text" id="extra_info" class="form-control json-editor" name="extra_info" value="" placeholder="The extra information of your form" style="height: 100px">{{ $table->extra_info }}</textarea>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the extra information of your form
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Form extra information is required</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-control mb-2">
                                <label for="schema">Schema</label>
                                <div id="schema-json" class="json-editor" data-input="schema" data-json-schema="{{ $table->schema }}"></div>
                                <textarea type="text" id="schema" class="form-control" name="schema" value="" placeholder="The schema of your form" required style="height: 500px">{{ $table->schema }}</textarea>
                                <div class="help-info small text-secondary">
                                    <span class="small">
                                        This will be the schema of your form
                                    </span>
                                </div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                                <div class="invalid-feedback">
                                    <strong>Form schema is required</strong>
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