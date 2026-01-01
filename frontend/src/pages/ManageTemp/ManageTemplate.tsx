import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RichEditor from "../../component/RichEditor/RichEditor";
import { DataTable } from "../../component/DataTable/DataTable";
import styles from "./ManageTemplete.module.css";
import Button from "../../component/Button/Button";
import { useGetPageQuery,useDeletePageMutation } from "../../store/services/page.api";
import { toast } from "react-toastify";

type ViewMode = "list" | "edit" | "new";

interface Page {
  [key: string]: any;
  id: number;
  title: string;
  content?: string;
  created_on: string;
  updated_on: string;
}

const ManageTemplate: React.FC = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [deleterow] = useDeletePageMutation();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  
  const { data, isFetching, isError, error, refetch } = useGetPageQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const stripHtml = (html: string) => html?.replace(/<[^>]*>?/gm, "") || "";

  // Handle mode
  useEffect(() => {
    if (pageId) setViewMode("edit");
    else if (window.location.pathname.includes("/new")) setViewMode("new");
    else setViewMode("list");
  }, [pageId]);

  // Refetch data when switching to list mode
  useEffect(() => {
    if (viewMode === "list") {
      refetch();
    }
  }, [viewMode, refetch]);

  const fetchPages = async (params?: { search?: string; page?: number }) => {
    try {
      // If we have cached data and no params, use it; otherwise refetch
      if (!data?.data) return { data: [], total: 0 };
      
      const pages = (data as any)?.data || (Array.isArray(data) ? data : []);
       console.log("page",pages)
      if (!Array.isArray(pages)) {
        return { data: [], total: 0 };
      }

      // Step 1: SEARCH 
      const searchTerm = params?.search?.toLowerCase() || "";
      let filteredPages = pages;
      if (searchTerm) {
        filteredPages = pages.filter((p: Page) =>
          p.title?.toLowerCase().includes(searchTerm)
        );
      }

      
      const currentPage = params?.page || 1;
      const pageSize = 10;

      const startIndex = (currentPage - 1) * pageSize;
      const paginated = filteredPages.slice(startIndex, startIndex + pageSize);

      
      const transformed = paginated.map((p: Page) => ({
        id: p.id,
        title: stripHtml(p.title || ""),
        created_on: p.created_on || "",
        updated_on: p.updated_on || "",
        rawData: p,
      }));

      return {
        data: transformed,
        total: filteredPages.length, // total rows BEFORE pagination
      };

    } catch (err) {
      console.error("Template Fetch Error:", err);
      toast.error("Failed to load templates. Please try again.");
      return { data: [], total: 0 };
    }
  };


  // Columns (must match transformed keys)
  const columns = [
    { label: "Title", accessor: "title" },
    { label: "Created On", accessor: "created_on" },
    { label: "Updated On", accessor: "updated_on" },
  ];

  // Actions
  const actions = [
    {
      label: "Edit",
      buttonType: "one" ,
      onClick: (row: any) => {
        setViewMode("edit");
        navigate(`/edit/${row.rawData.id}`);
      },
    },
    {
      label: "Delete",
      buttonType: "one" ,
      onClick: async (row: any) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
           try {
          
          await deleterow({ id: row.rawData.id });
         
          refetch();
          toast.success('Template deleted successfully');
        } catch (error) {
          console.error('Error deleting template:', error);
          toast.error('Failed to delete template');
        }
        }
      }
    }
        
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      {viewMode === "list" && (
        <div className={styles.headerContainer}>
          <h1 className={styles.pageTitle}>Manage Templates</h1>
          <div className={styles.btnWrapper}>
            <Button
              label="+ New Template"
              buttonType="three"
              onClick={() => {
                setViewMode("new");
                navigate("/new");
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <p className={styles.error}>
          {(error as any)?.message || "Failed to load templates"}
        </p>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className={styles.tableWrapper}>
          <DataTable<Page>
            fetchData={fetchPages}
            columns={columns}
            actions={actions}
            loading={isFetching}
            isSearch
            isNavigate
            isExport
            hasCheckbox={false}
          />
        </div>
      )}

      {/* EDITOR VIEW */}
      {(viewMode === "edit" || viewMode === "new") && (
        <div className={styles.editorArea}>
          <div className={styles.headerContainer}>
            <h1 className={styles.pageTitle}>
              {viewMode === "edit" ? "Edit Template" : "New Template"}
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

          <RichEditor pageId={pageId ?? ""} />
        </div>
      )}
    </div>
  );
};

export default ManageTemplate;
