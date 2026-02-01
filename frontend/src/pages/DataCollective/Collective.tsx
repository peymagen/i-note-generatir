import { useState } from "react";
import styles from "./Collective.module.css";
import UploadRow, { type ExportKey } from "./UploadRow";

import PoDetail from "../PoDetail/PoDetail";
import Poheader from "../PoHeader/PoHeader";
import ItemDetail from "../itemDetail/itemDetail"; 

import { toast } from "react-toastify";
import { exportOnlyHeaders } from "../../utils/exportTemplate";

import { useImportPOHeaderMutation } from "../../store/services/po-header";
import { useImportPODataMutation } from "../../store/services/po-details";
import { useImportItemDetailsMutation } from "../../store/services/item-details";

type TabKey = "Upload" | "Item Detail" | "Po Detail" | "Po header";

const Collective = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("Upload");

  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [detailFile, setDetailFile] = useState<File | null>(null);
  const [itemFile, setItemFile] = useState<File | null>(null);

  const [importHeader, { isLoading: headerLoading }] =
    useImportPOHeaderMutation();
  const [importDetail, { isLoading: detailLoading }] =
    useImportPODataMutation();
  const [importItem, { isLoading: itemLoading }] =
    useImportItemDetailsMutation();


  const createImportHandler =
    (
      file: File | null,
      importFn: (file: File) => Promise<unknown>,
      resetFile: () => void
    ) =>
    async () => {
      if (!file) {
        toast.error("Please select a file first");
        return;
      }

      try {
        await importFn(file);
        toast.success("Excel imported successfully!");
        resetFile();
      } catch (err: unknown) {
        console.error(err);
        toast.error("Failed to import Excel!");
      }
    };

  const UPLOAD_CONFIG: {
    key: ExportKey;
    title: string;
    file: File | null;
    setFile: (f: File | null) => void;
    loading: boolean;
    importFn: (file: File) => Promise<unknown>;
  }[] = [
    {
      key: "poHeader",
      title: "PO Header",
      file: headerFile,
      setFile: setHeaderFile,
      loading: headerLoading,
      importFn: (file) => importHeader(file).unwrap(),
    },
    {
      key: "poDetail",
      title: "PO Detail",
      file: detailFile,
      setFile: setDetailFile,
      loading: detailLoading,
      importFn: (file) => importDetail(file).unwrap(),
    },
    {
      key: "itemDetail",
      title: "Item Detail",
      file: itemFile,
      setFile: setItemFile,
      loading: itemLoading,
      importFn: (file) => importItem(file).unwrap(),
    },
  ];

  return (
    <div className={styles.tabsContainer}>
      
      <div className={styles.tabsHeader}>
        {(["Upload", "Item Detail", "Po Detail", "Po header"] as TabKey[]).map(
          (tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${
                activeTab === tab ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Upload Tab */}
      {activeTab === "Upload" && (
        <div className={styles.container}>
          {UPLOAD_CONFIG.map((cfg) => (
            <UploadRow
              key={cfg.key}
              title={cfg.title}
              file={cfg.file}
              setFile={cfg.setFile}
              loading={cfg.loading}
              exportKey={cfg.key}
              onExport={exportOnlyHeaders}
              onImport={createImportHandler(
                cfg.file,
                cfg.importFn,
                () => cfg.setFile(null)
              )}
            />
          ))}
        </div>
      )}

      {activeTab === "Item Detail" && <ItemDetail />}
      {activeTab === "Po Detail" && <PoDetail />}
      {activeTab === "Po header" && <Poheader />}
    </div>
  );
};

export default Collective;
