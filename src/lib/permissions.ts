import type { AdminRole, RolePermissions } from './types';

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  super_admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true, // Only super admin can delete
    canView: true,
  },
  admin: {
    canCreate: false, // Admin cannot create products
    canEdit: true, // Admin can only edit
    canDelete: false, // Admin cannot delete
    canView: true,
  },
  staff: {
    canCreate: false, // Staff is read-only
    canEdit: false,
    canDelete: false,
    canView: true,
  },
};

// Helper function to get permissions for a role
export function getPermissions(role: AdminRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

// Helper functions to check specific permissions
export function canCreate(role: AdminRole): boolean {
  return ROLE_PERMISSIONS[role].canCreate;
}

export function canEdit(role: AdminRole): boolean {
  return ROLE_PERMISSIONS[role].canEdit;
}

export function canDelete(role: AdminRole): boolean {
  return ROLE_PERMISSIONS[role].canDelete;
}

export function canView(role: AdminRole): boolean {
  return ROLE_PERMISSIONS[role].canView;
}

// Helper function to check if user can access admin settings
export function canAccessAdminSettings(role: AdminRole): boolean {
  return role === 'super_admin'; // Only super admin can access admin settings
}

// Helper function to check if user is super admin
export function isSuperAdmin(role: AdminRole): boolean {
  return role === 'super_admin';
}

// Helper function to check if user is admin or higher
export function isAdminOrHigher(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

// Helper function to check if user is staff
export function isStaff(role: AdminRole): boolean {
  return role === 'staff';
}

// Helper function to check if user can change product status (active/inactive)
export function canChangeProductStatus(role: AdminRole): boolean {
  return role === 'super_admin'; // Only super admin can activate/deactivate products
}

// Helper function to check if user can delete products
export function canDeleteProducts(role: AdminRole): boolean {
  return role === 'super_admin'; // Only super admin can delete products
}

// Helper function to check if user can edit products
export function canEditProducts(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'admin'; // Super admin and admin can edit
}

// Helper function to check if user can create products
export function canCreateProducts(role: AdminRole): boolean {
  return role === 'super_admin'; // Only super admin can create products
}

// Helper function to check if user can manage categories
export function canManageCategories(role: AdminRole): boolean {
  return role === 'super_admin'; // Only super admin can delete categories
}

// Helper function to check if user can change passwords
export function canChangePasswords(role: AdminRole): boolean {
  return role === 'super_admin'; // Only super admin can change passwords
}