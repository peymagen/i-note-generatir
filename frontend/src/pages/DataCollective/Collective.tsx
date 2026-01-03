// import { useState } from "react";
// import styles from "./Collective.module.css";
// import PoDetail from "../PoDetail/PoDetail";
// import Poheader from "../PoHeader/PoHeader";
// import ItemDetail from "../itemDetail/itemDetail";
// import Button from "../../component/Button/Button";
// import { useImportPOHeaderMutation } from "../../store/services/po-header";
// import {useImportPODataMutation} from "../../store/services/po-details"
// import {useImportItemDetailsMutation} from "../../store/services/item-details"
// import { toast } from "react-toastify";
// import { exportOnlyHeaders } from "../../utils/exportTemplate";

// type TabKey = "upload" | "ItemDetail" | "PoDetail" | "Poheader";





// const Collective = () => {
//   const [activeTab, setActiveTab] = useState<TabKey>("upload");
//   const [headerFile, setHeaderFile] = useState<File | null>(null);
//   const [detailFile, setDetailFile] = useState<File | null>(null);
//   const [itemFile, setItemFile] = useState<File | null>(null);

//   const [importPoDetail, { isLoading: isLoadingPoDetail }] = useImportPODataMutation();
//   const [importItemDetail, { isLoading: isLoadingItemDetail }] = useImportItemDetailsMutation();
//   const [importExcel, { isLoading }] = useImportPOHeaderMutation();

 
//   const headerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;

//     setHeaderFile(selectedFile);
//   };

//   const detailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;

//     setDetailFile(selectedFile);
//   };

//   const itemFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;

//     setItemFile(selectedFile);
//   };

  
//   const handlePoHeaderImport = async () => {
//     if (!headerFile) {
//       toast.error("Please select a file first");
//       return;
//     }

//     try {

//       await importExcel(headerFile).unwrap();

//       toast.success("Excel imported successfully!");
//       setHeaderFile(null);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error(err.message);
//         toast.error(err.message);
//       } else {
//         console.error(err);
//         toast.error("Failed to import Excel!");
//       }
//   }

//   };

//   const handlePoDetailImport = async()=>{
//     if (!detailFile) {
//       toast.error("Please select a file first");
//       return;
//     }

//     try {

//       await importPoDetail(detailFile).unwrap();

//       toast.success("Excel imported successfully!");
//       setDetailFile(null);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error(err.message);
//         toast.error(err.message);
//       } else {
//         console.error(err);
//         toast.error("Failed to import Excel!");
//       }
//     }

//   }

//   const handleItemDetailImport = async()=>{
//     if (!itemFile) {
//       toast.error("Please select a file first");
//       return;
//     }

//     try {

//       await importItemDetail(itemFile).unwrap();

//       toast.success("Excel imported successfully!");
//       setItemFile(null);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error(err.message);
//         toast.error(err.message);
//       } else {
//         console.error(err);
//         toast.error("Failed to import Excel!");
//       }
//   }

//   }

//   return (
//     <div className={styles.tabsContainer}>
//       {/* TABS */}
//       <div className={styles.tabsHeader}>
//         <button
//           className={`${styles.tabButton} ${activeTab === "upload" ? styles.active : ""}`}
//           onClick={() => setActiveTab("upload")}
//         >
//           Upload
//         </button>

//         <button
//           className={`${styles.tabButton} ${activeTab === "ItemDetail" ? styles.active : ""}`}
//           onClick={() => setActiveTab("ItemDetail")}
//         >
//           ItemDetail
//         </button>

//         <button
//           className={`${styles.tabButton} ${activeTab === "PoDetail" ? styles.active : ""}`}
//           onClick={() => setActiveTab("PoDetail")}
//         >
//           PoDetail
//         </button>

//         <button
//           className={`${styles.tabButton} ${activeTab === "Poheader" ? styles.active : ""}`}
//           onClick={() => setActiveTab("Poheader")}
//         >
//           Poheader
//         </button>
//       </div>

      
//       {activeTab === "upload" && (
//         <div className={styles.container}>
//           <div className={styles.poHeader}>
//             <p>Po Header</p>
//           <input
//             type="file"
//             accept=".xlsx,.xls"
//             onChange={headerFileChange}
//           />

//           <Button
//             label={isLoading ? "Importing..." : "Import"}
//             buttonType="four"
//             onClick={handlePoHeaderImport}
//             loading={isLoading}
//             disabled={!headerFile}
//           />
//           <Button
//             label="Export Template"
//             buttonType="four"
//             onClick={() => exportOnlyHeaders("poHeader")}
//           />
//           </div>


//           <div className={styles.poDetail}>
//             <p>Po Detail</p>
//           <input
//             type="file"
//             accept=".xlsx,.xls"
//             onChange={detailFileChange}
//           />

//           <Button
//             label={isLoadingPoDetail ? "Importing..." : "Import"}
//             buttonType="four"
//             onClick={handlePoDetailImport}
//             loading={isLoadingPoDetail}
//             disabled={!detailFile}
//           />
//           <Button
//             label="Export Template"
//             buttonType="four"
//             onClick={() => exportOnlyHeaders("poDetail")}
//           />
//           </div>


//           <div className={styles.itemDetail}>
//             <p>Item Detail</p>
//           <input
//             type="file"
//             accept=".xlsx,.xls"
//             onChange={itemFileChange}
//           />

//           <Button
//             label={isLoadingItemDetail ? "Importing..." : "Import"}
//             buttonType="four"
//             onClick={handleItemDetailImport}
//             loading={isLoadingItemDetail}
//             disabled={!itemFile}
//           />
//           <Button
//             label="Export Template"
//             buttonType="four"
//             onClick={() => exportOnlyHeaders("itemDetail")}
//           />
//           </div>
          
//         </div>
        
        
//       )}

//       {activeTab === "ItemDetail" && <ItemDetail />}
//       {activeTab === "PoDetail" && <PoDetail />}
//       {activeTab === "Poheader" && <Poheader />}
//     </div>
//   );
// };

// export default Collective;




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
