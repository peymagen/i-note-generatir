import React from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import styles from "./Stepper.module.css";
import type { formData, formTwo, StepperState } from "../../types/inote";
import { useLazyGetByVendorCodeQuery } from "../../store/services/vendor-detail";
import { useLazyGetDatabyConQuery } from "../../store/services/mo-detail";
import { useGetInoteQuery } from "../../store/services/i-note";

interface StepTwoProps {
  onNext: (data: Partial<formData>, dbData?: StepperState["info"]) => void;
  onBack: () => void;
  initialValues: formData;
  indentInfo: StepperState["indentInfo"];
  vendorCode: string;
  consigneeCode?: string;
}

// const dateRangeRegex =
//   /^(\d{1,2}\/\d{1,2}\/\d{2,4})-(\d{1,2}\/\d{1,2}\/\d{2,4})$/;

// const dateRangeRegex = /^(\d{1,2})(\s+to\s+\d{1,2})?-(0[1-9]|1[0-2])-\d{2,4}$/;

const dateRangeRegex =
  /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}(?:\s-\s(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4})?$/;

const Schema: yup.ObjectSchema<formTwo> = yup.object({
  sequenceNo: yup.number().typeError("Must be a number").required("Required"),
  date: yup.string().required("Required"),
  InspectedOn: yup.string().required("Required"),

  InspectionOfferedDate: yup
    .string()
    .required("Required")
    .matches(
      dateRangeRegex,
      "Use format DD-MM-YYYY or DD to DD-MM-YYYY (e.g., 14-02-2026 or 18-02-2026 - 20-02-2026)",
    ),
});

const StepTwo: React.FC<StepTwoProps> = ({
  onNext,
  onBack,
  initialValues,
  vendorCode,
  consigneeCode,
}) => {
  const [triggerVendor, { isLoading: isFetching }] =
    useLazyGetByVendorCodeQuery();
  const [triggerConsignee, { isLoading: isFetchingCon }] =
    useLazyGetDatabyConQuery();
  const { data: iNoteData } = useGetInoteQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({
    resolver: yupResolver(Schema) as unknown as Resolver<formData>,
    defaultValues: initialValues,
  });

  const onSubmit: SubmitHandler<formData> = async (data) => {
    const [vendorRes, moRes] = await Promise.all([
      triggerVendor(vendorCode, false).unwrap(),
      triggerConsignee(consigneeCode, false).unwrap(),
    ]);

    if (!vendorRes.data.success) {
      toast.error("Vendor not found");
      return;
    }

    if (!moRes.data.success) {
      toast.error("Mo not found");
      return;
    }
    const dbData = {
      vendor: Array.isArray(vendorRes.data.data[0])
        ? vendorRes.data.data[0]
        : [vendorRes.data.data[0]],
      mo: Array.isArray(moRes.data.data[0])
        ? moRes.data.data[0]
        : [moRes.data.data[0]],
      iNote: {
        iNote: iNoteData.data.iNote,
        id: iNoteData.data.id,
      },
    };

    onNext(data, dbData);
    toast.success("Preparing I-Note editor...");
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h3 className={styles.stepTitle}>Inspection Details</h3>

        <Input
          label="File No"
          name="sequenceNo"
          type="number"
          register={register}
          errors={errors}
        />

        <Input
          label="Indent Date"
          name="date"
          type="date"
          register={register}
          errors={errors}
        />

        <Input
          label="Store offered for inspection on"
          name="InspectedOn"
          type="date"
          register={register}
          errors={errors}
        />
        <Input
          label="Store inspected on"
          name="InspectionOfferedDate"
          type="text"
          placeholder="e.g. DD-MM-YYYY or DD-MM-YYYY-DD-MM-YYYY"
          register={register}
          errors={errors}
        />

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            label="Back"
            onClick={onBack}
            buttonType="three"
          />
          <Button
            type="submit"
            label={isFetching || isFetchingCon ? "Loading..." : "Next"}
            buttonType="three"
          />
        </div>
      </form>
    </div>
  );
};

export default StepTwo;
