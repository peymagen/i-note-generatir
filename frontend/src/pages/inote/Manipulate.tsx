import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import { 
  useCreteUpdateInoteMutation, 
  useGetLastInoteQuery 
} from "../../store/services/i-note";
import type { iNote } from '../../types/inote';
import styles from './Manipulate.module.css'


const Schema: yup.ObjectSchema<iNote> = yup.object({
  iNote: yup.number()
    .typeError('Must be a number')
    .required("I-Note number is required")
    .min(1, "Must be greater than 0"),
  id: yup.number().optional()
});

interface Props {
  onClose?: () => void;
}

const Manipulate: React.FC<Props> = ({ onClose }) => {
  const { data: currentData, isLoading: isFetching } = useGetLastInoteQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const [updateInote, { isLoading: isUpdating }] = useCreteUpdateInoteMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<iNote>({
    resolver: yupResolver(Schema),
    defaultValues: {
      iNote: 0,
    },
  });

  useEffect(() => {
    if (currentData) {
     
      const actualData = (currentData as { data?: iNote}).data || currentData;

      const iNoteValue = actualData?.iNote;
      const idValue = actualData?.id;

      // 3. Set values if they exist
      if (iNoteValue !== undefined && iNoteValue !== null) {
        setValue("iNote", Number(iNoteValue), { 
          shouldValidate: true, 
          shouldDirty: true 
        });
      }

      if (idValue !== undefined && idValue !== null) {
         setValue("id", Number(idValue));
      }
    }
  }, [currentData, setValue]);

  const onSubmit: SubmitHandler<iNote> = async (formData) => {
    try {
      const res = await updateInote(formData).unwrap();
      if(res) {
        toast.success("Current I-Note Sequence Updated");
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update sequence");
    }
  };

  if (isFetching) {
    return (
      <div className={styles.loadingContainer}>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>
        Update Sequence
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrapper}>
        <div className={styles.row}>
          <Input
            label="Current I-Note Number"
            name="iNote"  
            type="number"
            placeholder="I-Note Number"
            register={register}
            errors={errors} 
          />
        </div>

        <div className={styles.btnRow}>
          <Button 
            label="Cancel" 
            type="button" 
            buttonType="three" 
            onClick={onClose}
            disabled={isUpdating}
          />
          <Button 
            label="Update" 
            type="submit" 
            loading={isUpdating}
            buttonType="three"
          />
        </div>
      </form>
    </div>
  );
};

export default Manipulate;