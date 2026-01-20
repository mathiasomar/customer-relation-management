# Multi-Tenant System Implementation Guide

## Overview

Your CRM is now configured as a multi-tenant application where each user can belong to multiple workspaces (tenants) and switch between them. The `tenantId` is stored in the session and automatically managed when switching workspaces.

## Architecture

### 1. Database Schema

The Prisma schema includes:

- **Session model** with `tenantId` field - stores which tenant the session is scoped to
- **Tenant model** - represents a workspace with members, contacts, leads, etc.
- **TenantMember model** - junction table linking users to tenants with their roles

### 2. Better-Auth Configuration (lib/auth.ts)

- **User additional fields**: Includes `tenantId` to track the active tenant
- **Session creation hook**: When a new session is created, it automatically assigns the user's most recently joined tenant
- **Session update hook**: Preserves tenantId during session updates

### 3. Server-Side Permissions (lib/permisions/tenant.ts)

- `getCurrentTenant()` - Gets the tenantId from the active session
- `getCurrentUser()` - Gets the authenticated user
- `verifyTenantPermission()` - Verifies user has access to the current tenant and checks subscription status

### 4. Tenant Actions (actions/tenant.action.ts)

- `getUserTenantsMembmership()` - Fetches all workspaces the user belongs to
- `switchTenant(newTenantId)` - **NEW**: Switches the active tenant by:
  1. Verifying user is a member of the target tenant
  2. Checking tenant is active and not deleted
  3. Updating the session in the database with the new `tenantId`
  4. Revalidating cache paths
- `getTenant()` - Fetches current tenant details (uses verifyTenantPermission which gets tenantId from session)

## How It Works

### Step 1: User Login

1. User logs in via email, Google, or GitHub
2. Better-Auth creates a session
3. The session creation hook finds the user's most recent tenant and sets `session.tenantId`
4. Session is stored with the tenant context

### Step 2: Access Tenant Data

1. Any server action that needs tenant data calls `verifyTenantPermission()`
2. This extracts the `tenantId` from the active session
3. Data queries are automatically scoped to that tenant

### Step 3: Switch Tenant

1. User selects a different workspace in the tenant-switcher component
2. Component calls `useSwitchTenant()` mutation with the new tenantId
3. Server action `switchTenant(newTenantId)` executes:
   - Verifies user membership in the new tenant
   - Updates the session record in the database with the new `tenantId`
   - Revalidates Next.js cache
4. React Query invalidates session and tenant queries
5. `router.refresh()` refreshes the page with new tenant context
6. `authClient.getSession()` fetches the updated session

## Implementation Details

### Tenant-Switcher Component

The `tenant-switcher.tsx` component:

1. Shows the current active tenant
2. Lists all tenants the user is a member of
3. Allows switching between tenants
4. Shows a loading state during the switch

**Key Changes Made:**

```typescript
const handleTenantSwitch = async (tenantSlug: string) => {
  const selectedTenant = dataTenants?.find((t) => t.slug === tenantSlug);
  if (selectedTenant) {
    switchTenant(selectedTenant.id, {
      onSuccess: () => {
        authClient.getSession(); // Refresh session
        router.refresh(); // Refresh page
      },
      onError: (error) => {
        console.error("Failed to switch tenant:", error);
      },
    });
  }
};
```

### Switch Tenant Action

The updated `switchTenant()` function now:

1. Accepts a `tenantId` parameter
2. Updates the session in the database with the new tenantId
3. Returns tenant metadata needed for UI updates

```typescript
export async function switchTenant(newTenantId: string) {
  const session = await getCurrentUser();

  // Verify membership...

  // Update session with new tenantId
  const currentSession = await auth.api.getSession();
  if (currentSession?.session?.id) {
    await prisma.session.update({
      where: { id: currentSession.session.id },
      data: { tenantId: newTenantId },
    });
  }

  // Return success with tenant info...
}
```

## Using Tenant Context in Your Code

### In Server Actions

```typescript
import { getCurrentTenant } from "@/lib/permisions/tenant";
import { prisma } from "@/lib/prisma";

export async function someAction() {
  const tenantId = await getCurrentTenant(); // Automatically from session

  const data = await prisma.lead.findMany({
    where: { tenantId },
  });

  return data;
}
```

### In Components

```typescript
"use client";
import { authClient } from "@/lib/auth-client";

export function MyComponent() {
  const { data: session } = authClient.useSession();

  const tenantId = session?.user?.tenantId;
  // Use tenantId to fetch or display tenant-specific data
}
```

## Security Considerations

1. **Always Verify Tenant Access**: Use `verifyTenantPermission()` before allowing any tenant operations
2. **Session-Based Scoping**: All queries should be scoped to the session's `tenantId`
3. **Role-Based Access**: TenantMember includes role and permissions fields for granular access control
4. **Subscription Status Checks**: Certain operations may be restricted based on subscription

## Database Migration

If you haven't already, run:

```bash
pnpm prisma migrate dev
```

This ensures the `tenantId` field in the Session table is properly created.

## Testing the Multi-Tenant System

1. Create a test user and sign in
2. Create multiple tenants (workspaces)
3. Add the user to multiple tenants
4. Use the tenant-switcher to switch between workspaces
5. Verify that data (leads, contacts, etc.) is properly scoped to each tenant
6. Verify that session updates reflect the current tenant

## Troubleshooting

### Session not updating after switch

- Ensure `router.refresh()` is called after switching
- Check that `authClient.getSession()` is called to refresh the client-side session
- Verify React Query invalidation is working

### Data showing for wrong tenant

- Check that `verifyTenantPermission()` is being called in all server actions
- Ensure queries include `where: { tenantId }` filter
- Verify the session has the correct `tenantId`

### User can't see all their tenants

- Check TenantMember records in the database
- Verify `getUserTenantsMembmership()` is returning all memberships
- Check for soft-deleted tenants or inactive subscriptions

## Next Steps

1. **Add Tenant Creation**: Implement create tenant functionality
2. **Invite Members**: Allow admins to invite other users to tenants
3. **Manage Roles**: Implement role management per tenant
4. **Audit Logging**: Track all tenant-related changes
5. **Custom Branding**: Allow tenants to customize their workspace appearance
