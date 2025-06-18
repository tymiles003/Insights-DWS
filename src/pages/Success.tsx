import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Success = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: 'Payment Successful!',
      description: 'Thank you for your purchase. Your account has been updated.',
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your account has been updated with your new plan.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              You can now access all premium features of InsightsLM.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/pricing')} 
              className="w-full"
            >
              View Subscription Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;