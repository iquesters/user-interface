<div class="d-flex align-items-start">
    <div class="me-3 position-relative">
        <div
            id="profileAvatar-container"
            class="d-flex align-items-center justify-content-center overflow-hidden rounded-circle bg-light border"
            style="width: 40px; aspect-ratio: 1 / 1;"
        >
            __LAB_AVATAR_BLOCK__
        </div>
    </div>

    <div class="text-start overflow-hidden">
        <h6 class="mb-1 fw-semibold text-truncate">__LAB_NAME__</h6>
        __LAB_EMAIL_BLOCK__
    </div>
</div>
<script type="application/json" data-component-bindings>
{
    "__LAB_NAME__": {
        "type": "text",
        "paths": ["name", "full_name", "display_name", "username", "user.name", "detail_summary.user_name", "meta:name", "meta:full_name"],
        "fallback": "Unknown User"
    },
    "__LAB_EMAIL_BLOCK__": {
        "type": "template",
        "fields": {
            "value": {
                "paths": ["email", "user.email", "meta:email", "meta:user_email"]
            }
        },
        "condition": "value",
        "template": "<small class=\"d-block mb-0 text-muted text-truncate\">__VALUE__</small>",
        "fallback_template": "<small class=\"d-block mb-0 text-muted\">No email available</small>"
    },
    "__LAB_AVATAR_BLOCK__": {
        "type": "template",
        "fields": {
            "src": {
                "paths": ["profile_image", "profile_photo", "avatar", "image", "photo", "user.profile_image", "user.avatar", "meta:profile_image", "meta:profile_photo", "meta:avatar", "meta:image", "meta:photo"],
                "transform": "asset_url"
            },
            "alt": {
                "paths": ["name", "full_name", "display_name", "username", "user.name", "detail_summary.user_name", "meta:name", "meta:full_name"],
                "fallback": "Unknown User"
            },
            "initials": {
                "paths": ["name", "full_name", "display_name", "username", "user.name", "detail_summary.user_name", "meta:name", "meta:full_name", "email", "user.email", "meta:email", "meta:user_email"],
                "transform": "initials",
                "fallback": "U"
            }
        },
        "condition": "src",
        "template": "<img id=\"profileAvatar\" src=\"__SRC__\" alt=\"__ALT__\" class=\"img-fluid rounded-circle\" style=\"max-width: 100%; max-height: 100%; object-fit: cover;\" referrerpolicy=\"no-referrer\" data-toggle=\"tooltip\" title=\"__ALT__\">",
        "fallback_template": "<span class=\"fw-semibold text-secondary small\">__INITIALS__</span>"
    }
}
</script>
