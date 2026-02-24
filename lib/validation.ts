import { z } from "zod";

export const registrationSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    contactNumber: z
      .string()
      .regex(/^09\d{9}$/, "Contact number must be in PH format: 09XXXXXXXXX."),
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "Please enter a valid email address."
    }),
    church: z.string().min(2, "Church associated with is required."),
    role: z.string().trim().optional().or(z.literal("")),
    roleOther: z.string().trim().optional().or(z.literal("")),
    hasVehicle: z.boolean(),
    plateNumber: z.string().optional().or(z.literal(""))
  })
  .superRefine((value, ctx) => {
    if (value.hasVehicle && !value.plateNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["plateNumber"],
        message: "Plate number is required when vehicle is YES."
      });
    }

    if (value.role === "Others" && !value.roleOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["roleOther"],
        message: "Please specify your role/ministry."
      });
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const registrationAdminUpdateSchema = registrationSchema;
export type RegistrationAdminUpdateInput = z.infer<typeof registrationAdminUpdateSchema>;
