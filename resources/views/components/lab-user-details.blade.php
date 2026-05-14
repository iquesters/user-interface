<div class="card border-0 shadow-sm">
    <div class="card-body p-3 p-lg-4">
        <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-4">
            <div
                class="d-flex align-items-center justify-content-center overflow-hidden rounded-circle bg-light border flex-shrink-0"
                style="width: 72px; height: 72px;"
            >
                __LAB_AVATAR_BLOCK__
            </div>

            <div class="min-w-0">
                <h4 class="mb-1 fw-semibold text-break">__LAB_NAME__</h4>
                __LAB_ROLE_BLOCK__
                __LAB_EMAIL_BLOCK__
                __LAB_STATUS_BLOCK__
            </div>
        </div>

        <div class="d-flex flex-column gap-2">
            __LAB_INFO_ROWS__
        </div>
    </div>
</div>
<script type="application/json" data-component-bindings>
{
    "__LAB_NAME__": {
        "type": "text",
        "paths": ["name", "full_name", "display_name", "username", "user.name", "detail_summary.user_name", "meta:name", "meta:full_name"],
        "fallback": "Unknown User"
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
        "template": "<img src=\"__SRC__\" alt=\"__ALT__\" class=\"img-fluid rounded-circle\" style=\"width: 100%; height: 100%; object-fit: cover;\" referrerpolicy=\"no-referrer\">",
        "fallback_template": "<span class=\"fw-semibold text-secondary fs-5\">__INITIALS__</span>"
    },
    "__LAB_ROLE_BLOCK__": {
        "type": "template",
        "fields": {
            "value": {
                "paths": ["role", "designation", "title", "user.role", "meta:role", "meta:designation", "meta:title"]
            }
        },
        "condition": "value",
        "template": "<div class=\"text-muted mb-1\">__VALUE__</div>",
        "fallback_template": ""
    },
    "__LAB_EMAIL_BLOCK__": {
        "type": "template",
        "fields": {
            "value": {
                "paths": ["email", "user.email", "meta:email", "meta:user_email"]
            }
        },
        "condition": "value",
        "template": "<div class=\"small text-muted text-break\">__VALUE__</div>",
        "fallback_template": ""
    },
    "__LAB_STATUS_BLOCK__": {
        "type": "template",
        "fields": {
            "value": {
                "paths": ["status", "user.status", "meta:status"]
            }
        },
        "condition": "value",
        "template": "<span class=\"badge text-bg-light border mt-2\">__VALUE__</span>",
        "fallback_template": ""
    },
    "__LAB_INFO_ROWS__": {
        "type": "key_value_rows",
        "rows": [
            { "label": "Email", "paths": ["email", "user.email", "meta:email", "meta:user_email"] },
            { "label": "Phone", "paths": ["phone", "mobile", "phone_number", "user.phone", "meta:phone", "meta:mobile"] },
            { "label": "Role", "paths": ["role", "designation", "title", "user.role", "meta:role", "meta:designation", "meta:title"] },
            { "label": "Status", "paths": ["status", "user.status", "meta:status"] },
            { "label": "User ID", "paths": ["uid", "id"] },
            { "label": "Registered At", "paths": ["registered_at", "created_at", "detail_summary.display_datetime", "meta:registered_at", "meta:created_at"] },
            { "label": "Login IP", "paths": ["login_ip_address", "meta:login_ip_address", "meta:login_ip"] },
            { "label": "Updated By", "paths": ["updater.name", "updatedBy.name", "updated_by_user.name", "updated_by_name", "creator.name", "createdBy.name", "created_by_user.name", "created_by_name", "detail_summary.user_name"] },
            { "label": "Updated At", "paths": ["updated_at", "updatedAt", "created_at", "createdAt", "detail_summary.display_datetime"] }
        ],
        "row_template": "<div class=\"d-flex flex-column flex-sm-row gap-1 gap-sm-3 py-1 border-bottom border-light-subtle\"><div class=\"text-muted fw-semibold\" style=\"min-width: 140px;\">__LABEL__</div><div class=\"text-break\">__VALUE__</div></div>",
        "fallback_template": "<div class=\"text-center text-muted py-4\">No user details available.</div>"
    }
}
</script>
