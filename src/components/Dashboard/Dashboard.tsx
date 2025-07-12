import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface SwapRequest {
  _id: string;
  requester: { name: string; _id: string };
  recipient: { name: string; _id: string };
  skillOffered: { name: string; level: string };
  skillRequested: { name: string; level: string };
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentSwaps, setRecentSwaps] = useState<SwapRequest[]>([]);
  const [stats, setStats] = useState({
    totalSwaps: 0,
    completedSwaps: 0,
    pendingSwaps: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [swapsResponse] = await Promise.all([
          axios.get('/api/swaps/my-requests?limit=5')
        ]);

        setRecentSwaps(swapsResponse.data.swapRequests);

        // Calculate stats
        const allSwaps = swapsResponse.data.swapRequests;
        setStats({
          totalSwaps: allSwaps.length,
          completedSwaps: allSwaps.filter((swap: SwapRequest) => swap.status === 'completed').length,
          pendingSwaps: allSwaps.filter((swap: SwapRequest) => swap.status === 'pending').length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your skills today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Swaps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingSwaps}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
            <Link
              to="/profile"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit Profile
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h3>
              <div className="flex flex-wrap gap-2">
                {user?.skillsOffered?.length ? (
                  user.skillsOffered.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills added yet</span>
                )}
                {user?.skillsOffered && user.skillsOffered.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    +{user.skillsOffered.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skills Wanted</h3>
              <div className="flex flex-wrap gap-2">
                {user?.skillsWanted?.length ? (
                  user.skillsWanted.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills added yet</span>
                )}
                {user?.skillsWanted && user.skillsWanted.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    +{user.skillsWanted.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">
                {user?.rating?.average ? `${user.rating.average} rating` : 'No ratings yet'} 
                {user?.rating?.count ? ` (${user.rating.count} reviews)` : ''}
              </span>
            </div>
          </div>

          <Link
            to="/browse"
            className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Find Skills to Swap</span>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/swaps"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentSwaps.length ? (
              recentSwaps.map((swap) => (
                <div key={swap._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {swap.requester._id === user?._id 
                          ? swap.recipient.name 
                          : swap.requester.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                        {swap.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{swap.skillOffered.name}</span> for{' '}
                    <span className="font-medium">{swap.skillRequested.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(swap.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No swap requests yet</p>
                <p className="text-sm text-gray-400 mt-1">Start browsing to find skills you want!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;