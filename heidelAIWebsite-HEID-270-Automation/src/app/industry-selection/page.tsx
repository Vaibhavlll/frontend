"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


const industries = [
  'Alcohol',
  'Animals',
  'Arts & Crafts',
  'Cosmetics & Beauty',
  'Electronics',
  'Entertainment & Toys',
  'Fashion',
  'Food',
  'Health',
  'Household & Stationary',
  'Jewellery',
  'Living & Family',
  'Services & Workshops',
  'Sport',
  'Work Utilities',
  'Other'
];

const IndustrySelection: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { userDetails } = useAuth();
  const router = useRouter()
  
  const handleContinue = async () => {
    if (!selectedIndustry) {
      setError('Please select an industry');
      return;
    }
    
    if (!userDetails) {
      setError('User details not found');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update the company with the selected industry
      const { error: updateError } = await supabase
        .from('companies')
        .update({ industry: selectedIndustry })
        .eq('id', userDetails.company_id);
        
      if (updateError) throw updateError;
      
      // Navigate to the next step
      router.push('/domain-connection');
    } catch (err) {
      console.error(err);
      setError('Failed to save industry selection');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header with progress */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-medium text-gray-900">Choose shop system</h2>
                <p className="text-sm text-gray-500">What is the system of your store</p>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center">Select your industry</h1>
            <p className="mt-2 text-gray-600 text-center">This help us give you more relevant recommendations</p>
            
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {industries.map((industry) => (
                <div 
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`
                    border rounded-md p-4 flex items-center cursor-pointer hover:border-blue-500
                    ${selectedIndustry === industry ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}
                  `}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      checked={selectedIndustry === industry}
                      onChange={() => setSelectedIndustry(industry)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">{industry}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer with buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/company-info')}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrySelection;
