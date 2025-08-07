import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackUser {
  _id: string;
  name: string;
  email: string;
}

interface Feedback {
  _id: string;
  userId: string;
  userType: 'Donor' | 'Hospital';
  description: string;
  status: 'pending' | 'responded';
  createdAt: string;
  user?: FeedbackUser;
  response?: {
    text: string;
    timestamp: string;
  };
}

const AdminFeedbackDashboard: React.FC = () => {
  const [pendingFeedbacks, setPendingFeedbacks] = useState<Feedback[]>([]);
  const [respondedFeedbacks, setRespondedFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      // Fetch pending feedbacks
      const pendingResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/feedback/admin/pending`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      setPendingFeedbacks(pendingResponse.data);

      // Fetch responded feedbacks
      const respondedResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/feedback/admin/responded`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      setRespondedFeedbacks(respondedResponse.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchFeedbacks();
    }
  }, [user]);

  const handleOpenResponseDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText('');
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback) return;
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/feedback/admin/respond/${selectedFeedback._id}`,
        { responseText },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );

      toast.success('Response submitted successfully');
      setResponseDialogOpen(false);
      fetchFeedbacks(); // Refresh the feedbacks list
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feedback Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending">
              Pending Feedbacks
              {pendingFeedbacks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingFeedbacks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="responded">
              Responded Feedbacks
              {respondedFeedbacks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {respondedFeedbacks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-6">Loading pending feedbacks...</div>
            ) : pendingFeedbacks.length > 0 ? (
              <div className="space-y-4">
                {pendingFeedbacks.map((feedback) => (
                  <div key={feedback._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{feedback.userType}</Badge>
                          <span className="text-sm font-medium">
                            {feedback.user?.name || 'Unknown User'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {feedback.user?.email || 'No email available'}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{feedback.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Submitted {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                      </p>
                      <Button size="sm" onClick={() => handleOpenResponseDialog(feedback)}>
                        Respond
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No pending feedbacks found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="responded">
            {loading ? (
              <div className="text-center py-6">Loading responded feedbacks...</div>
            ) : respondedFeedbacks.length > 0 ? (
              <div className="space-y-4">
                {respondedFeedbacks.map((feedback) => (
                  <div key={feedback._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{feedback.userType}</Badge>
                          <span className="text-sm font-medium">
                            {feedback.user?.name || 'Unknown User'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {feedback.user?.email || 'No email available'}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Responded</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{feedback.description}</p>
                    {feedback.response && (
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-sm font-medium mb-1">Response:</p>
                        <p className="text-sm">{feedback.response.text}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Response sent {feedback.response ? formatDistanceToNow(new Date(feedback.response.timestamp), { addSuffix: true }) : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No responded feedbacks found.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium mb-1">Original Feedback:</p>
              <p className="text-sm">{selectedFeedback?.description}</p>
            </div>
            <Textarea
              placeholder="Enter your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResponse} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminFeedbackDashboard;