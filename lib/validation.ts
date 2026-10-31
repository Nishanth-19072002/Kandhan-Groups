import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  workType: z.string().trim().min(2, "Select a type of work").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{8,16}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(120),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  // honeypot – must stay empty
  company: z.string().max(0).optional().or(z.literal("")),
});

export type Enquiry = z.infer<typeof enquirySchema>;

