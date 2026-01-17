import React from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import styles from "./Stepper.module.css";
import type { formData, formTwo, StepperState } from "../../types/inote";
import {useLazyGetByVendorCodeQuery} from"../../store/services/vendor-detail"
import {useLazyGetDatabyConQuery} from "../../store/services/mo-detail"
import {useGetInoteQuery} from "../../store/services/i-note"

interface StepTwoProps {
  onNext: (data: Partial<formData>,
    dbData?: StepperState["info"] 
  ) => void;
  onBack: () => void;
  initialValues: formData;
  indentInfo: StepperState["indentInfo"];
  vendorCode:string,
  consigneeCode?:string
}


const dateRangeRegex =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4})-(\d{1,2}\/\d{1,2}\/\d{2,4})$/;

const Schema: yup.ObjectSchema<formTwo> = yup.object({
  sequenceNo: yup.number().typeError("Must be a number").required("Required"),
  date: yup.string().required("Required"),
  InspectedOn: yup.string().required("Required"),

  InspectionOfferedDate: yup
    .string()
    .required("Required")
    .matches(
      dateRangeRegex,
      "Use format DD/MM/YY-DD/MM/YY (e.g., 02/1/26-01/02/26)"
    ),
});

const StepTwo: React.FC<StepTwoProps> = ({
  onNext,
  onBack,
  initialValues,
  indentInfo,
  vendorCode,
  consigneeCode,
}) => {
  const headerData = indentInfo.header[0];
  console.log("Header Data in Step Two:", headerData);
  console.log("Initial Values in Step Two:", initialValues);
  console.log("Indent Info in Step Two:", indentInfo);

  const [triggerVendor, { isLoading: isFetching }] = useLazyGetByVendorCodeQuery();
  const [triggerConsignee, { isLoading: isFetchingCon }] = useLazyGetDatabyConQuery();
  const { data: iNoteData } = useGetInoteQuery(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({
    resolver: yupResolver(Schema) as unknown as Resolver<formData>,
    defaultValues: initialValues,
  });

  // console.log("INOTE:",iNoteData);
  // const some = iNoteData?.data.iNote
  // console.log(some);

  const onSubmit: SubmitHandler<formData> = async (data) => {
    const [vendorRes,moRes] = await Promise.all([
      triggerVendor(vendorCode).unwrap(),
      triggerConsignee(consigneeCode).unwrap(),
    ]);
    console.log("Vendor Data Response:", vendorRes.data.data[0]); 
    console.log("Consignee Data Response:", moRes.data.data[0]);
    console.log("INOTE DATA",iNoteData.data.iNote);
    const dbData = {
      vendor:Array.isArray(vendorRes.data.data[0]) ? vendorRes.data.data[0] : [vendorRes.data.data[0]],
      // mo:moRes.data.data[0],
      mo:Array.isArray(moRes.data.data[0]) ? moRes.data.data[0] : [moRes.data.data[0]],
      iNote: {
        iNote: iNoteData.data.iNote,
        id: iNoteData.data.id
      }
    };
    onNext(data, dbData);
    toast.success("Preparing I-Note editor...");
   
  };

  return (
    <div className={styles.formContainer}>
      {/* {headerData && (
        <div className={styles.infoBox}>
          <h4>Inspection Basis</h4>
          <p><strong>Vendor:</strong> {headerData.Name}</p>
          <p><strong>PO No:</strong> {initialValues.IndentNo}</p>
        </div>
      )} */}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h3 className={styles.stepTitle}>Inspection Details</h3>

        <Input
          label="Sequence No"
          name="sequenceNo"
          type="number"
          register={register}
          errors={errors}
        />

        <Input
          label="Inspection Date"
          name="date"
          type="date"
          register={register}
          errors={errors}
        />

        <Input
          label="Offered Date (Range)"
          name="InspectionOfferedDate"
          type="text"
          placeholder="e.g. 02/1/26-01/02/26"
          register={register}
          errors={errors}
        />

        <Input
          label="Inspected On"
          name="InspectedOn"
          type="date"
          register={register}
          errors={errors}
        />

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            label="Back"
            onClick={onBack}
            buttonType="one"
          />
          <Button type="submit" label={isFetching || isFetchingCon ? "Loading..." : "Next"} buttonType="one" />
        </div>
      </form>
    </div>
  );
};

export default StepTwo;
