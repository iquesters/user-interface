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

Settings are stored in the database (not a config file or `.env`).
See [docs/configuration.md](docs/configuration.md) for every key.

---