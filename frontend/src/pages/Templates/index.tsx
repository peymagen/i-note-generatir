import React, { useCallback, useState } from "react";
import styles from "./ManageTemplete.module.css";
import Button from "../../component/Button/Button";
import { DataTable } from "../../component/DataTable/DataTable";
import Modal from "../../component/Modal";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";

import {
  useGetPageQuery,
  useDeletePageMutation,
} from "../../store/services/page.api";

import TemplateFormModal from "./Manipulate";
import type { ITemplate } from "../../types/templates";

const ManageTemplate: React.FC = () => {
  /* ================= STATE ================= */

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ITemplate | null>(null);

  /* ================= API ================= */

  const limit = 10;
  const offset = (page - 1) * limit;

  const { data, isFetching, refetch } = useGetPageQuery({
    limit,
    offset,
    search,
  });

  const [deletePage] = useDeletePageMutation();

  /* ================= FETCH FOR TABLE ================= */

  const fetchData = useCallback(
    async (params?: { page: number; search?: string }) => {
      const newPage = params?.page || 1;
      const newSearch = params?.search ?? "";

      setPage(newPage);
      setSearch(newSearch);

      return {
        data: data?.data ?? [],
        total: data?.total ?? 0,
      };
    },
    [data]
  );

  /* ================= DELETE ================= */

  const handleDelete = async (template: ITemplate) => {
    if (!window.confirm("Delete this template?")) return;

    try {
      await deletePage({ id: template.id }).unwrap();
      toast.success("Template deleted");
      refetch();
    } catch {
      toast.error("Delete failed");
    }
  };

  const actions = [
    {
      label: "Edit",
      onClick: () => {},
      component: (row: ITemplate) => (
        <button
          className={`${styles.iconBtn} ${styles.edit}`}
          title="Edit Template"
          onClick={() => setEditTemplate(row)}
        >
          <FiEdit size={18} />
        </button>
      ),
    },
    {
      label: "Delete",
      onClick: () => {},
      component: (row: ITemplate) => (
        <button
          className={`${styles.iconBtn} ${styles.delete}`}
          title="Delete Template"
          onClick={() => handleDelete(row)}
        >
          <FiTrash2 size={18} />
        </button>
      ),
    },
  ];

  /* ================= RENDER ================= */

  return (
    <div className={styles.container}>
      {/* ---------- HEADER ---------- */}
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Templates</h1>

        <div className={styles.btnWrapper}>
          <Button
            label="Create Template"
            buttonType="one"
            onClick={() => setShowCreateModal(true)}
          />
        </div>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className={styles.tableBox}>
        <DataTable<ITemplate & { [x: string]: unknown }>
          fetchData={fetchData}
          loading={isFetching}
          isSearch
          columns={[
            { label: "Title", accessor: "title" },
            { label: "Created On", accessor: "created_on" },
            { label: "Last Updated On", accessor: "updated_on" },
          ]}
          actions={actions}
        />
      </div>
      {/* ---------- CREATE MODAL ---------- */}
      {showCreateModal && (
        <Modal
          size="xl"
          title="Create Template"
          onClose={() => setShowCreateModal(false)}
        >
          <TemplateFormModal
            mode="create"
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        </Modal>
      )}

      {/* ---------- EDIT MODAL ---------- */}
      {editTemplate && (
        <Modal
          title="Edit Template"
          size="xl"
          onClose={() => setEditTemplate(null)}
        >
          <TemplateFormModal
            mode="edit"
            defaultValues={editTemplate}
            onSuccess={() => {
              setEditTemplate(null);
              refetch();
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default ManageTemplate;
