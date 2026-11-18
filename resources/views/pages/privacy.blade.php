@php
    /*
     * PRIVACY POLICY TEMPLATE
     * Fill in these details, review the text below with your legal adviser,
     * then set $isTemplate = false.
     */
    $isTemplate = true;
    $company = 'Your Company Name';          // legal name of the organisation running this app
    $contactEmail = 'privacy@example.com';
    $address = 'Street, City, State, Postcode, Country';
    $jurisdiction = 'your country';          // whose laws govern this policy
    $lastUpdated = '1 January 2026';
@endphp

@extends($pageLayout)

@section('page-title', \Iquesters\Foundation\Helpers\MetaHelper::make(['Privacy Policy']))
@section('meta-description', "How {$appName} collects, uses and protects your personal information.")
@section('auth-card-class', 'col-lg-9 col-xl-8')

@section('content')
<article class="w-100 text-start lh-lg" style="max-width: 860px;">
    @include('userinterface::pages.partials.template-notice', ['file' => 'privacy', 'setting' => 'privacy_url'])

    <h1 class="h4 mb-1">Privacy Policy</h1>
    <p class="text-muted small mb-4">Last updated: {{ $lastUpdated }}</p>

    <p>This policy explains how {{ $company }} ("we", "us") collects, uses and protects personal information when you use {{ $appName }}. By using {{ $appName }} you agree to the practices described here.</p>

    <h2 class="h6 fw-semibold mt-4">1. Information we collect</h2>
    <ul>
        <li><strong>Account details</strong> you give us: name, email address, phone number and password.</li>
        <li><strong>Profile details</strong> you choose to add, such as a profile picture or preferences.</li>
        <li><strong>Sign-in details</strong> from providers you use to sign in (for example Google): your name, email address and profile picture.</li>
        <li><strong>Technical data</strong> collected automatically: IP address, browser and device type, pages visited and the time of your visits.</li>
    </ul>
    <p>{{ $appName }} is not intended for children. We do not knowingly collect information from anyone under the age of digital consent in {{ $jurisdiction }}.</p>

    <h2 class="h6 fw-semibold mt-4">2. How we use your information</h2>
    <ul>
        <li>To create and manage your account and let you sign in securely.</li>
        <li>To provide, maintain and improve {{ $appName }}.</li>
        <li>To send you messages about your account, such as verification codes and security notices.</li>
        <li>To detect and prevent fraud, abuse and security incidents.</li>
        <li>To meet our legal obligations.</li>
    </ul>

    <h2 class="h6 fw-semibold mt-4">3. Sharing your information</h2>
    <p>We do not sell your personal information. We share it only:</p>
    <ul>
        <li>with service providers who help us run {{ $appName }} (for example hosting, email and SMS delivery), under agreements that protect your data;</li>
        <li>when required by law, or to protect the rights and safety of our users and of {{ $company }};</li>
        <li>with a successor organisation if {{ $company }} is merged or acquired, which will remain bound by this policy.</li>
    </ul>

    <h2 class="h6 fw-semibold mt-4">4. Cookies</h2>
    <p>We use cookies that are needed to keep you signed in and to protect forms against misuse. We do not control cookies set by third-party services, such as sign-in providers, which follow their own policies.</p>

    <h2 class="h6 fw-semibold mt-4">5. Data retention and security</h2>
    <p>We keep your information while your account is active and as long as needed for the purposes above or by law. We protect it with reasonable technical and organisational measures, but no method of transmission or storage is completely secure.</p>

    <h2 class="h6 fw-semibold mt-4">6. Your rights and choices</h2>
    <p>You can view and update your profile at any time, and delete your account from your settings. You may also ask us for a copy of your information, ask us to correct or delete it, or withdraw your consent, by writing to <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>.</p>

    <h2 class="h6 fw-semibold mt-4">7. Changes to this policy</h2>
    <p>We may update this policy from time to time. We will post the new version on this page and change the "Last updated" date; for significant changes we will also notify you.</p>

    <h2 class="h6 fw-semibold mt-4">8. Governing law</h2>
    <p>This policy is governed by the laws of {{ $jurisdiction }}.</p>

    <h2 class="h6 fw-semibold mt-4">9. Contact us</h2>
    <p class="mb-0">{{ $company }}<br>{{ $address }}<br><a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a></p>

    @include('userinterface::pages.partials.footer-links')
</article>
@endsection
