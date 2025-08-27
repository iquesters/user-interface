@extends(config('userinterface.layout_app'))

@section('title', 'Create New Form')

@section('content')

<div class="container">
    <h2>{{$data->parent->name ?? 'Form'}}</h2>

    <form id="dynamic-form" method="POST" 
          data-schema='@json($schema)'>
        @csrf
        <!-- Fields will be built dynamically -->
    </form>
</div>
@endsection

@pushonce('scripts')
<script type="text/javascript">
    function buildDynamicForm(formId) {
        const form = document.getElementById(formId);
        const schema = JSON.parse(form.dataset.schema || "{}");

        if (!schema.fields) return;

        schema.fields.forEach(field => {
            let wrapper = document.createElement("div");
            wrapper.classList.add("form-group", "mb-3");

            // Label (skip for hidden inputs)
            if (field.type !== "boolean" && field.type !== "hidden") {
                let label = document.createElement("label");
                label.innerText = field.label ?? field.name;
                label.setAttribute("for", field.name);
                wrapper.appendChild(label);
            }

            let input;

            switch(field.type) {
                // ✅ text-like inputs
                case "string":
                case "text":
                case "email":
                case "password":
                case "tel":
                case "url":
                case "search":
                case "color":
                case "hidden":
                    input = document.createElement("input");
                    input.type = (field.type === "string" || field.type === "text") ? "text" : field.type;
                    input.classList.add("form-control");
                    break;

                // ✅ numbers
                case "number":
                case "integer":
                case "range":
                    input = document.createElement("input");
                    input.type = (field.type === "integer") ? "number" : field.type;
                    input.classList.add("form-control");
                    break;

                // ✅ textarea
                case "textarea":
                    input = document.createElement("textarea");
                    input.classList.add("form-control");
                    break;

                // ✅ select dropdown
                case "select":
                    input = document.createElement("select");
                    input.classList.add("form-select");
                    Object.entries(field.options || {}).forEach(([val, text]) => {
                        let opt = new Option(text, val);
                        input.appendChild(opt);
                    });
                    break;

                // ✅ radio group
                case "radio":
                    Object.entries(field.options || {}).forEach(([val, text]) => {
                        let radioWrapper = document.createElement("div");
                        radioWrapper.classList.add("form-check");

                        let radio = document.createElement("input");
                        radio.type = "radio";
                        radio.classList.add("form-check-input");
                        radio.name = field.name;
                        radio.value = val;
                        radio.id = field.name + "_" + val;

                        let radioLabel = document.createElement("label");
                        radioLabel.classList.add("form-check-label");
                        radioLabel.setAttribute("for", radio.id);
                        radioLabel.innerText = text;

                        radioWrapper.appendChild(radio);
                        radioWrapper.appendChild(radioLabel);
                        wrapper.appendChild(radioWrapper);
                    });
                    break;

                // ✅ checkbox / boolean
                case "boolean":
                case "checkbox":
                    input = document.createElement("input");
                    input.type = "checkbox";
                    input.classList.add("form-check-input");
                    let lbl = document.createElement("label");
                    lbl.setAttribute("for", field.name);
                    lbl.innerText = " " + (field.label ?? field.name);
                    lbl.classList.add("form-check-label", "ms-1");
                    wrapper.appendChild(input);
                    wrapper.appendChild(lbl);
                    break;

                // ✅ date/time
                case "date":
                case "time":
                case "datetime":
                case "datetime-local":
                case "month":
                case "week":
                    input = document.createElement("input");
                    input.type = (field.type === "datetime") ? "datetime-local" : field.type;
                    input.classList.add("form-control");
                    break;

                // ✅ file upload
                case "file":
                    input = document.createElement("input");
                    input.type = "file";
                    input.classList.add("form-control");
                    break;

                default:
                    console.warn("Unsupported field type:", field.type);
            }

            if (input) {
                input.name = field.name;
                input.id = field.name;
                if (field.placeholder) input.placeholder = field.placeholder;
                if (field.required) input.required = true;

                // append input if not already added (e.g. radio handled separately)
                if (field.type !== "radio" && field.type !== "boolean" && field.type !== "checkbox") {
                    wrapper.appendChild(input);
                }
            }

            form.appendChild(wrapper);
        });

        // ✅ Render Submit button dynamically
        if (schema.submit) {
            let btn = document.createElement("button");
            btn.type = schema.submit.type || "submit";  // default submit
            btn.innerText = schema.submit.label || "Submit";

            if (schema.submit.class) {
                btn.className = schema.submit.class; // optional CSS class
            }

            form.appendChild(btn);
        }
    }

    document.addEventListener("DOMContentLoaded", () => buildDynamicForm("dynamic-form"));
</script>
@endpushonce
