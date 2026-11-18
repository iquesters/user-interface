@php
    /*
     * HELP PAGE TEMPLATE
     * Replace the questions below with ones that fit your app, fill in the
     * support details, then set $isTemplate = false.
     */
    $isTemplate = true;
    $supportEmail = 'support@example.com';
    $supportHours = 'Monday to Friday, 10:00 to 18:00';

    $faqs = [
        'How do I change my name or theme?' => 'Open the menu under your profile picture, choose Settings, and update Basic Information.',
        'How do I change my profile picture?' => 'Go to My Profile and click the camera button on your picture. You can upload an image or take a photo, then crop it.',
        'I forgot my password. What should I do?' => 'On the sign-in page choose "Forgot your password?" and follow the link we email you.',
        'How do I change my password?' => 'Go to Settings, open Update Password, and enter your current password and the new one.',
        'How do I delete my account?' => 'Go to Settings and open Delete Account. This permanently removes your account and cannot be undone.',
    ];
@endphp

@extends($pageLayout)

@section('page-title', \Iquesters\Foundation\Helpers\MetaHelper::make(['Help']))
@section('meta-description', "Answers to common questions about {$appName}, and how to contact support.")
@section('auth-card-class', 'col-lg-9 col-xl-8')

@section('content')
<article class="w-100 text-start" style="max-width: 860px;">
    @include('userinterface::pages.partials.template-notice', ['file' => 'help', 'setting' => 'help_url', 'legal' => false])

    <h1 class="h4 mb-1">Help</h1>
    <p class="text-muted small mb-4">Answers to common questions about {{ $appName }}.</p>

    <div class="accordion mb-4" id="helpFaq">
        @foreach ($faqs as $question => $answer)
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button {{ $loop->first ? '' : 'collapsed' }}" type="button" data-bs-toggle="collapse" data-bs-target="#faq-{{ $loop->index }}" aria-expanded="{{ $loop->first ? 'true' : 'false' }}" aria-controls="faq-{{ $loop->index }}">
                        {{ $question }}
                    </button>
                </h2>
                <div id="faq-{{ $loop->index }}" class="accordion-collapse collapse {{ $loop->first ? 'show' : '' }}" data-bs-parent="#helpFaq">
                    <div class="accordion-body small">{{ $answer }}</div>
                </div>
            </div>
        @endforeach
    </div>

    <h2 class="h6 fw-semibold">Still need help?</h2>
    <p class="small mb-0">
        Email <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a>.
        We reply {{ $supportHours }}.
    </p>

    @include('userinterface::pages.partials.footer-links')
</article>
@endsection
