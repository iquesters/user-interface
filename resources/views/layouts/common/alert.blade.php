@if (session('status'))
    <div class="alert alert-info m-0 mt-3 p-2 w-100" role="alert">
        {{ session('status') }}
    </div>
    @endif
    @if(session('success'))
    <div class="alert alert-success m-0 mt-3 p-2 w-100" role="alert">
        {{ session('success') }}
    </div>
    @endif
    @if (session('error'))
    <div class="alert alert-danger m-0 mt-3 p-2 w-100" role="alert">
        {{ session('error') }}
    </div>
@endif