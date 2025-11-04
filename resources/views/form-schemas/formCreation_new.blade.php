@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    use Iquesters\UserManagement\Config\UserManagementKeys;
    $layout=ConfProvider::from(Module::USER_INFE)->app_layout;
    
@endphp 

@extends($layout)

@section('content')

<!-- <div class="container-fluid"> -->
<div class="resizable-container p-2 bg-light d-flex" style="height: calc(100vh - 200px);">
    <!-- <div class="row"> -->
        <!-- Left Side -->
        <!-- <div class="col-md-6"> -->
        <div class="resizable-left" style="width: 50%; min-width: 200px;">
            <div class="form-control mb-2">
                <label for="schema">Schema</label>
                <div id="schema-json" class="json-editor" data-input="schema" data-json-schema="{{ $data->parent->schema }}"></div>
                <textarea type="text" id="schema" class="form-control" name="schema" value="" placeholder="The schema of your form" required style="height: 500px">{{ $data->parent->schema }}</textarea>
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

        <!-- FIXED: Resize handle -->
        <div class="resize-handle"></div>

        <!-- Right Side -->
        <!-- <div class="col-md-6"> -->
        <div class="resizable-right" style="flex: 1; min-width: 200px;">
            <form id="{{$data->parent->slug}}" class="shoz-form" 
                
                method="POST" 
                enctype="multipart/form-data"
                data-form-meta=""
                data-form-data='{"name":"Sudipta","email":"sudipta@example.com"}'>
                @csrf   
            </form>
        </div>
    <!-- </div> -->
</div>

@endsection


@push('styles')
<style>
/* FIXED: Updated resizable container styles to prevent horizontal scroll */
.resizable-container {
    position: relative;
    overflow: hidden; /* Prevent horizontal scroll */
}

.resizable-left {
    overflow-y: auto;   /* ✅ enable vertical scroll */
    overflow-x: hidden; /* ✅ prevent horizontal scroll */
    height: 100%;       /* ✅ fill available height */
}

.resizable-right {
    overflow-y: auto;   /* ✅ enable vertical scroll */
    overflow-x: hidden; /* ✅ prevent horizontal scroll */
    height: 100%;       /* ✅ fill available height */
}


.resize-handle {
    width: 6px;
    cursor: col-resize;
    background: linear-gradient(90deg, transparent 2px, #dee2e6 2px, #dee2e6 4px, transparent 4px);
    position: relative;
    flex-shrink: 0;
}

.resize-handle:hover {
    background: linear-gradient(90deg, transparent 1px, #0d6efd 1px, #0d6efd 5px, transparent 5px);
}

.resize-handle::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 40px;
    background: transparent;
}


</style>
@endpush

@push('scripts')
<script>
$(document).ready(function() {
    // FIXED: Updated resize functionality with better constraints
    let isResizing = false;
    
    $('.resize-handle').mousedown(function(e) {
        isResizing = true;
        $('body').css('user-select', 'none'); // Prevent text selection during resize
        
        $(document).mousemove(function(e) {
            if (!isResizing) return;
            
            const container = $('.resizable-container');
            const containerOffset = container.offset().left;
            const containerWidth = container.width();
            const mouseX = e.pageX - containerOffset;
            
            // Calculate the percentage, accounting for the resize handle width (6px)
            const handleWidth = 6;
            const availableWidth = containerWidth - handleWidth;
            const leftWidth = ((mouseX - handleWidth/2) / availableWidth) * 100;
            
            // Constrain between 20% and 80% to prevent horizontal scrolling
            if (leftWidth >= 20 && leftWidth <= 80) {
                $('.resizable-left').css('width', leftWidth + '%');
            }
        });
        
        $(document).mouseup(function() {
            isResizing = false;
            $('body').css('user-select', ''); // Restore text selection
            $(document).off('mousemove mouseup');
        });
        
        e.preventDefault(); // Prevent default drag behavior
    });

    
});
</script>
@endpush



