"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const CompanyInfo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedShopSystem, setSelectedShopSystem] = useState("shopify");
  const [selectedIndustry, setSelectedIndustry] = useState("electronics");
  const [teamSize, setTeamSize] = useState("");
  const [role, setRole] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [router]);

  const steps = [
    {
      id: 1,
      title: "What is your shop system?",
      description: "Choose the system which you are either currently using or plan to use.",
      sidebarLabel: "Choose shop system",
      sidebarDescription: "What is the system of your store",
    },
    {
      id: 2,
      title: "Select your industry",
      description: "This helps us give you more relevant recommendations",
      sidebarLabel: "Provide industry",
      sidebarDescription: "What is your industry of store",
    },
    {
      id: 3,
      title: "Team Information",
      description: "Tell us about your team structure",
      sidebarLabel: "Team Details",
      sidebarDescription: "Team size and your role",
    },
    {
      id: 4,
      title: "How did you find us?",
      description: "Help us improve our outreach",
      sidebarLabel: "Referral Source",
      sidebarDescription: "Where did you hear about us?",
    },
    {
      id: 5,
      title: "Final Step",
      description: "Complete your onboarding",
      sidebarLabel: "Completion",
      sidebarDescription: "Finish setup process",
    },
  ];

  const shopSystems = [
    { id: "magento", name: "Magento", logo: "📦" },
    { id: "shopify", name: "Shopify", logo: "🛒" },
    { id: "shopware5", name: "Shopware 5", logo: "🛍️" },
    { id: "shopware6", name: "Shopware 6", logo: "🛍️" },
    { id: "woocommerce", name: "WooCommerce", logo: "🛒" },
    { id: "other", name: "Other", logo: "⚙️" },
  ];

  const industries = [
    { id: "arts", name: "Arts & Crafts" },
    { id: "cosmetics", name: "Cosmetics & Beauty" },
    { id: "electronics", name: "Electronics" },
    { id: "entertainment", name: "Entertainment & Toys" },
    { id: "fashion", name: "Fashion" },
    { id: "food", name: "Food" },
    { id: "health", name: "Health" },
    { id: "household", name: "Household & Stationary" },
    { id: "jewellery", name: "Jewellery" },
    { id: "services", name: "Services & Workshops" },
    { id: "sport", name: "Sport" },
    { id: "work", name: "Work Utilities" },
    { id: "other", name: "Other" },
  ];

  const teamSizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees",
  ];

  const roles = [
    "CEO/Founder",
    "CTO/Technical Lead",
    "Marketing Manager",
    "Operations Manager",
    "Sales Lead",
    "Other",
  ];

  const referralSources = [
    "Instagram",
    "Facebook",
    "WhatsApp",
    "Website",
    "Google Search",
    "Friend/Colleague",
    "Other",
  ];

  const validateCurrentStep = () => {
    setErrorMessage("");
    switch (currentStep) {
      case 2:
        if (!teamSize || !role) {
          setErrorMessage("Please fill in team size and your role");
          return false;
        }
        break;
      case 3:
        if (!referralSource) {
          setErrorMessage("Please select a referral source");
          return false;
        }
        break;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage("User not authenticated");
      return;
    }

    setSubmitting(true);
    
    try {
      // Perform insertion and immediately navigate
      const { error } = await supabase.from("onboarding").insert({
        user_id: user.id,
        shop_system: selectedShopSystem,
        industry: selectedIndustry,
        team_size: teamSize,
        role: role,
        referral_source: referralSource,
        completed_at: new Date().toISOString()
      });
    
      // Navigate immediately after insertion
      if (!error) {
        router.replace("/dashboard");
      } else {
        console.error("Submission error:", error);
        setErrorMessage(error.message || "Failed to save data. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Submission error:", error);
        setErrorMessage(error.message || "Failed to save data. Please try again.");
      } else {
        console.error("Unknown error:", error);
        setErrorMessage("An unknown error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }    
  };

  const renderShopSystemContent = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopSystems.map((system) => (
          <div
            key={system.id}
            className={`border rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer ${
              selectedShopSystem === system.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedShopSystem(system.id)}
          >
            <div className="text-3xl mb-2">{system.logo}</div>
            <div className="text-center font-medium mb-2 text-gray-700">
              {system.name}
            </div>
            <div>
              <input
                type="radio"
                checked={selectedShopSystem === system.id}
                onChange={() => setSelectedShopSystem(system.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 "
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderIndustryContent = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((industry) => (
          <div
            key={industry.id}
            className={`border rounded-lg p-4 flex items-center cursor-pointer ${
              selectedIndustry === industry.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedIndustry(industry.id)}
          >
            <div className="flex items-center w-full">
              <input
                type="radio"
                checked={selectedIndustry === industry.id}
                onChange={() => setSelectedIndustry(industry.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 mr-3 flex-shrink-0"
              />
              <div className="font-medium text-gray-700">{industry.name}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTeamInfoContent = () => (
    <div className="space-y-5 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Team Size
        </label>
        <select
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          <option value="">Select team size</option>
          {teamSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          <option value="">Select your role</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderReferralContent = () => (
    <div className="max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How did you hear about us?
        </label>
        <select
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          <option value="">Select referral source</option>
          {referralSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderShopSystemContent();
      case 1:
        return renderIndustryContent();
      case 2:
        return renderTeamInfoContent();
      case 3:
        return renderReferralContent();
      default:
        return (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
            <p className="text-gray-600">
              Your onboarding process is now complete.
            </p>
          </div>
        );
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="bg-white min-h-screen">
      <header className="border-b px-6 py-3 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center">
          {/* <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div> */}
          <span className="font-bold text-blue-600 text-xl">On-boarding</span>
        </div>

        <div>
          <button className="flex items-center border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
            <span className="mr-2">🇬🇧</span>
            <span>English</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="w-full bg-gray-100 h-1">
        <div
          className="bg-blue-600 h-1"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-3/4 p-6">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">
                  {steps[currentStep].title}
                </h1>
                <p className="text-gray-600 mb-6">
                  {steps[currentStep].description}
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <div className="mb-8">{renderStepContent()}</div>

                <div className="mt-8 flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className={`py-2 px-4 rounded-lg font-medium ${
                      currentStep === 0
                        ? "invisible"
                        : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Processing..."
                      : currentStep === steps.length - 1
                      ? "Complete"
                      : "Continue"}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/4 bg-gray-50 p-6 border-t md:border-t-0 md:border-l">
              <div className="mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex mb-5">
                    <div className="mr-3 flex flex-col items-center">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center ${
                          index === currentStep
                            ? "bg-blue-600 text-white"
                            : index < currentStep
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index < currentStep ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-8 w-0.5 ${
                            index < currentStep ? "bg-green-500" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`font-medium ${
                          index === currentStep ? "text-blue-600" : "text-gray-900"
                        }`}
                      >
                        {step.sidebarLabel}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {step.sidebarDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-lg border border-gray-200 p-5 bg-white shadow-sm">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-50 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium text-lg mb-2">
                    Having trouble?
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Feel free to contact us and we will always help you through
                    the process.
                  </p>
                  <button className="w-full border border-gray-300 hover:border-gray-400 bg-white text-gray-800 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50">
                    Contact us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
