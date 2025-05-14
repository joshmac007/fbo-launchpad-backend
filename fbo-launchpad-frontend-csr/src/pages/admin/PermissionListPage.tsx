import React, { useState, useEffect, useCallback } from 'react';
import PermissionService from '../../services/PermissionService';
import { Permission } from '../../services/RoleService'; // Changed import source for Permission type
import Table, { ColumnDef } from '../../components/common/Table';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-hot-toast';

const PermissionListPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PermissionService.getPermissions();
      setPermissions(data || []); // Assuming getPermissions directly returns Permission[] or null/undefined
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load permissions';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading permissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const columns = React.useMemo<ColumnDef<Permission>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Permission Name',
      cell: info => (
        <code className="text-sm-mono bg-neutral-surface-muted px-xs py-xxs rounded-sm text-neutral-text-code dark:bg-neutral-surface-muted-dark dark:text-neutral-text-code-dark">
          {info.getValue() as string}
        </code>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: info => info.getValue() || 'N/A',
    },
  ], []);

  return (
    <div className="p-md lg:p-lg">
      <PageHeader title="System Permissions" />

      {/* Error display is handled by Table component if isError and error props are passed, 
          but a global page error can still be shown if needed for non-table errors. 
          For now, relying on toast and Table's error display. */}
      
      <div className="mt-lg">
        <Table<Permission>
          columns={columns}
          data={permissions}
          isLoading={isLoading}
          isError={!!error}
          error={error ? <p>{error}</p> : <p>Error loading permissions.</p>}
          emptyStateMessage="No permissions found in the system."
        />
      </div>
    </div>
  );
};

export default PermissionListPage; 