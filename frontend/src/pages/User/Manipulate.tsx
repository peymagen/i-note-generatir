import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import Input from "../../component/Input/Input2";
import Button from "../../component/Button/Button";
import PasswordStrength from "../../component/PasswordStrength";
import {
  useRegisterUserMutation,
  useUpdateUserMutation,
} from "../../store/services/user.api";
import { useForm, type SubmitHandler } from "react-hook-form";

import type { IUser, User } from "../../types/user";

interface Props {
  mode: "create" | "edit";
  defaultValues?: IUser;
  onSubmitSuccess: () => void;
}

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().when("$mode", {
    is: "create",
    then: (s) =>
      s
        .min(8)
        .matches(/[A-Z]/, "Uppercase required")
        .matches(/[0-9]/, "Number required")
        .matches(/[^A-Za-z0-9]/, "Symbol required")
        .required(),
    otherwise: (s) => s.notRequired(),
  }),
});

const Register: React.FC<Props> = ({
  mode,
  defaultValues,
  onSubmitSuccess,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    context: { mode },
  });

  const password = watch("password") || "";

  const [registerUser] = useRegisterUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const onSubmit: SubmitHandler<User> = async (data) => {
    try {
      // call create or update API here
      try {
        const mutation = mode === "create" ? registerUser : updateUser;
        const payload: IUser = {
          name: data.name,
          email: data.email,
          password: data.password || "",
        };
        if (mode === "edit") {
          payload.id = defaultValues?.id;
        }

        const response = await mutation(payload).unwrap();

        if (response?.data) {
          toast.success(mode === "create" ? "User created" : "User updated");
        }
      } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error?.data?.message || "Failed. Please try again.");
      }

      onSubmitSuccess();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Name"
        name="name"
        register={register}
        errors={errors}
        required
      />
      <Input
        label="Email"
        name="email"
        register={register}
        errors={errors}
        required
      />

      {mode === "create" && (
        <>
          <Input
            label="Password"
            name="password"
            type="password"
            register={register}
            errors={errors}
            required
          />
          <PasswordStrength password={password} />
        </>
      )}

      <Button
        type="submit"
        label={isSubmitting ? "Saving..." : "Submit"}
        buttonType="one"
      />
    </form>
  );
};

export default Register;
