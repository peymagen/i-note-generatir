import styles from "./TemplatePage.module.css";
import Page1 from "../../component/Pages/Page1";


export default function TemplatePage() {
  const data = {}
  return (
    <div className={styles.pageContainer}>

      <div className={styles.previewArea}>
        <Page1 data={data} />
      </div>


    </div>
  );
}
