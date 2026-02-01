import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import Modal from "../../component/Modal";
import Input from "../../component/Input/Input2";
import PasswordStrength from "../../component/PasswordStrength";
import Button from "../../component/Button/Button";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useChangePasswordMutation } from "../../store/services/user.api";

interface Props {
  userId: string;
  onClose: () => void;
}

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const schema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "At least one uppercase letter")
    .matches(/[a-z]/, "At least one lowercase letter")
    .matches(/[0-9]/, "At least one number")
    .matches(/[^A-Za-z0-9]/, "At least one special character")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});

const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const newPassword = watch("newPassword") || "";
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const onSubmit = async (data: FormValues) => {
    try {
      // 🔐 CALL API HERE
      await changePassword({ id: Number(user?.id || 0), ...data }).unwrap();

      toast.success("Password changed successfully");
      onClose();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  return (
    <Modal title="Change Password" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Current Password"
          name="currentPassword"
          type="password"
          register={register}
          errors={errors}
        />

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          register={register}
          errors={errors}
        />

        <PasswordStrength password={newPassword} />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          register={register}
          errors={errors}
        />

        <div style={{ marginTop: "1.5rem" }}>
          <Button
            type="submit"
            label={isSubmitting ? "Updating..." : "Update Password"}
            buttonType="one"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
