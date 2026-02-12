"use client"

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'

type TeamMember = {
  email: string;
  role: string;
  department: string;
}

const InviteTeam: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: '', role: 'Agent', department: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { inviteTeamMembers } = useAuth();
  const router = useRouter()

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { email: '', role: 'Agent', department: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = [...teamMembers];
    updatedMembers.splice(index, 1);
    setTeamMembers(updatedMembers);
  };

  const handleInputChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
  
    const validMembers = teamMembers.filter(member => member.email.trim() !== '');
  
    if (validMembers.length === 0) {
      setError('Please add at least one team member with a valid email');
      setLoading(false);
      return;
    }
  
    try {
      // Pass emails array instead of full objects
      const emails = validMembers.map(member => member.email);
      const result = await inviteTeamMembers(emails);
  
      if (result.success) {
        setSuccess(`Successfully sent ${validMembers.length} invitation${validMembers.length > 1 ? 's' : ''}`);
        setTeamMembers([{ email: '', role: 'Agent', department: '' }]);
      } else {
        setError(result.error || 'Failed to send invitations');
      }
    } catch (err) {
      setError('Failed to send invitations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSkip = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Invite Your Team
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Invite team members to collaborate with you
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 items-end">
                <div className="w-full md:w-2/5">
                  <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id={`email-${index}`}
                    type="email"
                    value={member.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="w-full md:w-1/5">
                  <label htmlFor={`role-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id={`role-${index}`}
                    value={member.role}
                    onChange={(e) => handleInputChange(index, 'role', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  >
                    <option value="Agent">Agent</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                
                <div className="w-full md:w-1/3">
                  <label htmlFor={`department-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    id={`department-${index}`}
                    type="text"
                    value={member.department}
                    onChange={(e) => handleInputChange(index, 'department', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Support"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                  disabled={teamMembers.length === 1}
                >
                  <span className="sr-only">Remove</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Skip for Now
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Sending Invitations...' : 'Send Invitations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteTeam;
