import { z } from 'zod';

// 1. Workspace Schema (For companies buying your Fusion Byte CRM)
export const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
  domain: z.string().optional(), // For custom domains later
  subscriptionPlan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).default('FREE'),
  subscriptionStatus: z.enum(['ACTIVE', 'CANCELED', 'PAST_DUE']).default('ACTIVE'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 2. User Schema (For agents/owners logging into the CRM)
export const userSchema = z.object({
  firebaseUid: z.string(),
  workspaceId: z.string(), // Critical for Multi-tenancy isolation
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(2, 'Name is required').max(100),
  role: z.enum(['OWNER', 'MANAGER', 'AGENT']).default('AGENT'),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional(),
});

// 3. Lead Schema (The actual customer data they will manage)
export const leadSchema = z.object({
  workspaceId: z.string(), // The lock ensuring data privacy
  createdByUserId: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']).default('NEW'),
  source: z.string().default('MANUAL'),
  isDeleted: z.boolean().default(false), // Soft-delete mechanism
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Export inferred TypeScript types for our Services/Controllers
export type Workspace = z.infer<typeof workspaceSchema>;
export type User = z.infer<typeof userSchema>;
export type Lead = z.infer<typeof leadSchema>;