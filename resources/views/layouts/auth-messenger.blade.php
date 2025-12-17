<!DOCTYPE html>
<html lang="en">
<head>
    @include('userinterface::layouts.common.head', ['isAuth' => true])
</head>
<body class="bg-gray-100">

<main class="min-vh-100 d-flex flex-column">

    {{-- Header / Logo --}}
    <div class="container-fluid px-4 py-2">
        <a href="{{ url('/') }}">
            <img src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl() }}"
                class="img-fluid"
                alt="Logo"
                style="max-width: 100px;">
        </a>
    </div>

    {{-- Center Content --}}
    <div class="container-fluid flex-grow-1 d-flex align-items-center px-4 py-5 py-lg-0">
        <div class="row w-100 justify-content-center align-items-center gy-5 gy-lg-0">

            {{-- Left Content --}}
            <div class="col-lg-6 d-flex justify-content-center">
                <div style="max-width: 480px; width:100%;">

                    <h2 class="fw-semibold mb-3">
                        Ping me to get started
                    </h2>

                    <p class="text-muted mb-4">
                        Open your favorite messenger and send a message to start using your assistant.
                        No signup, no forms — just chat.
                    </p>

                    <div class="card border-0 shadow-sm rounded-4 p-4">
                        <div>
                            <span class="badge badge-active mb-3">
                                Chat-first (recommended)
                            </span>
                        </div>

                        <p class="mb-3">
                            Buzz, ping or message on WhatsApp to start.
                            Other messengers are coming soon.
                        </p>

                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <button class="btn btn-success rounded-pill px-2">
                                <i class="fa-brands fa-fw fa-whatsapp"></i>
                                Message on WhatsApp
                            </button>

                            <button class="btn btn-outline-info rounded-pill px-2 disabled" >
                                <i class="fa-brands fa-fw fa-telegram"></i>
                                Telegram (Coming soon)
                            </button>

                            <button class="btn btn-outline-warning rounded-pill px-2 disabled" >
                                <i class="fa-brands fa-fw fa-whatsapp"></i>
                                Arattai (Coming soon)
                            </button>
                        </div>

                        <p class="small mb-1">
                            More messengers planned.
                        </p>

                        <p class="small mb-0">
                            💡 Tip: Save the number as <strong>“My Assistant”</strong> and just say “Hi”.
                        </p>
                    </div>
                </div>
            </div>

            {{-- Right Content --}}
            <div class="col-lg-6 d-flex justify-content-center">
                <div class="card border-0 shadow-lg rounded-4 p-4"
                     style="max-width: 480px; width:100%;">

                    {{-- Alerts --}}
                    @if (session('status'))
                        <div class="alert alert-info py-2 px-3 mb-3">
                            {{ session('status') }}
                        </div>
                    @endif

                    @if (session('success'))
                        <div class="alert alert-success py-2 px-3 mb-3">
                            {{ session('success') }}
                        </div>
                    @endif

                    @if (session('error'))
                        <div class="alert alert-danger py-2 px-3 mb-3">
                            {{ session('error') }}
                        </div>
                    @endif
                    
                    <div>
                        <span class="badge badge-draft mb-3">
                            Or use classic method
                        </span>
                    </div>

                    {{-- Dynamic Content --}}
                    @yield('content')

                </div>
            </div>

        </div>
    </div>

    {{-- Footer --}}
    <div class="container-fluid">
        @include('userinterface::layouts.footer')
    </div>

</main>

@include('userinterface::layouts.common.js')
</body>
</html>