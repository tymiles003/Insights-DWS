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

  return (
    <Card className={`relative ${isCurrentPlan ? 'border-blue-500 shadow-lg' : ''}`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <div className="text-3xl font-bold">
          $25.00
          {product.mode === 'subscription' && <span className="text-lg font-normal text-gray-600">/month</span>}
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            Premium features
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            Priority support
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            Advanced analytics
          </li>
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