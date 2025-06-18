import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStripe } from '@/hooks/useStripe';
import { useSubscription } from '@/hooks/useSubscription';
import { products } from '@/stripe-config';
import PricingCard from '@/components/pricing/PricingCard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Upgrade to unlock premium features and get the most out of InsightsLM
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">Current Subscription</h3>
              <p className="text-gray-600 mb-2">
                Status: <span className="capitalize font-medium">{subscription.subscription_status}</span>
              </p>
              {subscription.current_period_end && (
                <p className="text-gray-600">
                  {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on:{' '}
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pricing;