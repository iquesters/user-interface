@extends(app('app.layout'))

@section('title', 'Theme Selector')

@section('content')
<div class="w-100 row">
    <div class="col-6">
        <h5 class="mb-2 fs-6 text-muted">Theme</h5>
        <form method="POST" action="{{ route('master-data.update', $themeMasterData->id) }}">
            @csrf
            @method('PUT')

            {{-- Hidden fields required by update() --}}
            <input type="hidden" name="key" value="{{ $themeMasterData->key }}">
            <input type="hidden" name="parent_id" value="{{ $themeMasterData->parent_id }}">

            {{-- Dropdown --}}
            <div class="d-flex align-items-center gap-2 mb-3">
                <select name="value" class="form-select" style="width: 250px;">
                    <option value="">-- Select Theme --</option>
                    @foreach ($themes as $theme)
                        <option value="{{ $theme->key }}" 
                            {{ $themeMasterData->value === $theme->key ? 'selected' : '' }}>
                            {{ $theme->value }}
                        </option>
                    @endforeach
                </select>
            </div>

            {{-- Apply button --}}
            <div>
                <button type="submit" class="btn btn-primary">Apply Theme</button>
            </div>
        </form>
    </div>

    <div class="col-6">
        @include('userinterface::components.form',
        [
            'id' => '01K9VBTPS84ZWP5GMJ6NJ04JKY'
        ])
    </div>
</div>


@endsection