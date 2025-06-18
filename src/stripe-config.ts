export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const products: Product[] = [
  {
    id: 'prod_SWRR0pbT3kFjQB',
    priceId: 'price_1RbOY8Rq6DMs2oQE5wBveHlE',
    name: 'Gold',
    description: 'Gold Package',
    mode: 'subscription',
  },
];