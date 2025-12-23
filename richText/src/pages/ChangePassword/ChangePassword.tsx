import React from "react";
import Button from "../../component/Button/Button";
import styles from "./ChangePassward.module.css";
import AuthLayout from "../../component/Layout/Layout";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "../../component/Input/Input2";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useChangePasswordMutation } from "../../store/services/user.api";

type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .notOneOf([yup.ref("currentPassword")], "New password must be different"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

const ChangePassword: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
    mode: "onSubmit",
  });

  const submitHandler = async (data: ChangePasswordFormValues) => {
    if (!user?.id) {
      toast.error("Login required");
      return;
    }

    try {
      const res = await changePassword({
        id: Number(user.id),
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      toast.success("Password changed successfully!");
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Current password is incorrect");
    }
  };

  return (
    <AuthLayout subtitle="Change Password" fullWidth>
      <form onSubmit={handleSubmit(submitHandler)} className={styles.form}>

        <Input<ChangePasswordFormValues>
          label="Current Password"
          name="currentPassword"
          type="password"
          register={register}
          errors={errors as any} // TS safe
          fullWidth
          required
          placeholder="Enter current password"
        />

        <Input<ChangePasswordFormValues>
          label="New Password"
          name="newPassword"
          type="password"
          register={register}
          errors={errors as any}
          fullWidth
          required
          placeholder="Enter new password"
        />

        <Input<ChangePasswordFormValues>
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          register={register}
          errors={errors as any}
          fullWidth
          required
          placeholder="Confirm new password"
        />

        <Button
          label={isSubmitting ? "Changing..." : "Change Password"}
          type="submit" // ✅ FIX: proper submit works now
          buttonType="one"
          loading={isLoading}
          disabled={isSubmitting}
        />

      </form>
    </AuthLayout>
  );
};

export default ChangePassword;
