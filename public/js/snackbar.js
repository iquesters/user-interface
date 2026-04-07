;(function (global) {
    const CONTAINER_ID = 'labSnackbar'
    const LIGHT_VARIANT_CLASS_MAP = {
        success: {
            bgClass: 'bg-white',
            textClass: 'text-success',
            borderClass: 'border border-success-subtle',
            closeButtonClass: '',
        },
        error: {
            bgClass: 'bg-white',
            textClass: 'text-danger',
            borderClass: 'border border-danger-subtle',
            closeButtonClass: '',
        },
        warning: {
            bgClass: 'bg-white',
            textClass: 'text-warning-emphasis',
            borderClass: 'border border-warning-subtle',
            closeButtonClass: '',
        },
        info: {
            bgClass: 'bg-white',
            textClass: 'text-primary',
            borderClass: 'border border-primary-subtle',
            closeButtonClass: '',
        },
    }
    const FILLED_VARIANT_CLASS_MAP = {
        success: {
            bgClass: 'text-bg-success',
            textClass: '',
            borderClass: 'border-0',
            closeButtonClass: 'btn-close-white',
        },
        error: {
            bgClass: 'text-bg-danger',
            textClass: '',
            borderClass: 'border-0',
            closeButtonClass: 'btn-close-white',
        },
        warning: {
            bgClass: 'text-bg-warning',
            textClass: 'text-dark',
            borderClass: 'border-0',
            closeButtonClass: '',
        },
        info: {
            bgClass: 'text-bg-primary',
            textClass: '',
            borderClass: 'border-0',
            closeButtonClass: 'btn-close-white',
        },
    }
    const POSITION_CLASS_MAP = {
        'top-right': ['top-0', 'end-0'],
        'top-left': ['top-0', 'start-0'],
        'top-center': ['top-0', 'start-50', 'translate-middle-x'],
        'bottom-right': ['bottom-0', 'end-0'],
        'bottom-left': ['bottom-0', 'start-0'],
        'bottom-center': ['bottom-0', 'start-50', 'translate-middle-x'],
    }
    const POSITION_STYLE_MAP = {
        'top-right': { top: '0', right: '0', bottom: 'auto', left: 'auto', transform: 'none' },
        'top-left': { top: '0', right: 'auto', bottom: 'auto', left: '0', transform: 'none' },
        'top-center': { top: '0', right: 'auto', bottom: 'auto', left: '50%', transform: 'translateX(-50%)' },
        'bottom-right': { top: 'auto', right: '0', bottom: '0', left: 'auto', transform: 'none' },
        'bottom-left': { top: 'auto', right: 'auto', bottom: '0', left: '0', transform: 'none' },
        'bottom-center': { top: 'auto', right: 'auto', bottom: '0', left: '50%', transform: 'translateX(-50%)' },
    }

    function getConfig() {
        const defaults = {
            position: 'bottom-right',
            duration: 3000,
            stackMode: 'stack',
            maxVisible: 4,
            allowDismiss: true,
            variant: 'light',
            bgClass: '',
            textClass: '',
            borderClass: '',
            shadowClass: 'shadow',
            toastClass: '',
            bodyClass: '',
            closeButtonClass: '',
        }
        const moduleConfig = global.USER_INTERFACE_CONFIG?.snackbar || {}
        const legacyConfig = global.UI_SNACKBAR_CONFIG || {}

        return {
            ...defaults,
            ...moduleConfig,
            ...legacyConfig,
        }
    }

    function normalizePosition(position) {
        const supportedPositions = Object.keys(POSITION_CLASS_MAP)

        if (supportedPositions.includes(position)) {
            return position
        }

        switch (position) {
            case 'top':
            case 'right':
                return 'top-right'
            case 'bottom':
                return 'bottom-right'
            case 'left':
                return 'top-left'
            default:
                return 'bottom-right'
        }
    }

    function buildToastClasses(type, conf) {
        const variantMap = conf.variant === 'filled'
            ? FILLED_VARIANT_CLASS_MAP
            : LIGHT_VARIANT_CLASS_MAP
        const preset = variantMap[type] || variantMap.info

        return {
            bgClass: conf.bgClass || preset.bgClass || '',
            textClass: conf.textClass || preset.textClass || '',
            borderClass: conf.borderClass || preset.borderClass || '',
            shadowClass: conf.shadowClass || 'shadow',
            toastClass: conf.toastClass || '',
            bodyClass: conf.bodyClass || '',
            closeButtonClass: conf.closeButtonClass || preset.closeButtonClass || '',
        }
    }

    function getContainer(position = 'top') {
        let container = document.getElementById(CONTAINER_ID)
        const normalizedPosition = normalizePosition(position)
        const positionStyles = POSITION_STYLE_MAP[normalizedPosition] || POSITION_STYLE_MAP['bottom-right']

        if (!container) {
            container = document.createElement('div')
            container.id = CONTAINER_ID
            container.className = 'toast-container position-fixed p-3'
            container.style.zIndex = '1080'
            document.body.appendChild(container)
        }

        container.classList.remove(
            'top-0',
            'bottom-0',
            'start-0',
            'start-50',
            'end-0',
            'translate-middle-x'
        )
        container.classList.add(...POSITION_CLASS_MAP[normalizedPosition])
        container.style.top = positionStyles.top
        container.style.right = positionStyles.right
        container.style.bottom = positionStyles.bottom
        container.style.left = positionStyles.left
        container.style.transform = positionStyles.transform

        return container
    }

    function removeToast(toastEl) {
        const container = toastEl.parentElement
        toastEl.remove()

        if (container && !container.childElementCount) {
            container.innerHTML = ''
        }
    }

    function showSnackbar(message, type = 'info', options = {}) {
        const conf = getConfig()
        const text = message || (type === 'error' ? 'Something went wrong.' : 'Action completed successfully.')
        const position = normalizePosition(options.position || conf.position)
        const delay = options.duration || conf.duration
        const stackMode = options.stackMode || conf.stackMode
        const maxVisible = Number(options.maxVisible || conf.maxVisible || 4)
        const allowDismiss = typeof options.allowDismiss === 'boolean' ? options.allowDismiss : conf.allowDismiss
        const container = getContainer(position)
        const toastEl = document.createElement('div')
        const classes = buildToastClasses(type, conf)

        if (stackMode === 'replace') {
            Array.from(container.children).forEach(removeToast)
        }

        toastEl.className = [
            'toast',
            'align-items-center',
            classes.bgClass,
            classes.textClass,
            classes.borderClass,
            classes.shadowClass,
            classes.toastClass,
        ].filter(Boolean).join(' ')
        toastEl.setAttribute('role', 'status')
        toastEl.setAttribute('aria-live', 'polite')
        toastEl.setAttribute('aria-atomic', 'true')

        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body ${classes.bodyClass}">${text}</div>
                ${allowDismiss ? `<button type="button" class="btn-close ${classes.closeButtonClass} me-2 m-auto" aria-label="Close"></button>` : ''}
            </div>
        `

        container.appendChild(toastEl)

        while (container.childElementCount > maxVisible) {
            removeToast(container.firstElementChild)
        }

        const closeBtn = toastEl.querySelector('.btn-close')
        closeBtn?.addEventListener('click', () => {
            if (global.bootstrap?.Toast) {
                global.bootstrap.Toast.getInstance(toastEl)?.hide()
            } else {
                removeToast(toastEl)
            }
        })

        if (global.bootstrap?.Toast) {
            const toast = new global.bootstrap.Toast(toastEl, {
                autohide: true,
                delay,
            })

            toastEl.addEventListener('hidden.bs.toast', () => removeToast(toastEl), { once: true })
            toast.show()
            return
        }

        toastEl.classList.add('show')
        window.setTimeout(() => removeToast(toastEl), delay)
    }

    global.showSnackbar = showSnackbar
})(window)
