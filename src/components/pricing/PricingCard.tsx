import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { Product } from '@/stripe-config';

interface PricingCardProps {
  product: Product;
  isLoading: boolean;
  onPurchase: (priceId: string, mode: 'payment' | 'subscription') => void;
  isCurrentPlan?: boolean;
}

const PricingCard = ({ product, isLoading, onPurchase, isCurrentPlan }: PricingCardProps) => {
  const handlePurchase = () => {
    onPurchase(product.priceId, product.mode);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency,
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <Card className={`relative ${isCurrentPlan ? 'border-primary shadow-lg' : ''}`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <div className="text-3xl font-bold mt-2">
          {formatPrice(product.price)}
          {product.mode === 'subscription' && product.interval && (
            <span className="text-lg font-normal text-muted-foreground">/{product.interval}</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handlePurchase}
          disabled={isLoading || isCurrentPlan}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            `Get ${product.name}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;