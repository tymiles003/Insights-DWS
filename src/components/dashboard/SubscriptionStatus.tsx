import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { products } from '@/stripe-config';

const SubscriptionStatus = () => {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!subscription || !subscription.subscription_status || subscription.subscription_status === 'not_started') {
    return (
      <Badge variant="outline" className="text-gray-600">
        Free Plan
      </Badge>
    );
  }

  const currentProduct = products.find(p => p.priceId === subscription.price_id);
  const planName = currentProduct?.name || 'Premium';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColor(subscription.subscription_status)}>
      {planName}
    </Badge>
  );
};

export default SubscriptionStatus;