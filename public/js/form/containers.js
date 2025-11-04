const DEFAULT_PLACEHOLDER_ANIMATION = 'placeholder-glow'
// const DEFAULT_PLACEHOLDER_ANIMATION = 'placeholder-wave'

class CardProvider {
    constructor(placeholder) {
        this.card = document.createElement('div');
        this.card.id = "gen-card-" + Date.now()
        this.card.classList.add(...['card', 'bg-light', 'border-0']);
        if (placeholder) {
            this.card.placeholder = placeholder
            this.card.classList.add(...[placeholder.animation || DEFAULT_PLACEHOLDER_ANIMATION]);
        }
    }

    getCardHeader() {
        const cardHeader = document.createElement('div');
        cardHeader.id = this.card.id + "-header"
        cardHeader.classList.add(...['card-header', 'bg-light', 'border-0']);
        this.card.appendChild(cardHeader);
        return cardHeader;
    }

    getCardBody() {
        const cardBody = document.createElement('div');
        cardBody.id = this.card.id + "-body"
        cardBody.classList.add('card-body');
        this.card.appendChild(cardBody);
        return cardBody;
    }

    getCardFooter() {
        const cardFooter = document.createElement('div');
        cardFooter.id = this.card.id + "-footer"
        cardFooter.classList.add(...['card-footer', 'bg-light', 'border-0']);
        this.card.appendChild(cardFooter);
        return cardFooter;
    }

    getCard() {
        return this.card;
    }
}