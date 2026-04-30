'use client';
import { ReactNode } from 'react';
import { useAppContext } from '@/lib/appContext';
import { AdminRole } from '@/lib/types';
import {
  canCreate,
  canEdit,
  canDelete,
  canView,
  canAccessAdminSettings,
  isSuperAdmin,
  isAdminOrHigher,
  isStaff,
  canChangeProductStatus,
  canManageCategories,
  canChangePasswords,
} from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  /** Required permission type */
  permission?: 'create' | 'edit' | 'delete' | 'view' | 'adminSettings' | 'changeProductStatus' | 'manageCategories' | 'changePasswords';
  /** Required role (alternative to permission) */
  requiredRole?: AdminRole | AdminRole[];
  /** Fallback content when permission denied */
  fallback?: ReactNode;
  /** Hide instead of showing fallback */
  hideOnDenied?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * // Show delete button only to super admin
 * <PermissionGuard permission="delete">
 *   <button onClick={handleDelete}>Delete</button>
 * </PermissionGuard>
 * 
 * @example
 * // Show product status toggle only to super admin
 * <PermissionGuard permission="changeProductStatus">
 *   <Toggle checked={isActive} onChange={handleStatusChange} />
 * </PermissionGuard>
 * 
 * @example
 * // Show admin settings only to super admin
 * <PermissionGuard permission="adminSettings">
 *   <AdminSettingsPanel />
 * </PermissionGuard>
 * 
 * @example
 * // Show content only to specific roles
 * <PermissionGuard requiredRole={['super_admin', 'admin']}>
 *   <EditForm />
 * </PermissionGuard>
 * 
 * @example
 * // Show fallback when permission denied
 * <PermissionGuard permission="edit" fallback={<ReadOnlyView />}>
 *   <EditableView />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  requiredRole,
  fallback = null,
  hideOnDenied = false,
}: PermissionGuardProps) {
  const { auth } = useAppContext();
  
  let hasPermission = false;
  
  // Check by permission type
  if (permission) {
    switch (permission) {
      case 'create':
        hasPermission = canCreate(auth.role);
        break;
      case 'edit':
        hasPermission = canEdit(auth.role);
        break;
      case 'delete':
        hasPermission = canDelete(auth.role);
        break;
      case 'view':
        hasPermission = canView(auth.role);
        break;
      case 'adminSettings':
        hasPermission = canAccessAdminSettings(auth.role);
        break;
      case 'changeProductStatus':
        hasPermission = canChangeProductStatus(auth.role);
        break;
      case 'manageCategories':
        hasPermission = canManageCategories(auth.role);
        break;
      case 'changePasswords':
        hasPermission = canChangePasswords(auth.role);
        break;
    }
  }
  
  // Check by required role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    hasPermission = roles.includes(auth.role);
  }
  
  // If no permission specified, default to true
  if (!permission && !requiredRole) {
    hasPermission = true;
  }
  
  if (!hasPermission) {
    return hideOnDenied ? null : <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Hook to check permissions programmatically
 * 
 * @example
 * const { canDelete, isSuperAdmin, canChangeProductStatus } = usePermissions();
 * if (canDelete) {
 *   // Show delete button
 * }
 */
export function usePermissions() {
  const { auth } = useAppContext();
  
  return {
    role: auth.role,
    canCreate: canCreate(auth.role),
    canEdit: canEdit(auth.role),
    canDelete: canDelete(auth.role),
    canView: canView(auth.role),
    canAccessAdminSettings: canAccessAdminSettings(auth.role),
    canChangeProductStatus: canChangeProductStatus(auth.role),
    canManageCategories: canManageCategories(auth.role),
    canChangePasswords: canChangePasswords(auth.role),
    isSuperAdmin: isSuperAdmin(auth.role),
    isAdminOrHigher: isAdminOrHigher(auth.role),
    isStaff: isStaff(auth.role),
  };
}
