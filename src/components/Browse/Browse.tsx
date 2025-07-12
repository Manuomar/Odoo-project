import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, MessageSquare, Filter, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  location?: string;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  rating: { average: number; count: number };
  availability: Availability;
}

interface Skill {
  name: string;
  level: string;
  description?: string;
}

interface Availability {
  weekdays: boolean;
  weekends: boolean;
  evenings: boolean;
  mornings: boolean;
}

const Browse: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapForm, setSwapForm] = useState({
    skillOffered: { name: '', level: '' },
    skillRequested: { name: '', level: '' },
    message: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, locationFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('skill', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      
      const response = await axios.get(`/api/users/browse?${params}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = async () => {
    if (!selectedUser) return;

    try {
      await axios.post('/api/swaps', {
        recipientId: selectedUser._id,
        skillOffered: swapForm.skillOffered,
        skillRequested: swapForm.skillRequested,
        message: swapForm.message
      });

      setShowSwapModal(false);
      setSwapForm({
        skillOffered: { name: '', level: '' },
        skillRequested: { name: '', level: '' },
        message: ''
      });
      alert('Swap request sent successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send swap request');
    }
  };

  const getAvailabilityText = (availability: Availability) => {
    const times = [];
    if (availability.mornings) times.push('Mornings');
    if (availability.evenings) times.push('Evenings');
    if (availability.weekdays) times.push('Weekdays');
    if (availability.weekends) times.push('Weekends');
    return times.length ? times.join(', ') : 'Not specified';
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Skills</h1>
        <p className="text-gray-600">Find people with skills you want to learn</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by skill (e.g., JavaScript, Photography)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Filter by location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((browsedUser) => (
          <div key={browsedUser._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{browsedUser.name}</h3>
                {browsedUser.location && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {browsedUser.location}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {browsedUser.rating.average || 'New'}
                  {browsedUser.rating.count > 0 && ` (${browsedUser.rating.count})`}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {browsedUser.skillsOffered.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}
                    >
                      {skill.name}
                    </span>
                  ))}
                  {browsedUser.skillsOffered.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{browsedUser.skillsOffered.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Wanted</h4>
                <div className="flex flex-wrap gap-2">
                  {browsedUser.skillsWanted.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {browsedUser.skillsWanted.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{browsedUser.skillsWanted.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Availability</h4>
                <p className="text-xs text-gray-600">{getAvailabilityText(browsedUser.availability)}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedUser(browsedUser);
                setShowSwapModal(true);
              }}
              className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Request Swap</span>
            </button>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Request Swap with {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill You're Offering
                </label>
                <select
                  value={swapForm.skillOffered.name}
                  onChange={(e) => {
                    const skill = user?.skillsOffered.find(s => s.name === e.target.value);
                    setSwapForm({
                      ...swapForm,
                      skillOffered: skill ? { name: skill.name, level: skill.level } : { name: '', level: '' }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a skill</option>
                  {user?.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill.name}>
                      {skill.name} ({skill.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill You Want
                </label>
                <select
                  value={swapForm.skillRequested.name}
                  onChange={(e) => {
                    const skill = selectedUser.skillsOffered.find(s => s.name === e.target.value);
                    setSwapForm({
                      ...swapForm,
                      skillRequested: skill ? { name: skill.name, level: skill.level } : { name: '', level: '' }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a skill</option>
                  {selectedUser.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill.name}>
                      {skill.name} ({skill.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={swapForm.message}
                  onChange={(e) => setSwapForm({ ...swapForm, message: e.target.value })}
                  placeholder="Introduce yourself and explain what you'd like to learn..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSwapModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSwapRequest}
                disabled={!swapForm.skillOffered.name || !swapForm.skillRequested.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Browse;