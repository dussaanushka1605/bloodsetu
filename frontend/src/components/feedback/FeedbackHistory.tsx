import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Feedback {
  _id: string;
  description: string;
  status: 'pending' | 'responded';
  createdAt: string;
  updatedAt: string;
}

const FeedbackHistory: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      if (!user || !user.token) {
        toast.error('You must be logged in to view feedback history');
        setLoading(false);
        return;
      }

      console.log('Fetching feedback history with token:', user.token.substring(0, 10) + '...');
      console.log('User role:', user.role);
      console.log('User ID:', user._id);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/feedback/history`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      console.log('Feedback history response:', response.data);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      toast.error('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('FeedbackHistory useEffect triggered with user:', user ? `${user.role} (${user._id})` : 'no user');
    if (user?.token) {
      fetchFeedbacks();
    }
  }, [user]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Feedback History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-1/4 mt-2" />
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
        <CardTitle>Feedback History</CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-700">{feedback.description}</p>
                  <Badge
                    className={feedback.status === 'responded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {feedback.status === 'responded' ? 'Responded' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Submitted {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            You haven't submitted any feedback yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackHistory;