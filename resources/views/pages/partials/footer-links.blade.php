@php use Iquesters\UserInterface\Support\InfoPages; @endphp
<div class="d-flex flex-wrap gap-3 justify-content-center small text-muted border-top pt-3 mt-4">
    @foreach (['help' => 'Help', 'privacy' => 'Privacy Policy', 'terms' => 'Terms & Conditions'] as $page => $label)
        <a class="link-secondary" href="{{ InfoPages::url($page) }}" @if (InfoPages::isExternal($page)) target="_blank" rel="noopener" @endif>{{ $label }}</a>
    @endforeach
    <span>&copy; {{ date('Y') }} {{ $appName ?? \Iquesters\UserInterface\Support\Assets::appName() }}</span>
</div>
