import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStripe } from '@/hooks/useStripe';
import { useSubscription } from '@/hooks/useSubscription';
import { products } from '@/stripe-config';
import PricingCard from '@/components/pricing/PricingCard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Pricing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createCheckoutSession, isLoading } = useStripe();
  const { subscription } = useSubscription();

  const handlePurchase = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    await createCheckoutSession(priceId, mode);
  };

  const getCurrentPlan = () => {
    if (!subscription?.price_id) return null;
    return products.find(product => product.priceId === subscription.price_id);
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upgrade to unlock premium features and get the most out of InsightsDWS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => (
            <PricingCard
              key={product.id}
              product={product}
              isLoading={isLoading}
              onPurchase={handlePurchase}
              isCurrentPlan={currentPlan?.id === product.id}
            />
          ))}
        </div>

        {subscription && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Your Subscription</h2>
            <Card className="max-w-2xl mx-auto p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Plan</span>
                  <span className="font-medium">{currentPlan?.name || 'Free'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`capitalize font-medium ${subscription.subscription_status === 'active' ? 'text-green-600' : subscription.subscription_status === 'past_due' ? 'text-amber-600' : ''}`}>
                    {subscription.subscription_status}
                  </span>
                </div>
                
                {subscription.current_period_end && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {subscription.cancel_at_period_end ? 'Expires on' : 'Next billing date'}
                    </span>
                    <span className="font-medium">
                      {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {subscription.payment_method_brand && subscription.payment_method_last4 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="font-medium capitalize">
                      {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                    </span>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => window.open('https://dashboard.stripe.com/billing/portal', '_blank')}>
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pricing;