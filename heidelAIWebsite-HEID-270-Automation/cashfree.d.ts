// cashfree.d.ts
declare module '@cashfreepayments/cashfree-js' {
    export function load(options: { mode: "sandbox" | "production" }): Promise<Cashfree>;

    interface Cashfree {
        subscriptionsCheckout: (options: {
            subsSessionId: string;
            redirectTarget: "_modal" | "_self" | "_blank";
        }) => Promise<CheckoutResult>;
    }

    interface CheckoutResult {
        error?: {
            message: string;
            code: string;
        };
        redirect?: boolean;
        paymentDetails?: {
            paymentMessage: string;
            // Add other properties you expect from the payment details here
        };
    }
}