import React, { useCallback, useState } from "react";
import styles from "./ManageCreateUser.module.css";
import Button from "../../component/Button/Button";
import { toast } from "react-toastify";
import { DataTable } from "../../component/DataTable/DataTable";
import {
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiLock,
} from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";

import {
  useGetUserQuery,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} from "../../store/services/user.api";
import Modal from "../../component/Modal";
import Register from "./Manipulate";
import ConfirmDialog from "../../component/ConfirmDialoge";
import { useSelector } from "react-redux";
import ChangePasswordModal from "./ChangePasswordModal";
import type { RootState } from "../../store/store";
import type { IUser } from "../../types/user";

/* ================= COMPONENT ================= */

const ManageCreateUser: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<IUser | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  /* ================= API ================= */
  const limit = 10;
  const offset = (page - 1) * limit;
  const { data, isFetching, isError, error, refetch } = useGetUserQuery({
    limit,
    offset,
    search,
  });

  const [toggleStatus] = useToggleUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  /* ================= DATA FOR TABLE ================= */

  const fetchData = useCallback(
    async (params?: { page: number; search?: string }) => {
      const page = params?.page || 1;
      const search = params?.search || "";
      setPage(page);
      setSearch(search);
      return {
        data: data?.data || [],
        total: data?.total || 0,
      };
    },
    [data]
  );

  /* ================= ACTIONS ================= */

  const handleToggleUserStatus = async (id: string) => {
    try {
      setLoadingAction(id);
      await toggleStatus(id).unwrap();
      toast.success("Status updated");
      refetch();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Action Failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setLoadingAction(deleteTarget.id?.toString() || "");
      await deleteUser(deleteTarget.id?.toString() || "").unwrap();
      toast.success("User deleted");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Delete Failed");
    } finally {
      setLoadingAction(null);
    }
  };

  /* ================= TABLE CONFIG ================= */

  const columns = [
    { label: "Name", accessor: "name" },
    { label: "Email", accessor: "email" },
    {
      label: "Status",
      accessor: "status",
      render: (row: IUser) => (
        <span
          className={row.is_active ? styles.activeBadge : styles.inactiveBadge}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions = [
    /* ================= EDIT ================= */
    {
      label: "Edit",
      onClick: () => {},
      component: (row: IUser) => (
        <button
          className={`${styles.iconBtn} ${styles.edit}`}
          title="Edit User"
          onClick={() => setEditUser(row)}
        >
          <FiEdit size={18} />
        </button>
      ),
    },

    /* ================= CHANGE PASSWORD (ONLY ME) ================= */
    {
      label: "Change Password",
      onClick: () => {},
      component: (row: IUser) => {
        const isMe = row.id?.toString() === currentUser?.id.toString();
        if (!isMe) return null;

        return (
          <button
            className={`${styles.iconBtn} ${styles.password}`}
            title="Change Password"
            onClick={() => setShowChangePassword(true)}
          >
            <FiLock size={18} />
          </button>
        );
      },
    },

    /* ================= ACTIVATE / DEACTIVATE ================= */
    {
      label: "Toggle Status",
      onClick: () => {},
      component: (row: IUser) => {
        const isMe = row.id?.toString() === currentUser?.id.toString();
        const isLoading = loadingAction === row.id?.toString();

        return (
          <button
            disabled={isMe || isLoading}
            className={`${styles.iconBtn} ${
              row.is_active ? styles.deactivate : styles.activate
            } ${isMe ? styles.disabled : ""}`}
            title={
              isMe
                ? "You cannot change your own status"
                : row.is_active
                ? "Deactivate User"
                : "Activate User"
            }
            onClick={() => handleToggleUserStatus(row.id?.toString() || "")}
          >
            {isLoading ? (
              <ImSpinner2 className={styles.spinner} />
            ) : row.is_active ? (
              <FiXCircle size={18} />
            ) : (
              <FiCheckCircle size={18} />
            )}
          </button>
        );
      },
    },

    /* ================= DELETE ================= */
    {
      label: "Delete",
      onClick: () => {},
      component: (row: IUser) => {
        const isMe = row.id?.toString() === currentUser?.id.toString();

        return (
          <button
            disabled={isMe}
            className={`${styles.iconBtn} ${styles.delete} ${
              isMe ? styles.disabled : ""
            }`}
            title={isMe ? "You cannot delete yourself" : "Delete User"}
            onClick={() => setDeleteTarget(row)}
          >
            <FiTrash2 size={18} />
          </button>
        );
      },
    },
  ];

  /* ================= RENDER ================= */

  return (
    <div className={styles.container}>
      {/* ---------- HEADER ---------- */}
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Users</h1>

        <div className={styles.btnWrapper}>
          <Button
            label="Create User"
            buttonType="one"
            onClick={() => setShowCreateModal(true)}
          />
        </div>
      </div>

      {/* ---------- ERROR ---------- */}
      {isError && (
        <p className={styles.errorMsg}>
          {"message" in error ? error.message : "Failed to load users"}
        </p>
      )}

      {/* ---------- TABLE ---------- */}
      <div className={styles.tableBox}>
        <DataTable<IUser & { [x: string]: unknown }>
          fetchData={fetchData}
          loading={isFetching}
          isSearch
          isExport
          isNavigate
          hasCheckbox={false}
          columns={columns}
          actions={actions}
        />
      </div>

      {/* ---------- CREATE / EDIT USER MODAL ---------- */}
      {(showCreateModal || editUser) && (
        <Modal
          title={editUser ? "Edit User" : "Create New User"}
          onClose={() => {
            setShowCreateModal(false);
            setEditUser(null);
          }}
        >
          <Register
            mode={editUser ? "edit" : "create"}
            defaultValues={editUser || undefined}
            onSubmitSuccess={() => {
              setShowCreateModal(false);
              setEditUser(null);
              refetch();
            }}
          />
        </Modal>
      )}

      {/* ---------- DELETE CONFIRM ---------- */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={loadingAction === deleteTarget.id?.toString()}
        />
      )}
      {/* ---------- CHANGE PASSWORD MODAL ---------- */}
      {showChangePassword && (
        <ChangePasswordModal
          userId={currentUser?.id || ""}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
};

export default ManageCreateUser;
