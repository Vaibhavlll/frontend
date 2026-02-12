// schemas.ts
import { z } from "zod";

export const onboardingSchema = z.object({
  step1: z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain an uppercase letter").regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    companyName: z.string().optional(),
    noCompany: z.boolean(),
  }).refine((data) => data.noCompany || (data.companyName && data.companyName.length > 0), {
    message: "Company name is required",
    path: ["companyName"],
  }),
  step2: z.object({
    verificationCode: z.string().length(6, "Code must be 6 digits"),
  }),
  step3: z.object({
    companyTypes: z.array(z.string()).min(1, "Select at least one type").max(3, "Max 3 types allowed"),
    companySize: z.number().min(0),
  }),
  step4: z.object({
    planId: z.enum(['free', 'growth', 'enterprise']),
    billingCycle: z.enum(['monthly', 'yearly']),
  }),
  step5: z.object({
    phoneNumber: z.string().optional(),
    teamMembers: z.array(z.object({
      email: z.string().email(),
    })).optional(),
  }),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;