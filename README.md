# Laravel User Interface Package – Iquesters <img src="https://avatars.githubusercontent.com/u/7593318?s=200&v=4" alt="Iquesters Logo" width="40" style="vertical-align: middle;"/>

A modern, reusable, and customizable **UI package** for Laravel applications — developed and maintained by **[Iquesters](https://github.com/iquesters)**.

This package provides a unified **layout structure**, **navigation system**, and **interface configuration** for Laravel-based modular applications. It acts as the **front-end foundation** for many Iquesters packages, ensuring a consistent, clean, and responsive user interface.

---

## ⚙️ Purpose

The **User Interface Package** serves as the **visual and layout layer** for Iquesters modules. It includes ready-to-use templates such as headers, sidebars, module tabs, and dropdowns — all styled for scalability and responsiveness.

It allows developers to:

* Maintain consistent design across all Iquesters modules
* Configure layouts and navigation behavior easily
* Integrate seamlessly with other Iquesters packages

---

## 🚀 Installation

1. **Install the package via Composer**

   ```bash
   composer require iquesters/user-interface
   ```

2. **Run the migrations**

   ```bash
   php artisan migrate
   ```

3. **Seed the default UI data**

   ```bash
   php artisan user-interface:seed
   ```

Once installed, the package automatically registers its layout and configuration.

---

## 🎨 Features

* 🧱 **Unified Layout System** — Shared structure for headers, sidebars, and navigation
* ⚙️ **Configurable via .env** — Customize UI behavior without touching code
* 📱 **Responsive Design** — Optimized for both desktop and mobile
* 🔄 **Dynamic Module Tabs** — Automatically handles module navigation
* 🧩 **Integration-Ready** — Works seamlessly with other Iquesters modules

---

## 🔧 How to Configure

The package includes a config file located at `config/userinterface.php`.
You can override any setting using your `.env` file.

### 1. Middleware

Defines which middleware are applied to your application layout.

```env
USERINTERFACE_MIDDLEWARE="web,auth"
```

*Default:* `['web', 'auth']`

---

### 2. Layout Template

Specifies the default Blade layout used as your app’s shell.

```env
USERINTERFACE_LAYOUT_APP="userinterface::layouts.app"
```

You can change this if you have your own layout file.

---

### 3. Logo Configuration

Set your brand logo (URL or path).

```env
USER_MANAGEMENT_LOGO="/images/logo.png"
```

You can use:

* A full URL (e.g., `https://example.com/logo.png`)
* A local path (e.g., `/images/logo.png`)
* A package asset path (e.g., `img/logo.png`)

---

### 4. Navigation Style

Choose your preferred navigation style.

```env
USERINTERFACE_NAV_STYLE=minibar
```

Options:

* `minibar` — vertical left sidebar
* `header` — horizontal module tabs in header

---

### 5. Module Tabs

Set how many modules appear before the rest go into a dropdown.

```env
USERINTERFACE_MODULE_TABS=7
```

---

### 6. Mobile Navigation

Configure how the mobile bottom navigation behaves.

```env
USERINTERFACE_MOBILE_BOTTOM_TABS=4
USERINTERFACE_MOBILE_FEATURED_TAB=null
USERINTERFACE_MOBILE_FEATURED_POSITION=center
```

* `USERINTERFACE_MOBILE_FEATURED_TAB`: Set a featured module (e.g., `dashboard`)
* `USERINTERFACE_MOBILE_FEATURED_POSITION`: `center`, `left`, or `right`

---