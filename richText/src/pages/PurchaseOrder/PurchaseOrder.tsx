import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import Layout from "../../component/Layout/Layout";
import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import { useLazyGetIndentDateQuery } from "../../store/services/po-header";
import {useLazyGetByIndentQuery} from '../../store/services/po-details'
import {useLazyGetByVendorCodeQuery} from '../../store/services/vendor-detail'
import Page1 from "../../component/Pages/Page1";
import styles from "./PurchaseOrder.module.css";
import FormData from "../../component/Form/FormData";
import {useLazyGetDatabyConQuery} from "../../store/services/mo-detail"  


// Validation schema
const schema = yup.object().shape({
  IndentNo: yup.string().required("Indent Number is required"),
  OrderDate: yup.string().required("Order Date is required"),
  templateType: yup.string().required("Template Type is required"),
});



function extractBracketValue(consigneeCode: string): string | null {
  const start = consigneeCode.indexOf("(");
  const end = consigneeCode.indexOf(")");

  if (start === -1 || end === -1 || end <= start) return null;

  return consigneeCode.substring(start + 1, end);
}



interface FormData {
  IndentNo: string;
  OrderDate: string;
  templateType: string;
}

const PurchaseOrder = () => {

  const [poFound, setPoFound] = useState<boolean>(false);
  const[poData,setPoData] = useState<any>(null)
  const [poDetail,setPoDetail] = useState<any>(null)
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [indentNo, setIndentNo] = useState<string>('');
  const [venderCode ,setVendorCode] = useState<string>('')
  const [vendorData, setVendorData] = useState<any>(null);
  const[consignee,setConsignee] = useState<any>(null);
  const[modetail, setModetail] = useState<any>(null);

  // const { data: indentData, refetch: refetchIndent } = useGetByIndentQuery(
  //   indentNo,
  //   { skip: !indentNo }
  // );
  // const [data:headerRes, refetch:getIndentDate] = useGetIndentDateQuery(
  //   searchParams
  // );
  // const { data: vendorResponse, refetch: fetchVendor } = useGetByVendorCodeQuery(
  //   venderCode,
  //   { skip: !venderCode }
  // );
  // const {data: moResposnse, refetch: fetchMo} = useGetDatabyConQuery(
  //   consignee,
  //   {skip: !consignee}
  // )


  const [getIndentDate] = useLazyGetIndentDateQuery();
  const [getByIndent] = useLazyGetByIndentQuery();
  const [getVendor] = useLazyGetByVendorCodeQuery();
  const [getMo] = useLazyGetDatabyConQuery();

 

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });


  const selectedTemplate = useWatch({
    control,
    name: "templateType",
    defaultValue: "",
  });


const onSubmit = async (data: FormData) => {
  try {
    const cleanDate = new Date(data.OrderDate)
      .toISOString()
      .split("T")[0];

    const searchParams = {
      IndentNo: data.IndentNo,
      OrderDate: cleanDate,
    };

    // ------------------ HEADER ------------------
    const headerRes = await getIndentDate(searchParams).unwrap();

    if (!headerRes?.data?.length) {
      toast.error("PO Header not found");
      setPoFound(false);
      return;
    }

    const header = headerRes.data[0];
    setPoData(header);
    
    const indentNoFromApi = header.IndentNo;
    console.log("Indent No from API:", indentNoFromApi);
    console.log("Header data:", header);

    // ------------------ DETAIL ------------------
    const detailRes = await getByIndent(indentNoFromApi).unwrap();

    if (!detailRes?.success || !detailRes.data?.length) {
      toast.error("PO Details not found");
      return;
    }

    const detail = detailRes.data[0];
    setPoDetail(detail);
    console.log("detail", detail);

    // ------------------ EXTRACT VALUES ------------------
    const consigneeCode = (extractBracketValue(detail.ConsigneeCode)) as string;
    const vendorCode = detail.VendorCode;
    console.log(consigneeCode,venderCode)

    // ------------------ PARALLEL CALLS ------------------   
    const [moRes, vendorRes] = await Promise.all([
      getMo(consigneeCode).unwrap(),
      getVendor(vendorCode).unwrap(),
    ]);

    if (!moRes?.data?.data?.length) {
      toast.error("MO not found");
      return;
    }

    if (!vendorRes?.data?.data?.length) {
      toast.error("Vendor not found");
      return;
    }

    const mo = moRes.data.data[0];
    const vendor = vendorRes.data.data[0];
    console.log("MO:", mo);
    console.log("Vendor:", vendor);

    setModetail(mo);
    setVendorData(vendor);

    const currDate = new Date().toISOString().split("T")[0]; 


    // ------------------ FINAL COMBINE ------------------
    const combined = [
      {
        header,
        details: detail,
        vendor,
        modetail: mo,
        currDate
      },
    ];

    setCombinedData(combined);
    setPoFound(true);

    toast.success("PO loaded successfully!");

  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};





  return (
    <Layout subtitle="Purchase Order" fullWidth>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      
        <Input<FormData>
          label="Indent No"
          name="IndentNo"
          register={register}
          errors={errors}
          required
          fullWidth
        />

        
        <Input<FormData>
          label="Order Date"
          name="OrderDate"
          type="date"
          register={register}
          errors={errors}
          required
          fullWidth
        />

        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Template Type <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.input}
            {...register("templateType")}
          >
            <option value="">Select Template Type</option>
            <option value="page1">Standard Inspection Note (Page 1)</option>
            <option value="page2">Inspection Certificate</option>
            <option value="page3">Delivery Note</option>
          </select>
          {errors.templateType && (
            <p className={styles.errorMessage}>{errors.templateType.message}</p>
          )}
        </div>

        
        <div className={styles.buttonWrapper}>
          <Button type="submit" label="Search" />
        </div>
        {/* <Page1 data= {FormData}/> */}
      </form>   

     
      {selectedTemplate === "page1" && poFound && (
        <div className={styles.templatePreview}>
          <Page1 data={combinedData[0]} />
        </div>
      )} 
       {poFound && (
        <div style={{ marginTop: "30px" }}>

          {/* ---------------- INSPECTION INPUT SECTION ---------------- */}
          <div className={styles.card}>
            <h3>Inspection Details</h3>

            <Input
              label="Inspection Code"
              name="InspectionCode"
              placeholder="Enter Inspection Code"
              fullWidth
            />

            <Input
              label="Inspection Offered On"
              name="OfferedOn"
              type="date"
              fullWidth
            />

            <Input
              label="Inspected On"
              name="InspectedOn"
              type="date"
              fullWidth
            />

            <Input
              label="Sequence No."
              name="SequenceNo"
              placeholder="Enter Sequence Number"
              fullWidth
            />
          </div>

          {/* ---------------- SAVE BUTTON ---------------- */}
          <div className={styles.buttonWrapper}>
            <Button label="Save Inspection Entry" />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PurchaseOrder;