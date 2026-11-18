{{-- Shown while a page is still the unedited template, only to developers
     (APP_DEBUG) and super-admins, so visitors of a live site never see it. --}}
@if (($isTemplate ?? false) && (config('app.debug') || auth()->user()?->hasRole('super-admin')))
<div class="alert alert-warning small d-flex gap-2 align-items-start" role="note">
    <i class="fas fa-fw fa-pen-to-square mt-1"></i>
    <div>
        <strong>Template page.</strong>
        Edit <code>resources/views/vendor/userinterface/pages/{{ $file }}.blade.php</code>
        (fill in the details at the top{{ ($legal ?? true) ? ' and review the text with your legal adviser' : ' and adapt the questions to your app' }}),
        then set <code>$isTemplate = false</code> to hide this note.
        To link an external page instead, set <em>{{ $setting }}</em> in the user-interface settings.
    </div>
</div>
@endif
