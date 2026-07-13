import { PrismaClient } from '@prisma/client';
import { generateFbUid } from '../utils/generateFbUid';

const prisma = new PrismaClient();

export class AuthService {
  static async registerTenant(data: { firebaseUid: string; email: string; fullName: string; workspaceName: string }) {
    // $transaction ensures either ALL data is saved, or NOTHING is saved. Zero data corruption.
    return await prisma.$transaction(async (tx) => {
      const tenantUid = generateFbUid();

      const workspace = await tx.workspace.create({
        data: {
          tenantUid,
          name: data.workspaceName,
          subscriptionPlan: 'FREE',
        }
      });

      const user = await tx.user.create({
        data: {
          firebaseUid: data.firebaseUid,
          workspaceId: workspace.id,
          email: data.email,
          fullName: data.fullName,
          role: 'OWNER', // The creator is always the Workspace Owner
        }
      });

      return { workspace, user };
    });
  }
}