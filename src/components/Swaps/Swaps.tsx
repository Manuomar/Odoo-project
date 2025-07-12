import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, Star, Trash2, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface SwapRequest {
  _id: string;
  requester: { _id: string; name: string; rating: { average: number; count: number } };
  recipient: { _id: string; name: string; rating: { average: number; count: number } };
  skillOffered: { name: string; level: string };
  skillRequested: { name: string; level: string };
  status: string;
  message?: string;
  meetingDetails?: string;
  createdAt: string;
  feedback?: {
    requesterFeedback?: { rating: number; comment: string; createdAt: string };
    recipientFeedback?: { rating: number; comment: string; createdAt: string };
  };
}

const Swaps: React.FC = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSwap, setSelectedSwap] = useState<SwapRequest | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [meetingDetails, setMeetingDetails] = useState('');

  useEffect(() => {
    fetchSwaps();
  }, [filter]);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await axios.get(`/api/swaps/my-requests?${params}`);
      setSwaps(response.data.swapRequests);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSwapStatus = async (swapId: string, status: string, details?: string) => {
    try {
      const payload: any = { status };
      if (details) payload.meetingDetails = details;

      await axios.put(`/api/swaps/${swapId}/status`, payload);
      fetchSwaps();
      setShowMeetingModal(false);
      setMeetingDetails('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update swap status');
    }
  };

  const deleteSwap = async (swapId: string) => {
    if (!confirm('Are you sure you want to delete this swap request?')) return;

    try {
      await axios.delete(`/api/swaps/${swapId}`);
      fetchSwaps();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete swap request');
    }
  };

  const submitFeedback = async () => {
    if (!selectedSwap) return;

    try {
      await axios.post(`/api/swaps/${selectedSwap._id}/feedback`, feedback);
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '' });
      setSelectedSwap(null);
      fetchSwaps();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <Star className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const canProvideFeedback = (swap: SwapRequest) => {
    if (swap.status !== 'completed') return false;
    
    const isRequester = swap.requester._id === user?._id;
    const isRecipient = swap.recipient._id === user?._id;
    
    if (isRequester && !swap.feedback?.requesterFeedback) return true;
    if (isRecipient && !swap.feedback?.recipientFeedback) return true;
    
    return false;
  };

  const filteredSwaps = swaps.filter(swap => {
    if (filter === 'all') return true;
    return swap.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Skill Swaps</h1>
        <p className="text-gray-600">Manage your skill exchange requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Swaps', count: swaps.length },
              { key: 'pending', label: 'Pending', count: swaps.filter(s => s.status === 'pending').length },
              { key: 'accepted', label: 'Accepted', count: swaps.filter(s => s.status === 'accepted').length },
              { key: 'completed', label: 'Completed', count: swaps.filter(s => s.status === 'completed').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Swaps List */}
      <div className="space-y-6">
        {filteredSwaps.map((swap) => {
          const isRequester = swap.requester._id === user?._id;
          const otherUser = isRequester ? swap.recipient : swap.requester;
          
          return (
            <div key={swap._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{otherUser.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>
                        {otherUser.rating.average || 'New'} 
                        {otherUser.rating.count > 0 && ` (${otherUser.rating.count} reviews)`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(swap.status)}`}>
                    {getStatusIcon(swap.status)}
                    <span className="ml-1 capitalize">{swap.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    {isRequester ? 'You\'re offering' : 'They\'re offering'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-800">{swap.skillOffered.name}</span>
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                      {swap.skillOffered.level}
                    </span>
                  </div>
                </div>

                <div className="bg-teal-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-teal-900 mb-2">
                    {isRequester ? 'You want to learn' : 'They want to learn'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-teal-800">{swap.skillRequested.name}</span>
                    <span className="px-2 py-1 bg-teal-200 text-teal-800 text-xs rounded-full">
                      {swap.skillRequested.level}
                    </span>
                  </div>
                </div>
              </div>

              {swap.message && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
                  <p className="text-gray-600 text-sm">{swap.message}</p>
                </div>
              )}

              {swap.meetingDetails && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-green-700 mb-2">Meeting Details</h4>
                  <p className="text-green-600 text-sm">{swap.meetingDetails}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Created {new Date(swap.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {swap.status === 'pending' && !isRequester && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedSwap(swap);
                        setShowMeetingModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => updateSwapStatus(swap._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {swap.status === 'pending' && isRequester && (
                  <button
                    onClick={() => updateSwapStatus(swap._id, 'cancelled')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel Request
                  </button>
                )}

                {swap.status === 'accepted' && (
                  <button
                    onClick={() => updateSwapStatus(swap._id, 'completed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Mark as Completed</span>
                  </button>
                )}

                {canProvideFeedback(swap) && (
                  <button
                    onClick={() => {
                      setSelectedSwap(swap);
                      setShowFeedbackModal(true);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Leave Feedback</span>
                  </button>
                )}

                {(swap.status === 'pending' || swap.status === 'rejected') && isRequester && (
                  <button
                    onClick={() => deleteSwap(swap._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSwaps.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Start browsing to find skills you want to learn!'
              : `No ${filter} swap requests at the moment.`
            }
          </p>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showMeetingModal && selectedSwap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accept Swap Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Details (Optional)
                </label>
                <textarea
                  value={meetingDetails}
                  onChange={(e) => setMeetingDetails(e.target.value)}
                  placeholder="Suggest a time, place, or platform for your skill exchange..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateSwapStatus(selectedSwap._id, 'accepted', meetingDetails)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSwap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className={`h-8 w-8 ${
                        star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-full w-full fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  placeholder="Share your experience with this skill exchange..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swaps;