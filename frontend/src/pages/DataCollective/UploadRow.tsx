import Button from "../../component/Button/Button";
import styles from "./Collective.module.css";
import { FaFileDownload } from "react-icons/fa";


export type ExportKey = "poHeader" | "poDetail" | "itemDetail";


type UploadRowProps = {
  title: string;
  file: File | null;
  setFile: (file: File | null) => void;
  onImport: () => void;
  loading: boolean;
  exportKey: ExportKey;
  onExport: (key: ExportKey) => void;
};

const UploadRow = ({
  title,
  file,
  setFile,
  onImport,
  loading,
  exportKey,
  onExport,
}: UploadRowProps) => {
  return (
    <div className={styles.section}>
      {/* Title */}
      <h2 className={styles.sectionTitle}>{title}</h2>

      {/* Sample link */}
      <div className={styles.sampleLink}>
        Sample Template{" "}
        <span onClick={() => onExport(exportKey)}>
          <FaFileDownload />
        </span>
      </div>

      {/* Upload Box */}
      <div className={styles.uploadBox}>
        <label className={styles.chooseFile}>
          Choose File
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className={styles.fileName}>
          {file ? file.name : "No file chosen"}
        </div>

        <div className={styles.importBtn}>
          <Button
            label={loading ? "IMPORTING..." : "IMPORT"}
            buttonType="one"
            onClick={onImport}
            disabled={!file || loading}
          />
        </div>
       
        
      </div>
    </div>
  );
};

export default UploadRow;
