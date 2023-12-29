
module.exports = class Stripe {

    constructor() {
        this.stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
        this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    }


    async createCustomer(customerName, email) {
        const customer = await this.stripe.customers.create({
            description: customerName,
            email:email
        });
        return customer;
    }

    async createCard(customerId, cardDetails) {
        const token = await this.stripe.tokens.create({
            card: {
                number: cardDetails.number,
                exp_month: cardDetails.exp_month,
                exp_year: cardDetails.exp_year,
                cvc: cardDetails.cvc,
            },
        });
        const card = await this.stripe.customers.createSource(
            customerId,
            { source: token.id }
        );
        return card;
    }

    async deleteCard(customerId, cardId) {
        const deleted = await this.stripe.customers.deleteSource(
            customerId,
            cardId
        );
        return deleted;
    }

    async makeDefaultCard(customerId, cardId) {
        const customer = await this.stripe.customers.update(
            customerId,
            { default_source: cardId }
        );
        return customer;
    }

    async getAllCards(customerId) {
        const cards = await this.stripe.customers.listSources(
            customerId,
            { object: 'card' }
        );
        return cards;
    }

    async createSubscribtion(customerId, planId) {
        const subscription = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [
                { price: planId },
            ],
        });
      
        return subscription;
    }

    async chargeCard(cardId, amount) {
        const paymentIntent = await this.stripe.charges.create({
            amount: amount,
            currency: 'usd',
            source: cardId,
        });
        return paymentIntent;
    }
}