export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
  interval?: 'month' | 'year';
  features: string[];
}

export const products: Product[] = [
  {
    id: 'prod_basic',
    priceId: 'price_basic',
    name: 'Basic',
    description: 'For individual users',
    price: 9.99,
    currency: 'USD',
    mode: 'subscription',
    interval: 'month',
    features: [
      '5 notebooks',
      'Up to 50 sources per notebook',
      'Basic AI features',
      'Email support'
    ]
  },
  {
    id: 'prod_pro',
    priceId: 'price_pro',
    name: 'Professional',
    description: 'For power users',
    price: 19.99,
    currency: 'USD',
    mode: 'subscription',
    interval: 'month',
    features: [
      'Unlimited notebooks',
      'Unlimited sources',
      'Advanced AI features',
      'Priority support',
      'Audio overviews',
      'Organization sharing'
    ]
  },
  {
    id: 'prod_enterprise',
    priceId: 'price_enterprise',
    name: 'Enterprise',
    description: 'For teams and organizations',
    price: 49.99,
    currency: 'USD',
    mode: 'subscription',
    interval: 'month',
    features: [
      'Everything in Professional',
      'Team management',
      'Advanced security',
      'Dedicated support',
      'Custom integrations',
      'SSO authentication'
    ]
  }
];