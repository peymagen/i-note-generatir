// import { useState } from "react";
// import { useForm, useWatch, type SubmitHandler, } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { toast } from "react-toastify";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { Controller } from "react-hook-form";
// import Layout from "../../component/Layout/Layout";
// import Button from "../../component/Button/Button";
// import Input from "../../component/Input/Input2";
// import { useLazyGetIndentDateQuery } from "../../store/services/po-header";
// import {useLazyGetByIndentQuery} from '../../store/services/po-details'
// import {useLazyGetByVendorCodeQuery} from '../../store/services/vendor-detail'
// import Page1 from "../../component/Pages/Page1";
// import styles from "./PurchaseOrder.module.css";
// import FormData from "../../component/Form/FormData";
// import {useLazyGetDatabyConQuery} from "../../store/services/mo-detail"  


// // Validation schema
// const schema = yup.object().shape({
//   IndentNo: yup.string().required("Indent Number is required"),
//   OrderDate: yup.string().required("Order Date is required"),
//   templateType: yup.string().required("Template Type is required"),
// });

// const inspectionSchema = yup.object({
//   SequenceNo: yup
//     .string()
//     .required("Sequence Number is required"),

//   EnterDate: yup
//     .string()
//     .required("Enter Date is required"),

//   inspectionRange: yup
//     .array()
//     .of(yup.date().nullable())
//     .required("Inspection range is required")
//     .test(
//       "both-dates-selected",
//       "Please select both From and To dates",
//       (value) => !!value && !!value[0] && !!value[1]
//     )
//     .test(
//       "valid-range",
//       "To date must be after From date",
//       (value) =>
//         !!value &&
//         !!value[0] &&
//         !!value[1] &&
//         value[1] >= value[0]
//     ),

//   inspectedOn: yup
//     .string()
//     .required("Inspected On date is required"),
// });





// function extractBracketValue(consigneeCode: string): string | null {
//   const start = consigneeCode.indexOf("(");
//   const end = consigneeCode.indexOf(")");

//   if (start === -1 || end === -1 || end <= start) return null;

//   return consigneeCode.substring(start + 1, end);
// }



// interface FormData {
//   IndentNo: string;
//   OrderDate: string; 
//   templateType: string;
// }

// interface InspectionData {
//   SequenceNo: string;
//   EnterDate: string;
//   inspectionRange: [Date | null, Date | null]  
//   inspectedOn: string;
// }

// const PurchaseOrder = () => {

//   const [poFound, setPoFound] = useState<boolean>(false);
//   const[poData,setPoData] = useState<any>(null)
//   const [poDetail,setPoDetail] = useState<any>(null)
//   const [indentNo, setIndentNo] = useState<string>('');
//   const [venderCode ,setVendorCode] = useState<string>('')
//   const [vendorData, setVendorData] = useState<any>(null);
//   const[consignee,setConsignee] = useState<any>(null);
//   const[modetail, setModetail] = useState<any>(null);
//   const [combinedData, setCombinedData] = useState<any[]>([]);

//   const [getIndentDate] = useLazyGetIndentDateQuery();
//   const [getByIndent] = useLazyGetByIndentQuery();
//   const [getVendor] = useLazyGetByVendorCodeQuery();
//   const [getMo] = useLazyGetDatabyConQuery();

 

//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//     reset,
//   } = useForm<FormData>({
//     resolver: yupResolver(schema),
//   });

//   const {
//     control: inspectionControl,
//     register: inspectionRegister,
//     handleSubmit: handleInspectionSubmit,
//     formState: { errors: inspectionErrors },
//   } = useForm<InspectionData>({
//     resolver: yupResolver(inspectionSchema) as any, // Temporary type assertion
//     defaultValues: {
//       inspectionRange: [null, null] as [Date | null, Date | null],
//     },
// });


//   const selectedTemplate = useWatch({
//     control,
//     name: "templateType",
//     defaultValue: "",
//   });

//   const inspectionSubmit: SubmitHandler<InspectionData> = async (data) => {
//   console.log("Inspection data:", data);
//   setCombinedData((prev) => {
//     if (!prev.length) return prev;
//     return [{
//       ...prev[0],         
//       userInput: data,     
//     }];
//   });
//   toast.success("Inspection entry saved successfully!");
//   // resetInspection();
// };


// const onSearch = async (data: FormData) => {
//   try {
//     const cleanDate = new Date(data.OrderDate)
//       .toISOString()
//       .split("T")[0];

//     const searchParams = {
//       IndentNo: data.IndentNo,
//       OrderDate: cleanDate,
//     };

//     // ------------------ HEADER ------------------
//     const headerRes = await getIndentDate(searchParams).unwrap();

//     if (!headerRes?.data?.length) {
//       toast.error("PO Header not found");
//       setPoFound(false);
//       return;
//     }

//     const header = headerRes.data[0];
//     setPoData(header);
    
//     const indentNoFromApi = header.IndentNo;
//     console.log("Indent No from API:", indentNoFromApi);
//     console.log("Header data:", header);

//     // ------------------ DETAIL ------------------
//     const detailRes = await getByIndent(indentNoFromApi).unwrap();

//     if (!detailRes?.success || !detailRes.data?.length) {
//       toast.error("PO Details not found");
//       return;
//     }

//     const detail = detailRes.data[0];
//     setPoDetail(detail);
//     console.log("detail", detail);

//     // ------------------ EXTRACT VALUES ------------------
//     const consigneeCode = (extractBracketValue(detail.ConsigneeCode)) as string;
//     const vendorCode = detail.VendorCode;
//     console.log(consigneeCode,venderCode)

//     // ------------------ PARALLEL CALLS ------------------   
//     const [moRes, vendorRes] = await Promise.all([
//       getMo(consigneeCode).unwrap(),
//       getVendor(vendorCode).unwrap(),
//     ]);

//     if (!moRes?.data?.data?.length) {
//       toast.error("MO not found");
//       return;
//     }

//     if (!vendorRes?.data?.data?.length) {
//       toast.error("Vendor not found");
//       return;
//     }

//     const mo = moRes.data.data[0];
//     const vendor = vendorRes.data.data[0];
//     console.log("MO:", mo);
//     console.log("Vendor:", vendor);

//     setModetail(mo);
//     setVendorData(vendor);

//     const currDate = new Date().toISOString().split("T")[0]; 


//     // ------------------ FINAL COMBINE ------------------
//     const combined = [
//       {
//         header,
//         details: detail,
//         vendor,
//         modetail: mo,
//         currDate
//       },
//     ];

//     setCombinedData(combined);
//     setPoFound(true);

//     toast.success("PO loaded successfully!");

//   } catch (error) {
//     console.error(error);
//     toast.error("Something went wrong");
//   }
// };





//   return (
//     <Layout subtitle="Purchase Order" fullWidth>
//       <form className={styles.form} onSubmit={handleSubmit(onSearch)}>
      
//         <Input<FormData>
//           label="Indent No"
//           name="IndentNo"
//           register={register}
//           errors={errors}
//           required
//           fullWidth
//         />

        
//         <Input<FormData>
//           label="Order Date"
//           name="OrderDate"
//           type="date"
//           register={register}
//           errors={errors}
//           required
//           fullWidth
//         />

        
//         <div className={styles.formGroup}>
//           <label className={styles.label}>
//             Template Type <span className={styles.required}>*</span>
//           </label>
//           <select
//             className={styles.input}
//             {...register("templateType")}
//           >
//             <option value="">Select Template Type</option>
//             <option value="page1">Standard Inspection Note (Page 1)</option>
//             <option value="page2">Inspection Certificate</option>
//             <option value="page3">Delivery Note</option>
//           </select>
//           {errors.templateType && (
//             <p className={styles.errorMessage}>{errors.templateType.message}</p>
//           )}
//         </div>

        
//         <div className={styles.buttonWrapper}>
//           <Button type="submit" label="Search" />
//         </div>
//       </form>   

     
//       {/* {selectedTemplate === "page1" && poFound && (
//         <div className={styles.templatePreview}>
//           <Page1 data={combinedData[0]} />
//         </div>
//       )}  */}
//        {poFound && (
//         <div style={{ marginTop: "30px" }}>

//           {/* ---------------- INSPECTION INPUT SECTION ---------------- */}
//            <form
//             className={styles.form}
//             onSubmit={handleInspectionSubmit(inspectionSubmit)}
//           >
//             <Input<InspectionData>
//               label="Sequence No."
//               name="SequenceNo"
//               placeholder="Enter Sequence Number"
//               register={inspectionRegister}
//               fullWidth
//             />

//             <Input<InspectionData>
//               label="Enter Date"
//               name="EnterDate"
//               type="date"
//               register={inspectionRegister}
//               fullWidth
//             />

//             {/* <Input<InspectionData>
//               label="Inspection Offered Date"
//               name="inspectionOfferedOn"
//               type="date"
//               register={inspectionRegister}
//               fullWidth
//             /> */}
//             <div className={styles.formGroup}>
//               <label className={styles.label}>Inspection Offered (From – To)</label>

//               <Controller
//                 name="inspectionRange"
//                 control={inspectionControl}
//                 render={({ field: { value, onChange } }) => (
//                   <DatePicker
//                     selected={value?.[0]}
//                     startDate={value?.[0]}
//                     endDate={value?.[1]}
//                     onChange={(dates) => {
//                       onChange(dates);
//                     }}
//                     selectsRange
//                     isClearable
//                     placeholderText="Select inspection date range"
//                     className={`${styles.input} ${styles.datepickerInput}`}
//                     dateFormat="yyyy/MM/dd"
//                   />
//                 )}
//               />
//             </div>


//             <Input<InspectionData>
//               label="Inspected On"
//               name="inspectedOn"
//               type="date"
//               register={inspectionRegister}
//               fullWidth
//             />

//             <div className={styles.buttonWrapper}>
//               <Button type="submit" label="Save Inspection Entry" />
//             </div>
//           </form>

//           {selectedTemplate === "page1" && poFound && (
//             <div className={styles.templatePreview}>
//               <Page1 data={combinedData[0]} />
//             </div>
//           )} 

          
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default PurchaseOrder;









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
    </Layout>
  );
};

export default PurchaseOrder;
