@php
    /*
     * TERMS & CONDITIONS TEMPLATE
     * Fill in these details, review the text below with your legal adviser,
     * then set $isTemplate = false.
     */
    $isTemplate = true;
    $company = 'Your Company Name';          // legal name of the organisation running this app
    $contactEmail = 'support@example.com';
    $address = 'Street, City, State, Postcode, Country';
    $jurisdiction = 'your country';          // whose laws govern these terms
    $courts = 'your city';                   // where disputes are heard
    $lastUpdated = '1 January 2026';
@endphp

@extends($pageLayout)

@section('page-title', \Iquesters\Foundation\Helpers\MetaHelper::make(['Terms & Conditions']))
@section('meta-description', "The terms that apply when you use {$appName}.")
@section('auth-card-class', 'col-lg-9 col-xl-8')

@section('content')
<article class="w-100 text-start lh-lg" style="max-width: 860px;">
    @include('userinterface::pages.partials.template-notice', ['file' => 'terms', 'setting' => 'terms_url'])

    <h1 class="h4 mb-1">Terms &amp; Conditions</h1>
    <p class="text-muted small mb-4">Last updated: {{ $lastUpdated }}</p>

    <p>These terms apply to your use of {{ $appName }}, operated by {{ $company }} ("we", "us"). By creating an account or using {{ $appName }}, you accept these terms. If you do not agree, please do not use {{ $appName }}.</p>

    <h2 class="h6 fw-semibold mt-4">1. Your account</h2>
    <p>Give accurate information when you register and keep it up to date. You are responsible for keeping your password safe and for everything done with your account. Do not share your account with others. Tell us straight away at <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a> if you think someone else has used it.</p>

    <h2 class="h6 fw-semibold mt-4">2. Using {{ $appName }}</h2>
    <p>We give you a personal, limited, revocable right to use {{ $appName }} for its intended purpose. You must not:</p>
    <ul>
        <li>break any law, or infringe the rights of others;</li>
        <li>post content that is unlawful, abusive, misleading or harmful;</li>
        <li>send spam or collect other users' information without their consent;</li>
        <li>try to gain unauthorised access, disrupt the service, or copy, scrape or reverse-engineer it.</li>
    </ul>

    <h2 class="h6 fw-semibold mt-4">3. Your content</h2>
    <p>You keep ownership of the content you add. You give us permission to store, display and process it as needed to run {{ $appName }}. You confirm that you have the right to share it.</p>

    <h2 class="h6 fw-semibold mt-4">4. Our content and intellectual property</h2>
    <p>{{ $appName }}, its software, design and content (other than yours) belong to {{ $company }} or its licensors and are protected by law. These terms do not give you any rights to them beyond using {{ $appName }}.</p>

    <h2 class="h6 fw-semibold mt-4">5. Third-party services and links</h2>
    <p>{{ $appName }} may use or link to services run by others, such as sign-in providers. We are not responsible for their content or practices; their own terms apply.</p>

    <h2 class="h6 fw-semibold mt-4">6. Availability and changes</h2>
    <p>We work to keep {{ $appName }} available and accurate, but we provide it "as is", without warranties of any kind. We may change, suspend or discontinue any part of it at any time.</p>

    <h2 class="h6 fw-semibold mt-4">7. Limitation of liability</h2>
    <p>To the extent the law allows, {{ $company }} is not liable for indirect or consequential losses, or for loss of data, profits or business, arising from your use of {{ $appName }}.</p>

    <h2 class="h6 fw-semibold mt-4">8. Suspension and termination</h2>
    <p>We may suspend or close your account if you break these terms or if we must do so by law. You may stop using {{ $appName }} and delete your account at any time from your settings.</p>

    <h2 class="h6 fw-semibold mt-4">9. Changes to these terms</h2>
    <p>We may update these terms. We will post the new version on this page and change the "Last updated" date. If you keep using {{ $appName }} after a change, you accept the updated terms.</p>

    <h2 class="h6 fw-semibold mt-4">10. Governing law and disputes</h2>
    <p>These terms are governed by the laws of {{ $jurisdiction }}. We will first try to resolve any dispute with you informally; if that fails, the courts of {{ $courts }} have jurisdiction. If any part of these terms is found invalid, the rest stays in force.</p>

    <h2 class="h6 fw-semibold mt-4">11. Contact us</h2>
    <p class="mb-0">{{ $company }}<br>{{ $address }}<br><a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></p>

    @include('userinterface::pages.partials.footer-links')
</article>
@endsection
