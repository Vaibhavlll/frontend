import { PlanId } from "@/components/types/pricingplans";

interface EnterprisePlanProps {
    planId : PlanId;
}

export const EnterprisePlan = ({planId}: EnterprisePlanProps) => {
    return (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Enterprise Plan</h3>
            <p className="text-gray-600 mb-4">
                You are currently on the {planId} Plan. This plan includes basic features and is suitable for small projects or testing purposes.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>Access to basic features</li>
                <li>Limited usage</li>
                <li>Community support</li>
            </ul>
            <p className="text-gray-600">
                To access more advanced features and higher usage limits, consider upgrading to one of our paid plans.
            </p>
        </div>
    );
}