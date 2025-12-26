<?php

use Illuminate\Support\Str;

$uuid = Str::uuid();

$last_activity = isset($options->last_activity) ? $options->last_activity : time();

// $is_mobile = str_contains($options?->user_agent, 'Mobi')
?>
<div class="d-none">
    {{ json_encode($options) }}
</div>
<div class="card border-0 mb-3">
    <div class="card-body">
        <div class="row row-cols-1 g-2">
            <div class="col-4 d-flex align-items-start justify-content-end">
                <span id="icon_"></span><i class="fas fa-fw fa-4x fa-laptop"></i>
            </div>
            <div class="col-8">
                <p class="card-text mb-1">Chrome on Windows</p>
                <p class="card-text mb-1"><span class="sz-browser-os"><span class="placeholder-wave placeholder bg-success col-12"></span></span></p>
                <p class="card-text mb-1"><span id="--user-region--"><span class="placeholder-wave placeholder bg-light col-12"></span></span></p>
                <p class="card-text mb-1"><small class="text-body-secondary">Timezone: <span id="--user-tz--"><span class="placeholder-wave placeholder bg-light col-12"></span></span></small></p>
                <p class="card-text mb-1"><small class="text-body-secondary">IP: <span id="--user-ip--"><span class="placeholder-wave placeholder bg-light col-12"></span></span></small></p>
                <p class="card-text mb-1 small"><small class="text-body-secondary">Last accessed at: {{date('d M, Y, h:m:s A', $last_activity)}}</small></p>
                <p class="card-text mb-1 small"><small class="text-body-secondary">$options->user_agent</small></p>
            </div>
        </div>
    </div>
</div>

@pushonce('scripts')
<script>
    fetch('https://ipinfo.io/json')
        .then(response => response.json())
        .then(data => {
            console.log("Your IP information:", data);
            $("#--user-region--").html(data.city + ", " + data.region + ", " + data.country);
            $("#--user-ip--").html(data.ip);
            $("#--user-tz--").html(data.timezone);
        })
        .catch(error => {
            console.error("Error fetching IP information:", error);
        });


    // $.get("https://ipinfo.io/json", function(response) {
    //     $("#--user-ip--").html("IP: " + response.ip);
    //     $("#address").html("Location: " + response.city + ", " + response.region);
    //     $("#details").html(JSON.stringify(response, null, 4));
    // }, "jsonp");

    // Browser detection
    const CHROME_BROWSER_STR = 'Chrome'
    const FIREFOX_BROWSER_STR = 'Firefox'
    const SAFARI_BROWSER_STR = 'Safari'
    const EDGE_BROWSER_STR = 'Edge'
    const OPERA_BROWSER_STR = 'Opera'
    const UNKNOWN_BROWSER_STR = 'Unknown OS'

    function getBrowser(userAgentStr) {
        if (userAgentStr.indexOf('Chrome') !== -1) {
            return CHROME_BROWSER_STR;
        } else if (userAgentStr.indexOf('Firefox') !== -1) {
            return FIREFOX_BROWSER_STR;
        } else if (userAgentStr.indexOf('Safari') !== -1) {
            return SAFARI_BROWSER_STR;
        } else if (userAgentStr.indexOf('Edge') !== -1) {
            return EDGE_BROWSER_STR;
        } else if (userAgentStr.indexOf('Opera') !== -1) {
            return OPERA_BROWSER_STR;
        } else {
            return UNKNOWN_BROWSER_STR;
        }
    }


    // Device detection
    const MOBILE_STR = 'Mobile'
    const DESKTOP_STR = 'Desktop'
    const MOBILE_ICON_CLASSES = 'fas fa-fw fa-4x fa-mobile-screen-button'
    const LAPTOP_ICON_CLASSES = 'fas fa-fw fa-4x fa-laptop'

    function getDevice(userAgentStr) {
        if (userAgentStr.indexOf('Mobile') !== -1 ||
            userAgentStr.indexOf('Android') !== -1 ||
            userAgentStr.indexOf('iPhone') !== -1) {
            return MOBILE_STR;
        } else {
            return DESKTOP_STR;
        }
    }

    function isMobile(userAgentStr) {
        return MOBILE_STR === getDevice(userAgentStr)
    }

    function isDesktop(userAgentStr) {
        return DESKTOP_STR === getDevice(userAgentStr)
    }


    // OS detection
    const WINDOWS_OS_STR = 'Windows'
    const MACOS_OS_STR = 'macOS'
    const LINUX_OS_STR = 'Linux'
    const ANDROID_OS_STR = 'Android'
    const IOS_OS_STR = 'iOS'
    const UNKNOWN_OS_STR = 'Unknown OS'

    function getOperatingSystem() {
        if (userAgent.indexOf('Windows') !== -1) {
            return WINDOWS_OS_STR;
        } else if (userAgent.indexOf('Mac OS X') !== -1) {
            return MACOS_OS_STR;
        } else if (userAgent.indexOf('Linux') !== -1) {
            return LINUX_OS_STR;
        } else if (userAgent.indexOf('Android') !== -1) {
            return ANDROID_OS_STR;
        } else if (userAgent.indexOf('iPhone') !== -1) {
            return IOS_OS_STR;
        } else {
            return UNKNOWN_OS_STR;
        }
    }
</script>
@endpushonce