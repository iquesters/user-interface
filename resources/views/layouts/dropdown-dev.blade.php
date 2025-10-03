<?php

use Illuminate\Support\Facades\Auth;

$user = isset($user) ? $user : null;
$current_org = isset($current_org) ? $current_org : null;
$current_event = isset($current_event) ? $current_event : null;

$APP_DATA = (object)array(
    'user' => $user,
    'current_org' => $current_org,
    'current_event' => $current_event,
);

$data = isset($data) ? $data : null;

$PAGE_DATA = (object)array(
    'data' => $data,
);

?>
<div id="devTool" class="dropdown">
    <button id="devToolToggleEle" class="btn border p-1 d-flex align-items-center" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
        <div class="d-flex align-items-center justify-content-center" style="width:32px;height:32px;">
            <i class="fas fa-fw fa-code"></i>
        </div>
    </button>
    <div id="devToolContent" class="dropdown-menu dropdown-menu-end shadow pt-0" style="width:50vw;" data-bs-popper="static">
        <div class="dropdown-header d-flex align-items-center justify-content-between p-1">
            <!-- <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                <div class="btn-group btn-group-sm me-1" role="group" aria-label="First group">
                    <button type="button" class="btn btn-primary">1</button>
                    <button type="button" class="btn btn-primary">2</button>
                    <button type="button" class="btn btn-primary">3</button>
                    <button type="button" class="btn btn-primary">4</button>
                </div>
                <div class="btn-group btn-group-sm me-1" role="group" aria-label="Second group">
                    <button type="button" class="btn btn-secondary">5</button>
                    <button type="button" class="btn btn-secondary">6</button>
                    <button type="button" class="btn btn-secondary">7</button>
                </div>
                <div class="btn-group btn-group-sm" role="group" aria-label="Third group">
                    <button type="button" class="btn btn-info">8</button>
                </div>
            </div> -->
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="showByDefaultSwitchCheck">
                <label class="form-check-label" for="showByDefaultSwitchCheck">Show by default</label>
            </div>
        </div>
        <hr class="dropdown-divider m-0" />
        <div class="overflow-x-hidden overflow-y-auto pb-1" style="max-height:80vh;">
            <div class="accordion accordion-flush" id="accordionFlushExample">
                @include('userinterface::dev.vardump',['heading'=>"GLOBALS",'var'=>$GLOBALS])
                @include('userinterface::dev.vardump',['heading'=>"_ENV",'var'=>$_ENV])
                @include('userinterface::dev.vardump',['heading'=>"_SERVER",'var'=>$_SERVER])
                @include('userinterface::dev.vardump',['heading'=>"_REQUEST",'var'=>$_REQUEST])
                @include('userinterface::dev.vardump',['heading'=>"_POST",'var'=>$_POST])
                @include('userinterface::dev.vardump',['heading'=>"_GET",'var'=>$_GET])
                @include('userinterface::dev.vardump',['heading'=>"_FILES",'var'=>$_FILES])
                @include('userinterface::dev.vardump',['heading'=>"_COOKIE",'var'=>$_COOKIE])
                @include('userinterface::dev.vardump',['heading'=>"_SESSION",'var'=>session()->all()])
                @include('userinterface::dev.vardump',['heading'=>"Application Data",'var'=>$APP_DATA])
                @include('userinterface::dev.vardump',['heading'=>"Page Data",'var'=>$PAGE_DATA])
                @stack('dev-item')
            </div>
        </div>
    </div>
</div>

@pushonce('scripts')
<script type="text/javascript">
    document.addEventListener('readystatechange', function() {
        if (document.readyState === 'complete') {

            const switchInputEle = document.getElementById('showByDefaultSwitchCheck');
            switchInputEle.addEventListener('change', function(event) {
                localStorage.setItem(event.target.id, event.target.checked);
            })

            let switchInputEleChecked = (localStorage.getItem(switchInputEle.id) == "true")
            let devToolToggleEle = new bootstrap.Dropdown("#devToolToggleEle");
            switchInputEle.checked = switchInputEleChecked
            if (switchInputEleChecked) {
                devToolToggleEle.show()
            } else {
                devToolToggleEle.hide()
            }
        }
    });
</script>
@endpushonce