<!DOCTYPE html>
<html>
<head>
    <title>App</title>
    <!-- FontAwesome CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Bootstrap CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <!-- DataTables CSS -->
    <link href="https://cdn.datatables.net/v/bs5/jq-3.7.0/moment-2.29.4/jszip-3.10.1/dt-2.2.2/af-2.7.0/b-3.2.2/b-colvis-3.2.2/b-html5-3.2.2/b-print-3.2.2/cr-2.0.4/date-1.5.5/fc-5.0.4/fh-4.0.1/kt-2.12.1/r-3.0.4/rg-1.5.1/rr-1.5.0/sc-2.4.3/sb-1.8.2/sp-2.3.3/sl-3.0.0/sr-1.4.1/datatables.min.css" rel="stylesheet" integrity="sha384-wYf859STWTPggciSnTIDCGMabsgGXnODSCOXsmSXYvBU+qa7uYQjrZCTi9/jyzAD" crossorigin="anonymous">
    <link rel="stylesheet" href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl() }}">
    @stack('styles')
</head>
<body>
    @include('userinterface::layouts.header')
    <div class="container-fluid" style="min-height: calc(100vh - 65px);">
        <!-- Sidebar -->
        @include('userinterface::layouts.sidebar')
        <!-- Main Content -->
        <main class="main-content bg- squeeze" id="mainContent">
                <!-- Session Status -->
                @if (session('status'))
                    <div class="alert alert-info m-0 mt-3 p-2 w-100" role="alert">
                        {{ session('status') }}
                    </div>
                    @endif
                    @if(session('success'))
                    <div class="alert alert-success m-0 mt-3 p-2 w-100" role="alert">
                        {{ session('success') }}
                    </div>
                    @endif
                    @if (session('error'))
                    <div class="alert alert-danger m-0 mt-3 p-2 w-100" role="alert">
                        {{ session('error') }}
                    </div>
                @endif
                @yield('content')
        </main>
    </div>
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>

    <!-- Bootstrap 5 JS (includes Popper.js) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>

    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/v/bs5/jq-3.7.0/moment-2.29.4/jszip-3.10.1/dt-2.2.2/af-2.7.0/b-3.2.2/b-colvis-3.2.2/b-html5-3.2.2/b-print-3.2.2/cr-2.0.4/date-1.5.5/fc-5.0.4/fh-4.0.1/kt-2.12.1/r-3.0.4/rg-1.5.1/rr-1.5.0/sc-2.4.3/sb-1.8.2/sp-2.3.3/sl-3.0.0/sr-1.4.1/datatables.min.js" integrity="sha384-pdpncyjMFzkxj3N8+5wWQGxGZCFzkWFpInHw4/e5Eg98sIg19W5HYwuEocBQGTtO" crossorigin="anonymous"></script>

    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl() }}"></script>
    @stack('scripts')
</body>
</html>