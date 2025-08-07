import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackResponse {
  _id: string;
  description: string;
  status: 'responded';
  createdAt: string;
  response: {
    text: string;
    timestamp: string;
  };
}

const FeedbackResponses: React.FC = () => {
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchResponses = async () => {
    setLoading(true);
    try {
      if (!user || !user.token) {
        toast.error('You must be logged in to view feedback responses');
        setLoading(false);
        return;
      }

      console.log('Fetching feedback responses with token:', user.token.substring(0, 10) + '...');
      console.log('User role:', user.role);
      console.log('User ID:', user._id);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/feedback/responses`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      console.log('Feedback responses response:', response.data);
      setResponses(response.data);
    } catch (error) {
      console.error('Error fetching feedback responses:', error);
      toast.error('Failed to load feedback responses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('FeedbackResponses useEffect triggered with user:', user ? `${user.role} (${user._id})` : 'no user');
    if (user?.token) {
      fetchResponses();
    }
  }, [user]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Feedback Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="bg-gray-50 p-3 rounded">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-3 w-1/4 mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feedback Responses</CardTitle>
      </CardHeader>
      <CardContent>
        {responses.length > 0 ? (
          <div className="space-y-4">
            {responses.map((item) => (
              <div key={item._id} className="border rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium mb-1">Admin Response:</p>
                  <p className="text-sm">{item.response.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Response received {formatDistanceToNow(new Date(item.response.timestamp), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            You don't have any responses yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackResponses;