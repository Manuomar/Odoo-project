import React, { useState } from 'react';
import { Save, Plus, X, MapPin, Clock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Skill {
  name: string;
  level: string;
  description?: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || {
      weekdays: false,
      weekends: false,
      evenings: false,
      mornings: false
    },
    isPublic: user?.isPublic ?? true
  });

  const [newSkillOffered, setNewSkillOffered] = useState({ name: '', level: 'Intermediate', description: '' });
  const [newSkillWanted, setNewSkillWanted] = useState({ name: '', level: 'Intermediate', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUser(formData);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkillOffered = () => {
    if (!newSkillOffered.name.trim()) return;

    setFormData({
      ...formData,
      skillsOffered: [...formData.skillsOffered, { ...newSkillOffered }]
    });
    setNewSkillOffered({ name: '', level: 'Intermediate', description: '' });
  };

  const addSkillWanted = () => {
    if (!newSkillWanted.name.trim()) return;

    setFormData({
      ...formData,
      skillsWanted: [...formData.skillsWanted, { ...newSkillWanted }]
    });
    setNewSkillWanted({ name: '', level: 'Intermediate', description: '' });
  };

  const removeSkillOffered = (index: number) => {
    setFormData({
      ...formData,
      skillsOffered: formData.skillsOffered.filter((_, i) => i !== index)
    });
  };

  const removeSkillWanted = (index: number) => {
    setFormData({
      ...formData,
      skillsWanted: formData.skillsWanted.filter((_, i) => i !== index)
    });
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Settings</h1>
        <p className="text-gray-600">Manage your skills and availability</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isPublic ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center space-x-2">
                {formData.isPublic ? (
                  <Eye className="h-4 w-4 text-blue-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {formData.isPublic ? 'Public Profile' : 'Private Profile'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.isPublic 
                ? 'Other users can find and contact you'
                : 'Your profile is hidden from other users'
              }
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Availability</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'weekdays', label: 'Weekdays' },
              { key: 'weekends', label: 'Weekends' },
              { key: 'mornings', label: 'Mornings' },
              { key: 'evenings', label: 'Evenings' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.availability[key as keyof typeof formData.availability]}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: {
                      ...formData.availability,
                      [key]: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Skills Offered */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills I Can Teach</h2>
          
          {/* Existing Skills */}
          <div className="space-y-3 mb-6">
            {formData.skillsOffered.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-blue-900">{skill.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                      {skill.level}
                    </span>
                  </div>
                  {skill.description && (
                    <p className="text-sm text-blue-700">{skill.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeSkillOffered(index)}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Skill */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkillOffered.name}
                onChange={(e) => setNewSkillOffered({ ...newSkillOffered, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newSkillOffered.level}
                onChange={(e) => setNewSkillOffered({ ...newSkillOffered, level: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={addSkillOffered}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newSkillOffered.description}
              onChange={(e) => setNewSkillOffered({ ...newSkillOffered, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills I Want to Learn</h2>
          
          {/* Existing Skills */}
          <div className="space-y-3 mb-6">
            {formData.skillsWanted.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-teal-900">{skill.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                      {skill.level}
                    </span>
                  </div>
                  {skill.description && (
                    <p className="text-sm text-teal-700">{skill.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeSkillWanted(index)}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Skill */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkillWanted.name}
                onChange={(e) => setNewSkillWanted({ ...newSkillWanted, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newSkillWanted.level}
                onChange={(e) => setNewSkillWanted({ ...newSkillWanted, level: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={addSkillWanted}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newSkillWanted.description}
              onChange={(e) => setNewSkillWanted({ ...newSkillWanted, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;