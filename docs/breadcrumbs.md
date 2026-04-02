# Breadcrumb Implementation 

## For Users
Breadcrumbs help you navigate through the application by showing
your current location and the path you took to get there.

Example:
Dashboard → Contacts → View Contact

---

## For Developers

### Overview
The application uses the `diglactic/laravel-breadcrumbs` package.
Breadcrumbs are already rendered in `app.blade.php` inside the
`user-interface` package and will automatically show on any page
where a breadcrumb is defined.

### How It Currently Works
- Breadcrumbs are rendered globally in `resources/views/layouts/app.blade.php`
- Currently only `dashboard` and `admin.dashboard` are defined in `user-interface/routes/breadcrumbs.php`
- The breadcrumb bar is hidden automatically if no definition exists for the current route

### Architecture
```
User visits a page
        ↓
app.blade.php checks if Breadcrumbs::exists()
        ↓
Looks for definition in messenger/routes/breadcrumbs.php
        ↓
If found → renders breadcrumb
If not found → hides breadcrumb bar
```

### Approach to Add Breadcrumbs to All Pages

Since `messenger` is the main application that consumes all packages
(user-interface, smart-messenger, user-management, foundation etc.),
the recommended approach is to define **all breadcrumbs centrally**
in `messenger/routes/breadcrumbs.php`.

This avoids scattering breadcrumb definitions across multiple packages
and gives a single place to manage all navigation trails.

### Implementation Steps

#### Step 1 — Create `routes/breadcrumbs.php` in messenger
```php
<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

// Dashboard
Breadcrumbs::for('dashboard', function (BreadcrumbTrail $trail) {
    $trail->push('Dashboard', route('dashboard'));
});

// Admin Dashboard
Breadcrumbs::for('admin.dashboard', function (BreadcrumbTrail $trail) {
    $trail->push('Admin Dashboard', route('admin.dashboard'));
});

// ---- Smart Messenger ----

// Contacts
Breadcrumbs::for('contacts.index', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Contacts', route('contacts.index'));
});

Breadcrumbs::for('contacts.show', function (BreadcrumbTrail $trail, $contact) {
    $trail->parent('contacts.index');
    $trail->push($contact->name, route('contacts.show', $contact));
});

// Messages
Breadcrumbs::for('messages.index', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Messages', route('messages.index'));
});

// Channels
Breadcrumbs::for('channels.index', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Channels', route('channels.index'));
});

// ---- User Interface ----

// Forms
Breadcrumbs::for('form.list', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Forms', route('form.list'));
});

Breadcrumbs::for('form.create', function (BreadcrumbTrail $trail) {
    $trail->parent('form.list');
    $trail->push('Create Form', route('form.create'));
});

Breadcrumbs::for('form.overview', function (BreadcrumbTrail $trail, $id) {
    $trail->parent('form.list');
    $trail->push('Form Overview', route('form.overview', $id));
});

// Tables
Breadcrumbs::for('table.list', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Tables', route('table.list'));
});

Breadcrumbs::for('table.create', function (BreadcrumbTrail $trail) {
    $trail->parent('table.list');
    $trail->push('Create Table', route('table.create'));
});

// Settings
Breadcrumbs::for('settings', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Settings', route('settings'));
});
```

#### Step 2 — Register the breadcrumbs file in messenger

In `messenger/app/Providers/AppServiceProvider.php` or `RouteServiceProvider.php`:
```php
public function boot(): void
{
    require base_path('routes/breadcrumbs.php');
}
```

#### Step 3 — Verify breadcrumbs render

Breadcrumbs are already rendered in `user-interface/resources/views/layouts/app.blade.php`:
```php
<div class="position-sticky p-2 bg-white ps-3 breadcrumbs">
    @if(Breadcrumbs::exists())
        {{ Breadcrumbs::render() }}
    @endif
</div>
```

No changes needed here — it will automatically pick up all definitions. ✅

### Folder Structure
```
messenger/                          ← main app
├── routes/
│   └── breadcrumbs.php            ← all breadcrumbs defined here
│
user-interface/                     ← package
├── docs/
│   └── breadcrumbs.md
├── routes/
│   └── breadcrumbs.php            ← only dashboard definitions
├── resources/
│   └── views/
│       └── layouts/
│           └── app.blade.php      ← renders breadcrumbs automatically
```

### Key Files
- `messenger/routes/breadcrumbs.php` — central breadcrumb definitions
- `user-interface/routes/breadcrumbs.php` — existing dashboard definitions
- `user-interface/resources/views/layouts/app.blade.php` — renders breadcrumbs

### Notes
- Always define parent breadcrumb before child
- Breadcrumb bar is hidden automatically if no definition exists
- All breadcrumbs should trace back to `dashboard` as the root
- Dynamic routes (e.g. show, edit) should pass the model or ID as parameter