declare module '@woocommerce/woocommerce-rest-api' {
  interface WooCommerceRestApiOptions {
    url: string;
    consumerKey: string;
    consumerSecret: string;
    version: string;
  }

  interface WooCommerceRestApiResponse {
    data: unknown;
    status: number;
  }

  class WooCommerceRestApi {
    constructor(options: WooCommerceRestApiOptions);
    get(endpoint: string, params?: object): Promise<WooCommerceRestApiResponse>;
    post(endpoint: string, data: object): Promise<WooCommerceRestApiResponse>;
    put(endpoint: string, data: object): Promise<WooCommerceRestApiResponse>;
    delete(endpoint: string): Promise<WooCommerceRestApiResponse>;
  }

  export default WooCommerceRestApi;
}