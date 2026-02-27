import { useOrganization } from "@clerk/nextjs";
import { FreePlan } from "./billing/FreePlan";
import { GrowthPlan } from "./billing/GrowthPlan";
import { EnterprisePlan } from "./billing/EnterprisePlan";
import { PlanId } from "../types/pricingplans";
import ComingSoon from "../shared/ComingSoon";

export const BillingSection = () => {
    const { organization, isLoaded } = useOrganization();

    // Show a loading state while Clerk fetches the organization data
    if (!isLoaded) return <div>Loading...</div>;

    // Extract the planId, defaulting to 'free' if it hasn't been set yet
    const planId: PlanId = organization?.publicMetadata?.plan_id as PlanId || 'free';

    const growthPlans = ['growth_monthly_inr', 'growth_yearly_inr'];
    const enterprisePlans = ['enterprise_monthly_inr', 'enterprise_yearly_inr'];

    return (
        // <div className="min-h-[300px] flex flex-col items-start p-4 md:p-8">
            // {/* <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Billing</h2> */}
            
            // {/* {planId === 'free' && <FreePlan planId={planId} />}
            // {growthPlans.includes(planId) && <GrowthPlan planId={planId} />}
            // {enterprisePlans.includes(planId) && <EnterprisePlan planId={planId} />} */}

            <ComingSoon
                description="View and manage your billing information. In development coming soon!"
            />

        // </div>
    );
}