import React, { useEffect, useState, useCallback, useMemo } from 'react';
import UserService, { getUsers, createUser, updateUser } from '../../services/UserService';
import RoleService from '../../services/RoleService';
import UserForm from '../../components/admin/UserForm';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Table, { ColumnDef } from '../../components/common/Table';
import { Edit3, UserPlus, UserCheck, UserX, Power, PowerOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { User, UserCreateDto, UserUpdateDto, UserListResponse } from '../../types/users';
import { Role, RoleListResponse as RolesAPIRoleListResponse } from '../../types/roles'; // Renamed to avoid confusion

// Role styling helper (kept local for now, can be centralized if needed elsewhere)
const getRoleDisplayProps = (roleName: string): { abbreviation: string; colorClass: string; } => {
  if (roleName && roleName.toLowerCase() === 'system administrator') {
    return {
      abbreviation: 'ADM',
      colorClass: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100',
    };
  }

  const colors = [
    'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
    'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100',
    'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
    'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-100',
    'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-100',
  ];
  
  let hash = 0;
  for (let i = 0; i < roleName.length; i++) {
    hash = roleName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = colors[Math.abs(hash) % colors.length];

  const words = roleName.split(' ');
  let abbreviation = '';
  if (words.length > 1) {
    abbreviation = words.map(word => word[0]).join('').toUpperCase();
  } else {
    abbreviation = roleName.substring(0, 3).toUpperCase();
  }
  if (abbreviation.length > 3) {
      abbreviation = abbreviation.substring(0,3);
  }

  return { abbreviation, colorClass };
};

const UserManagementPage: React.FC = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form submissions
  const [actionTargetUser, setActionTargetUser] = useState<User | null>(null); // For toggle active modal
  const [showConfirmToggleModal, setShowConfirmToggleModal] = useState<boolean>(false);

  const { isAuthenticated, user: currentUser, hasPermission } = useAuth();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResponse, rolesResponse]: [UserListResponse, RolesAPIRoleListResponse] = await Promise.all([
        UserService.getUsers(), // Assuming default export from UserService has getUsers
        RoleService.getRoles()
      ]);
      setUserList(usersResponse.users || []);
      setAvailableRoles(rolesResponse.roles || []);
    } catch (e: any) {
      const errMsg = e.message || 'Failed to load data.';
      setError(errMsg);
      toast.error(errMsg);
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestToggleActive = (userToToggle: User) => {
    setActionTargetUser(userToToggle);
    setShowConfirmToggleModal(true);
  };

  const confirmToggleActiveStatus = async () => {
    if (!actionTargetUser) return;

    const actionText = actionTargetUser.is_active ? 'deactivate' : 'activate';
    setIsSubmitting(true);
    try {
      await UserService.updateUser(actionTargetUser.id, { is_active: !actionTargetUser.is_active });
      toast.success(`User ${actionTargetUser.name} ${actionText}d successfully.`);
      fetchData(); // Refresh data
    } catch (e: any) {
      const errMsg = e.response?.data?.error || e.message || `Failed to ${actionText} user.`;
      toast.error(errMsg);
      console.error(`Failed to ${actionText} user:`, e);
    } finally {
      setIsSubmitting(false);
      setShowConfirmToggleModal(false);
      setActionTargetUser(null);
    }
  };

  const handleFormSubmit = async (formData: UserCreateDto | UserUpdateDto) => {
    setIsSubmitting(true);
    try {
      if (editingUser && editingUser.id) {
        await UserService.updateUser(editingUser.id, formData as UserUpdateDto);
        toast.success('User updated successfully.');
      } else {
        await UserService.createUser(formData as UserCreateDto);
        toast.success('User created successfully.');
      }
      setShowFormModal(false);
      setEditingUser(null);
      fetchData(); // Refresh data
    } catch (e: any) {
      const errMsg = e.response?.data?.error || e.message || 'Save failed.';
      toast.error(errMsg);
      // Potentially set a form-specific error state here to display in the modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowFormModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
  };
  
  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: 'name', header: 'Name', cell: info => info.getValue() },
    { accessorKey: 'email', header: 'Email', cell: info => info.getValue() },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => {
        const userRoles = row.original.roles;
        if (!userRoles || userRoles.length === 0) return <span className="text-neutral-text-tertiary italic">No roles</span>;
        return (
          <div className="flex flex-wrap gap-xs">
            {userRoles.map(role => {
              const { abbreviation, colorClass } = getRoleDisplayProps(role.name);
              return (
                <span
                  key={role.id}
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
                  title={role.name}
                >
                  {abbreviation}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <span className={`inline-flex items-center gap-xs px-sm py-xs rounded-full text-xs-medium whitespace-nowrap ${isActive ? 'bg-success-surface text-success-text' : 'bg-neutral-surface-secondary text-neutral-text-secondary'}`}>
            {isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: info => {
        const createdAt = info.getValue() as string | undefined;
        return createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        // Prevent current user from deactivating themselves or editing their own roles (example restriction)
        const isCurrentUser = currentUser?.id === user.id;
        return (
          <div className="flex items-center gap-xs">
            {isAuthenticated && hasPermission('MANAGE_USERS') && (
              <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} aria-label="Edit User">
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {isAuthenticated && hasPermission('MANAGE_USERS') && !isCurrentUser && (
              <Button 
                variant={user.is_active ? "ghost" : "ghost"} 
                size="icon" 
                onClick={() => handleRequestToggleActive(user)} 
                aria-label={user.is_active ? 'Deactivate User' : 'Activate User'}
                className={user.is_active ? 'text-status-warning-text hover:bg-status-warning-surface' : 'text-status-success-text hover:bg-status-success-surface'}
              >
                {user.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              </Button>
            )}
          </div>
        );
      },
    },
  ], [isAuthenticated, hasPermission, currentUser, fetchData]); // Added fetchData to deps as actions can trigger it

  // Prepare initialData for UserForm, ensuring compatibility with UserForm's InitialUser prop type
  const userFormInitialData = useMemo(() => {
    if (!editingUser) return undefined; // UserForm expects undefined or InitialUser
    // Map User to InitialUser (UserForm's local type)
    // UserForm's Role type has id: number, which should now align.
    return {
      id: typeof editingUser.id === 'string' ? parseInt(editingUser.id, 10) : editingUser.id, // Ensure ID is number if possible for UserForm
      name: editingUser.name,
      email: editingUser.email,
      is_active: editingUser.is_active,
      roles: editingUser.roles?.map(r => ({ id: r.id, name: r.name })) || [], // Map to UserForm's Role structure
    };
  }, [editingUser]);

  return (
    <div className="p-md lg:p-lg">
      <PageHeader 
        title="User Management"
        actions={
          isAuthenticated && hasPermission('CREATE_USERS') && (
            <Button 
              onClick={handleCreate} 
              variant="primary"
              data-testid="add-user-button"
            >
              <UserPlus className="mr-xs h-sm w-sm" />
              Create New User
            </Button>
          )
        }
      />

      <div className="mt-lg">
        <Table<User>
          columns={columns}
          data={userList}
          isLoading={isLoading}
          isError={!!error && !isLoading}
          error={error ? <p>{error}</p> : <p>Error loading users.</p>}
          emptyStateMessage="No users found. Add a new user to get started."
        />
      </div>

      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={handleCloseModal}
          title={editingUser ? 'Edit User' : 'Add New User'}
          size="xl" // User form can be complex with role assignments
        >
          <UserForm
            initialData={userFormInitialData} // Pass the mapped initialData
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
            isEditMode={!!editingUser} // This correctly implies if initialData is set
            availableRoles={availableRoles} // This should now be Role[] where Role.id is number
          />
        </Modal>
      )}

      {showConfirmToggleModal && actionTargetUser && (
         <Modal
          isOpen={showConfirmToggleModal}
          onClose={() => { setShowConfirmToggleModal(false); setActionTargetUser(null); }}
          title={actionTargetUser.is_active ? "Deactivate User" : "Activate User"}
          size="md"
        >
          <div className="space-y-md">
            <p>
              Are you sure you want to {actionTargetUser.is_active ? 'deactivate' : 'activate'} user "<strong>{actionTargetUser.name}</strong>"?
            </p>
            <div className="flex justify-end gap-sm pt-md">
              <Button 
                variant="outline" 
                onClick={() => { setShowConfirmToggleModal(false); setActionTargetUser(null); }} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant={actionTargetUser.is_active ? "destructive" : "primary"} 
                onClick={confirmToggleActiveStatus} 
                isLoading={isSubmitting} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (actionTargetUser.is_active ? 'Deactivating...' : 'Activating...') : (actionTargetUser.is_active ? 'Deactivate' : 'Activate')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagementPage; 