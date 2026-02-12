/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { auth, clerkClient } from "@clerk/nextjs/server";
import { onboardingSchema } from "@/lib/schemas";

export async function completeOnboardingAction(rawData: any) {
  // 1. Verify Authentication
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate Data on Server (Security Critical)
  // Even if client validation passed, we check again here.
  // We reconstruct the full object from the steps
  const result = onboardingSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: "Invalid data provided" };
  }

  const data = result.data;
  const client = await clerkClient();

  try {
    // 3. Create Organization (Server Side)
    // Logic: If they selected "No Company", we make a personal workspace
    const orgName = data.step1.noCompany 
      ? `${data.step1.fullName.split(' ')[0]}'s Workspace` 
      : data.step1.companyName!;

    const organization = await client.organizations.createOrganization({
      name: orgName,
      createdBy: userId,
      slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(), // Ensure unique slug
    });

    // 4. Update User Metadata (e.g. store the plan they selected)
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        plan: data.step4.planId,
        role: 'admin',
      },
    });

    // 5. Handle Team Invitations
    if (data.step5.teamMembers && data.step5.teamMembers.length > 0) {
      // Process in parallel for speed
      await Promise.all(
        data.step5.teamMembers.map((member) =>
          client.organizations.createOrganizationInvitation({
            organizationId: organization.id,
            emailAddress: member.email,
            role: "org:member",
            inviterUserId: userId,
          })
        )
      );
    }
    
    // 6. (Optional) Database Sync
    // If you have a separate DB (Prisma/Postgres), create the user/org record here.
    // await prisma.organization.create({ ... })

    return { success: true };

  } catch (error: any) {
    console.error("Onboarding Error:", error);
    return { success: false, error: error.message || "Failed to complete setup" };
  }
}