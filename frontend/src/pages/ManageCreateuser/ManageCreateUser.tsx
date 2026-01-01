import React, { useState, useEffect } from "react";
import Register from "../Register/Register";
import styles from "./ManageCreateUser.module.css";
import Button from "../../component/Button/Button";
import { toast } from "react-toastify";
import { DataTable } from "../../component/DataTable/DataTable";

import {
  useGetUserQuery,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} from "../../store/services/user.api";

interface User {
  [key: string]: any; 
  id: string;
  name: string;
  email: string;
  isActive: boolean;
} 

interface ManageCreateUserProps {
  onSuccess?: () => void;
}

const ManageCreateUser: React.FC<ManageCreateUserProps> = () => {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("manage");

  // fetch all users (client-side pagination/search)
  const { data, isFetching, isError, error, refetch } = useGetUserQuery(undefined, {
    skip: activeTab !== "manage",
    refetchOnMountOrArgChange: true,
  });

  // Debug log to check API response
  // useEffect(() => {
  //   console.log('API Response:', { data, isError, error });
  // }, [data, isError, error]);


  const [toggleStatus] = useToggleUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();


  // fetchData for DataTable (client-side search & pagination)
  const fetchData = async (params?: { page: number; search?: string }) => {
  console.log('Fetching data with params:', params);
  
  if (!data?.data) return { data: [], total: 0 };

  // Transform the data to match the expected format
 let rows = Array.isArray(data.data) 
  ? data.data.map((u: any) => ({
      id: u.id,
      name: u.name || 'N/A',
      email: u.email || 'N/A',
      isActive: u.is_active, 
      status: u.is_active ? "Active" : "Inactive" 
    }))
  : [];

  console.log('Processed rows:', rows);

  // Apply search filter if search term exists
  const searchTerm = params?.search?.trim().toLowerCase();
  if (searchTerm) {
    rows = rows.filter(
      (row:any) =>
        (row.name && row.name.toLowerCase().includes(searchTerm)) ||
        (row.email && row.email.toLowerCase().includes(searchTerm))
    );
  }

  return {
    data: rows,
    total: rows.length,
  };
};

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id).unwrap();
      await refetch();
      toast.success("User deleted!");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    }
  };

  // TOGGLE ACTIVE/INACTIVE
  const handleToggleUserStatus = async (id: string) => {
    try {
      
      const response = await toggleStatus(id).unwrap();
      await refetch();

      toast.success(response?.message || "Status updated!");
    } catch (err: any) {
      
      await refetch();
      toast.error(err?.data?.message || err?.message || "Toggle failed");
    }
  };

  // DataTable columns (accessors must match row keys)
  const columns = [
    { label: "Name", accessor: "name" },
    { label: "Email", accessor: "email" },
    { 
      label: "Status", 
      accessor: "status",  
      render: (row: User) => (
          <span className={row.isActive ? styles.activeBadge : styles.inactiveBadge}>
            {row.isActive ? "Active" : "Inactive"}
          </span>
        )
    },
  ];

  
  const actions = [
    {
      label: "",
      component: (row: User) => (
        <div className={styles.actionsRow}>
          
          <Button
            label={row.isActive ? "Deactivate" : "Activate"}
            buttonType={row.isActive ? "two" : "one"}
            onClick={() => handleToggleUserStatus(row.id)}
          />

          <Button
            label="Delete"
            buttonType="two"
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        {activeTab === "manage" ? (
          <h1 className={styles.title}>Manage User</h1>
        ) : (
          <h1 className={styles.title}>Create User</h1>
        )}
        <div className={styles.btnWrapper}>
          {activeTab === "manage" ? (
            <Button
              label="Create User"
              onClick={() => setActiveTab("create")}
              loading={false}
              buttonType="one"
            />
          ) : (
            <Button
              label="Back"
              onClick={() => setActiveTab("manage")}
              loading={false}
              buttonType="one"
            />
          )}
        </div>
      </div>

      {activeTab === "create" ? (
        <div className={styles.formContainer}>
          <Register />
        </div>
      ) : (
        <>
          {isError && (
            <p className={styles.errorMsg}>
              {(error as any)?.message || "Failed to load users"}
            </p>
          )}

          <div className={styles.tableBox}>
            <DataTable<User>
              fetchData={fetchData}
              loading={isFetching}
              isSearch={true}
              isExport={true}
              isNavigate={true}
              hasCheckbox={false}
              columns={columns}
              actions={actions}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ManageCreateUser;


