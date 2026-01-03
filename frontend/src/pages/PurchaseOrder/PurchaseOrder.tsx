
import { useState } from "react";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import Layout from "../../component/Layout/Layout";
import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import Page1 from "../../component/Pages/Page1";

import { useLazyGetIndentDateQuery } from "../../store/services/po-header";
import { useLazyGetByIndentQuery } from "../../store/services/po-details";
import { useLazyGetByVendorCodeQuery } from "../../store/services/vendor-detail";
import { useLazyGetDatabyConQuery } from "../../store/services/mo-detail";

import styles from "./PurchaseOrder.module.css";
import RichEditor from "../../component/RichEditor/RichEditor";
import { renderToStaticMarkup } from "react-dom/server";

/* ================= VALIDATION ================= */

const searchSchema = yup.object({
  IndentNo: yup.string().required("Indent Number is required"),
  OrderDate: yup.string().required("Order Date is required"),
  templateType: yup.string().required("Template Type is required"),
});

const inspectionSchema = yup.object({
  SequenceNo: yup.string().required("Sequence Number is required"),
  EnterDate: yup.string().required("Enter Date is required"),
  inspectionFrom: yup.string().required("Inspection From date is required"),
  inspectionTo: yup
    .string()
    .required("Inspection To date is required"),
  inspectedOn: yup.string().required("Inspected On date is required"),
});

/* ================= TYPES ================= */

interface SearchForm {
  IndentNo: string;
  OrderDate: string;
  templateType: string;
}

interface InspectionData {
  SequenceNo: string;
  EnterDate: string;
  inspectionFrom: string;
  inspectionTo: string;   
  inspectedOn: string;
}

interface CombinedPOData {
  header: any;
  details: any;
  vendor: any;
  modetail: any;
  currDate: string;
  inspection?: InspectionData;
}


/* ================= UTILS ================= */

function extractBracketValue(value: string): string | null {
  const start = value.indexOf("(");
  const end = value.indexOf(")");
  if (start === -1 || end === -1) return null;
  return value.substring(start + 1, end);
}

/* ================= COMPONENT ================= */

const PurchaseOrder = () => {
  const [poFound, setPoFound] = useState(false);
  const [combinedData, setCombinedData] = useState<CombinedPOData[]>([]);
  const [inspectionFilled, setInspectionFilled] = useState<boolean>(false);
  const [openEditor,setOpenEditor] = useState<boolean>(false)
  const [editorContent,setEditorContent] = useState({
    title: "",
    content: "",
  })

  const [getIndentDate] = useLazyGetIndentDateQuery();
  const [getByIndent] = useLazyGetByIndentQuery();
  const [getVendor] = useLazyGetByVendorCodeQuery();
  const [getMo] = useLazyGetDatabyConQuery();

  /* -------- SEARCH FORM -------- */

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SearchForm>({
    resolver: yupResolver(searchSchema),
  });

  const selectedTemplate = useWatch({
    control,
    name: "templateType",
  });

  /* -------- INSPECTION FORM -------- */

  const {
    register: inspectionRegister,
    handleSubmit: handleInspectionSubmit,
    watch,
    formState: { errors: inspectionErrors },
  } = useForm<InspectionData>({
    resolver: yupResolver(inspectionSchema),
  });
  const inspectionFrom = watch('inspectionFrom');

  /* ================= SEARCH ================= */

  const onSearch: SubmitHandler<SearchForm> = async (data) => {
    try {
      const cleanDate = data.OrderDate; 

      const headerRes = await getIndentDate({
        IndentNo: data.IndentNo,
        OrderDate: cleanDate,
      }).unwrap();

      if (!headerRes?.data?.length) {
        toast.error("PO Header not found");
        return;
      }

      const header = headerRes.data[0];

      const detailRes = await getByIndent(header.IndentNo).unwrap();
      if (!detailRes?.data?.length) {
        toast.error("PO Details not found");
        return;
      }

      const detail = detailRes.data[0];

      const consigneeCode = extractBracketValue(detail.ConsigneeCode);
      const vendorCode = detail.VendorCode;

      const [moRes, vendorRes] = await Promise.all([
        getMo(consigneeCode!).unwrap(),
        getVendor(vendorCode).unwrap(),
      ]);

      const combined: CombinedPOData[] = [
        {
          header,
          details: detail,
          vendor: vendorRes.data.data[0],
          modetail: moRes.data.data[0],
          currDate: new Date().toISOString().split("T")[0],
          inspection: undefined,
        },
      ];

      setCombinedData(combined);
      setPoFound(true);

      toast.success("PO loaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  /* ================= INSPECTION SUBMIT ================= */

  const inspectionSubmit: SubmitHandler<InspectionData> = (data) => {
    setCombinedData((prev) => {
      if (!prev.length) return prev;

      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        inspection: data,
      };

      setInspectionFilled(true);
      return updated;
    });
    const htmlContent = renderToStaticMarkup(
      <Page1 data={{ ...combinedData[0], inspection: data }} />
    );

    setEditorContent({
      title: `Inspection – ${combinedData[0].header.IndentNo}`,
      content: htmlContent,
    });

    setOpenEditor(true);

    toast.success("Inspection entry saved");
  };

   

  /* ================= UI ================= */

  return (
    <Layout subtitle="Purchase Order" fullWidth>
      {/* -------- SEARCH FORM -------- */}
      <form className={styles.form} onSubmit={handleSubmit(onSearch)}>
        <Input<SearchForm>
          label="Indent No"
          name="IndentNo"
          register={register}
          errors={errors}
          fullWidth
        />

        <Input<SearchForm>
          label="Order Date"
          name="OrderDate"
          type="date"
          register={register}
          errors={errors}
          fullWidth
        />

        <select {...register("templateType")} className={styles.input}>
          <option value="">Select Template</option>
          <option value="page1">Standard Inspection Note</option>
        </select>

        <Button type="submit" label="Search" />
      </form>

      {/* -------- INSPECTION FORM -------- */}
      {poFound && (
        <form
          className={styles.form}
          onSubmit={handleInspectionSubmit(inspectionSubmit)}
        >
          <Input<InspectionData>
            label="Sequence No"
            name="SequenceNo"
            register={inspectionRegister}
            errors={inspectionErrors}
            fullWidth
          />

          <Input<InspectionData>
            label="Enter Date"
            name="EnterDate"
            type="date"
            register={inspectionRegister}
            errors={inspectionErrors}
            fullWidth
          />

          <div className={styles.formGroup}>
            <label className={styles.label}>Inspection Offered</label>
            <div className={styles.datePickerWrapper}>
              <Input<InspectionData>
                label="From"
                name="inspectionFrom"
                type="date"
                register={inspectionRegister}
                errors={inspectionErrors}
                fullWidth
              />
              <Input<InspectionData>
                label="To"
                name="inspectionTo"
                type="date"
                register={inspectionRegister}
                errors={inspectionErrors}
                min={inspectionFrom}
                fullWidth
              />
            </div>
          </div>

          <Input<InspectionData>
            label="Inspected On"
            name="inspectedOn"
            type="date"
            register={inspectionRegister}
            errors={inspectionErrors}
            fullWidth
          />

          <Button type="submit" label="Save Inspection Entry" />
        </form>
      )}

   
       {selectedTemplate === "page1" &&
        poFound && 
        inspectionFilled &&
        combinedData.length > 0 && (
          <Page1 data={combinedData[0]} />
        )} 
        {/* {openEditor && (
  <RichEditor
    inline
    initialData={editorContent}
  />
)} */}

    </Layout>
  );
};

export default PurchaseOrder;
