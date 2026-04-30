import { useState, useEffect } from 'react';
import { AdminRole } from '@/lib/types';

interface ModulePermission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

interface UserPermissions {
  // Permission strings for UI display
  permissions: string[];
  // Module-based permissions for granular control
  modulePermissions: ModulePermission[];
  // Helper functions
  hasPermission: (permission: string) => boolean;
  canViewModule: (module: string) => boolean;
  canCreateInModule: (module: string) => boolean;
  canEditInModule: (module: string) => boolean;
  canDeleteInModule: (module: string) => boolean;
  canExportFromModule: (module: string) => boolean;
  loading: boolean;
}

const MODULE_MAP: Record<string, string> = {
  'dashboard': 'View Dashboard',
  'electricians': 'Manage Electricians',
  'dealers': 'Manage Dealers',
  'products': 'Manage Products',
  'qr_codes': 'Manage QR Codes',
  'gifts': 'Manage Gifts',
  'reports': 'View Reports',
  'settings': 'Manage Settings',
  'notifications': 'Send Notifications',
  'banners': 'Manage Banners',
  'finance': 'Manage Finance',
  'commissions': 'Manage Commissions',
};

const DEFAULT_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: Object.values(MODULE_MAP),
  admin: [],
  staff: [],
};

export function useUserPermissions(adminId: string | undefined, role: AdminRole): UserPermissions {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      if (!adminId) {
        setLoading(false);
        return;
      }

      // Super admin always has all permissions
      if (role === 'super_admin') {
        const allModules = Object.keys(MODULE_MAP).map(module => ({
          module,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
        }));
        setModulePermissions(allModules);
        setPermissions(Object.values(MODULE_MAP));
        setLoading(false);
        return;
      }

      try {
        // Load custom permissions from database
        const token = localStorage.getItem('srv_token'); // Fixed: use correct token key
        const response = await fetch(`http://localhost:3001/api/v1/admins/${adminId}/permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            // Use database permissions
            setModulePermissions(data);
            
            // Convert to permission strings
            const permStrings = data
              .filter((p: ModulePermission) => p.canView || p.canCreate || p.canEdit || p.canDelete)
              .map((p: ModulePermission) => MODULE_MAP[p.module])
              .filter(Boolean);
            
            setPermissions(permStrings);
          } else {
            // No custom permissions, use defaults (empty for admin/staff)
            setPermissions(DEFAULT_PERMISSIONS[role] || []);
            setModulePermissions([]);
          }
        } else {
          // Fallback to default permissions
          setPermissions(DEFAULT_PERMISSIONS[role] || []);
          setModulePermissions([]);
        }
      } catch (error) {
        console.error('Failed to load permissions:', error);
        // Fallback to default permissions
        setPermissions(DEFAULT_PERMISSIONS[role] || []);
        setModulePermissions([]);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [adminId, role]);

  const hasPermission = (permission: string): boolean => {
    if (role === 'super_admin') return true;
    return permissions.includes(permission);
  };

  const getModulePermission = (module: string): ModulePermission | undefined => {
    return modulePermissions.find(p => p.module === module);
  };

  const canViewModule = (module: string): boolean => {
    if (role === 'super_admin') return true;
    const perm = getModulePermission(module);
    return perm?.canView ?? false;
  };

  const canCreateInModule = (module: string): boolean => {
    if (role === 'super_admin') return true;
    const perm = getModulePermission(module);
    return perm?.canCreate ?? false;
  };

  const canEditInModule = (module: string): boolean => {
    if (role === 'super_admin') return true;
    const perm = getModulePermission(module);
    return perm?.canEdit ?? false;
  };

  const canDeleteInModule = (module: string): boolean => {
    if (role === 'super_admin') return true;
    const perm = getModulePermission(module);
    return perm?.canDelete ?? false;
  };

  const canExportFromModule = (module: string): boolean => {
    if (role === 'super_admin') return true;
    const perm = getModulePermission(module);
    return perm?.canExport ?? false;
  };

  return {
    permissions,
    modulePermissions,
    hasPermission,
    canViewModule,
    canCreateInModule,
    canEditInModule,
    canDeleteInModule,
    canExportFromModule,
    loading,
  };
}
