<!DOCTYPE html>
<html>
<head>
    <title>Forms</title>
    <!-- FontAwesome CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Bootstrap CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">

    <!-- JSON Editor CSS -->
    <link href="https://cdn.jsdelivr.net/npm/jsoneditor@10.1.0/dist/jsoneditor.min.css" rel="stylesheet">
    
    @stack('styles')
</head>
<body>
    <div class="container-fluid" style="min-height: calc(100vh - 65px);">
        <!-- Main Content -->
        <main class="main-content squeeze" id="mainContent">
            @if (session('status'))
            <div class="alert alert-info m-0 mt-3 p-2" role="alert">
                {{ session('status') }}
            </div>
            @endif
            @if(session('success'))
            <div class="alert alert-success m-0 mt-3 p-2" role="alert">
                {{ session('success') }}
            </div>
            @endif
            @if (session('error'))
            <div class="alert alert-danger m-0 mt-3 p-2" role="alert">
                {{ session('error') }}
            </div>
            @endif
            @yield('content')
        </main>
    </div>
    <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>

    <!-- JSON Editor -->
    <script src="https://cdn.jsdelivr.net/npm/jsoneditor@10.1.0/dist/jsoneditor.min.js"></script>

    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('formValidation/form-constant.js') }}"></script>
    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('formValidation/customValidationMessage.js') }}"></script>
    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('formValidation/input-field-validation.js') }}"></script>
    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('formValidation/textarea-validation.js') }}"></script>
    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('formValidation/select-validation.js') }}"></script>
    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('formValidation/datalist-validation.js') }}"></script>
    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('scripts/form.js') }}"></script>
    <script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('scripts/containers.js') }}"></script>
    
    @stack('scripts')
</body>
</html>