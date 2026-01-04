import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import styles from "./ManageTemplete.module.css";
import Button from "../../component/Button/Button";
import RichTextEditor from "../../component/RichEditor/RichEditor";
import { DataTable } from "../../component/DataTable/DataTable";
import {
  useGetPageQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} from "../../store/services/page.api";
import { toast } from "react-toastify";
import Input from "../../component/Input/Input2";

type ViewMode = "list" | "edit" | "new";

interface TemplateForm {
  title: string;
  content: string;
}

const ManageTemplate: React.FC = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data, isFetching, refetch } = useGetPageQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data: pageData } = useGetPageByIdQuery(pageId!, {
    skip: !pageId,
  });

  const [createPage] = useCreatePageMutation();
  const [updatePage] = useUpdatePageMutation();
  const [deletePage] = useDeletePageMutation();

  /* ================= FORM ================= */

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TemplateForm>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  /* ================= MODE HANDLING ================= */

  useEffect(() => {
    if (pageId) setViewMode("edit");
    else if (window.location.pathname.includes("/new")) setViewMode("new");
    else setViewMode("list");
  }, [pageId]);

  /* ================= LOAD EDIT DATA ================= */

  useEffect(() => {
    if (!pageData?.data || viewMode !== "edit") return;

    reset({
      title: pageData.data.title,
      content: pageData.data.content,
    });
  }, [pageData, viewMode, reset]);

  /* ================= SAVE HANDLER ================= */

  const onSubmit = async (formData: TemplateForm) => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (viewMode === "edit" && pageId) {
        await updatePage({
          id: pageId,
          data: formData,
        }).unwrap();

        toast.success("Template updated successfully");
      } else {
        await createPage(formData).unwrap();
        toast.success("Template created successfully");
      }

      reset();
      setViewMode("list");
      navigate("/manage-template");
      refetch();
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : (err as { message?: string })?.message || "Save failed";
      toast.error(message);
      console.error("Save error:", err);
    }
  };

  /* ================= TABLE HELPERS ================= */

  const stripHtml = (html: string) => html?.replace(/<[^>]*>?/gm, "") || "";

  const fetchPages = async (params?: { search?: string; page?: number }) => {
    if (!data?.data) return { data: [], total: 0 };

    let rows = data.data;

    if (params?.search) {
      rows = rows.filter((r: { title: string }) =>
        r.title.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    const page = params?.page || 1;
    const pageSize = 10;
    const start = (page - 1) * pageSize;

    return {
      data: rows.slice(start, start + pageSize).map((r) => ({
        id: r.id,
        title: stripHtml(r.title),
        created_on: r.created_on,
        updated_on: r.updated_on,
        rawData: r,
      })),
      total: rows.length,
    };
  };

  /* ================= UI ================= */

  return (
    <div className={styles.container}>
      {/* LIST VIEW */}
      {viewMode === "list" && (
        <>
          <div className={styles.headerContainer}>
            <h1 className={styles.pageTitle}>Manage Templates</h1>
            <div className={styles.btnWrapper0}>
              <Button
                label="+ New Template"
                buttonType="four"
                onClick={() => {
                  setViewMode("new");
                  navigate("/new");
                }}
              />
            </div>
          </div>

          <DataTable
            fetchData={fetchPages}
            loading={isFetching}
            columns={[
              { label: "Title", accessor: "title" },
              { label: "Created On", accessor: "created_on" },
              { label: "Updated On", accessor: "updated_on" },
            ]}
            actions={[
              {
                label: "Edit",
                onClick: (row: string) => navigate(`/edit/${row.rawData.id}`),
              },
              {
                label: "Delete",
                onClick: async (row: string) => {
                  if (!window.confirm("Delete template?")) return;
                  await deletePage({ id: row.rawData.id });
                  toast.success("Template deleted");
                  refetch();
                },
              },
            ]}
            isSearch
          />
        </>
      )}

      {/* CREATE / EDIT VIEW */}
      {(viewMode === "new" || viewMode === "edit") && (
        <form className={styles.editorArea} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.headerContainer}>
            <h1 className={styles.pageTitle}>
              {viewMode === "edit" ? "Edit Template" : "Create Template"}
            </h1>

            <div className={styles.btnWrapper}>
              <Button
                label="← Back"
                buttonType="one"
                onClick={() => {
                  setViewMode("list");
                  navigate("/manage-template");
                }}
              />
            </div>
          </div>

          {/* TITLE */}
          <Input
            placeholder=" Title"
            className={styles.titleInput}
            value={watch("title")}
            onChange={(e) => setValue("title", e.target.value)}
          />

          {/* CONTENT */}
          <RichTextEditor
            label="Template Content"
            name="content"
            watch={watch}
            setValue={setValue}
            errors={errors}
            required
          />
          <Button label="Save Template" buttonType="three" type="submit" />
        </form>
      )}
    </div>
  );
};

export default ManageTemplate;
