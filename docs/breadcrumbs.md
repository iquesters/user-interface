# Breadcrumb Integration Documentation

## For Users
Breadcrumbs help you navigate through the application by showing
your current location and the path you took to get there.

Example:
Dashboard → Contacts → View Contact

---

## For Developers

### Overview
The application uses the `diglactic/laravel-breadcrumbs` package.
Breadcrumbs are already rendered globally in `app.blade.php` inside
the `user-interface` package and will automatically show on any page
where a breadcrumb is defined.

### How It Currently Works
- Breadcrumbs are rendered globally in `resources/views/layouts/app.blade.php`
- Currently only `dashboard` and `admin.dashboard` are defined in `user-interface/routes/breadcrumbs.php`
- The breadcrumb bar is hidden automatically if no definition exists for the current route

### Problem With Current Approach
- `messenger` is the **main application** that consumes all packages — breadcrumb definitions should live inside their respective packages, not in the main application
- Writing all breadcrumb definitions in `user-interface/routes/breadcrumbs.php` is not scalable — each package owns its own routes and should own its own breadcrumb definitions
- Unstructured scattering of breadcrumb definitions across packages makes maintenance harder

---

## Approach 1 — Each Package Owns Its Breadcrumbs

Just like tabs, each package is self-contained and responsible for its own breadcrumb definitions.

### Architecture
```
User visits a page (e.g. contacts.index in smart-messenger)
        ↓
app.blade.php checks Breadcrumbs::exists()
        ↓
Looks for definition in smart-messenger/routes/breadcrumbs.php
        ↓
If found → renders breadcrumb trail
If not found → hides breadcrumb bar
```

### Implementation Steps

#### Step 1 — Each package creates its own `routes/breadcrumbs.php`

For example in `smart-messenger/routes/breadcrumbs.php`:
```php
<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

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
```

For `organisation/routes/breadcrumbs.php`:
```php
<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('organisation.index', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Organisation', route('organisation.index'));
});
```

For `integration/routes/breadcrumbs.php`:
```php
<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('integration.index', function (BreadcrumbTrail $trail) {
    $trail->parent('dashboard');
    $trail->push('Integrations', route('integration.index'));
});
```

#### Step 2 — Register breadcrumbs file in each package's Service Provider

In each package's `ServiceProvider.php`:
```php
public function boot(): void
{
    $this->loadRoutesFrom(__DIR__ . '/../../routes/breadcrumbs.php');
}
```

#### Step 3 — No changes needed in `app.blade.php`

Breadcrumbs are already rendered in `user-interface/resources/views/layouts/app.blade.php`:
```php
<div class="position-sticky p-2 bg-white ps-3 breadcrumbs">
    @if(Breadcrumbs::exists())
        {{ Breadcrumbs::render() }}
    @endif
</div>
```

This automatically picks up definitions from all packages. 

---

## Approach 2 — Pass `$breadcrumbs` Array (Like Tabs)

Instead of using `breadcrumbs.php` files, breadcrumbs can be passed
directly from the controller as an array — exactly like `$tabs`.

### How It Works

In the controller:
```php
return view('contacts.index', [
    'breadcrumbs' => [
        ['label' => 'Dashboard', 'route' => 'dashboard'],
        ['label' => 'Contacts', 'route' => 'contacts.index'],
    ]
]);
```

In `app.blade.php` — same as tabs:
```php
@includeWhen(isset($breadcrumbs) && is_array($breadcrumbs), 'userinterface::layouts.common.breadcrumbs')
```

Create a `breadcrumbs.blade.php` component in user-interface:
```php
@if(!empty($breadcrumbs))
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            @foreach($breadcrumbs as $crumb)
                @if($loop->last)
                    <li class="breadcrumb-item active">{{ $crumb['label'] }}</li>
                @else
                    <li class="breadcrumb-item">
                        <a href="{{ route($crumb['route']) }}">{{ $crumb['label'] }}</a>
                    </li>
                @endif
            @endforeach
        </ol>
    </nav>
@endif
```

### Benefits Over Approach 1
- No `breadcrumbs.php` file needed in any package
- No service provider registration needed
- Each page fully controls its own breadcrumbs
- Exactly mirrors the tabs pattern
- Easier to maintain and extend

---

### Folder Structure
```
user-interface/                         ← renders breadcrumbs globally
├── docs/
│   └── breadcrumbs.md
├── routes/
│   └── breadcrumbs.php                ← dashboard definitions only
├── resources/
│   └── views/
│       └── layouts/
│           ├── app.blade.php          ← renders breadcrumbs automatically
│           └── common/
│               └── breadcrumbs.blade.php  ← breadcrumb component (Approach 2)
│
smart-messenger/                        ← defines its own breadcrumbs
├── routes/
│   └── breadcrumbs.php                ← (Approach 1 only)
├── src/
│   └── SmartMessengerServiceProvider.php
│
organisation/                           ← defines its own breadcrumbs
├── routes/
│   └── breadcrumbs.php                ← (Approach 1 only)
├── src/
│   └── OrganisationServiceProvider.php
│
integration/                            ← defines its own breadcrumbs
├── routes/
│   └── breadcrumbs.php                ← (Approach 1 only)
├── src/
│   └── IntegrationServiceProvider.php
```

### Key Files
- `user-interface/resources/views/layouts/app.blade.php` — renders breadcrumbs globally
- `user-interface/routes/breadcrumbs.php` — dashboard definitions
- `{package}/routes/breadcrumbs.php` — each package's own breadcrumb definitions (Approach 1)
- `user-interface/resources/views/layouts/common/breadcrumbs.blade.php` — breadcrumb component (Approach 2)

### Notes
- Always define parent breadcrumb before child
- Breadcrumb bar hides automatically if no definition exists for the current route
- All breadcrumbs should trace back to `dashboard` as the root
- Dynamic routes should pass the model or ID as a parameter
- Both approaches are valid depending on the use case.
    - Approach 1 is more structured and aligns with package-based architecture
    - Approach 2 is more flexible and closely mirrors the tabs pattern
- This ensures breadcrumbs can scale across all modules while maintaining consistency in the user experience.