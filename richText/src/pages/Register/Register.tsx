
import React from "react";
import { useForm, type FieldErrors, type FieldError } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useRegisterUserMutation } from "../../store/services/user.api";
import { useNavigate } from "react-router-dom";
import Input from "../../component/Input/Input2";
import Button from "../../component/Button/Button";
import AuthLayout from "../../component/Layout/Layout";
import styles from "./Register.module.css";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const [registerUser] = useRegisterUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      if (response?.data) {
        toast.success("Registration successful! Please login.");
        reset();
        navigate("/login");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

        <Input<RegisterFormValues>
          label="Full Name"
          name="name"
          type="text"
          register={register}
          errors={errors as FieldErrors<RegisterFormValues>}
          fullWidth
          required
          placeholder="Enter your full name"
        />

        <Input<RegisterFormValues>
          label="Email"
          name="email"
          type="email"
          register={register}
          errors={errors as FieldErrors<RegisterFormValues>}
          fullWidth
          required
          placeholder="Enter your email"
        />

        <Input<RegisterFormValues>
          label="Password"
          name="password"
          type="password"
          register={register}
          errors={errors as FieldErrors<RegisterFormValues>}
          fullWidth
          required
          placeholder="Enter your password"
        />

        <Input<RegisterFormValues>
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          register={register}
          errors={errors as FieldErrors<RegisterFormValues>}
          fullWidth
          required
          placeholder="Confirm your password"
        />

        <Button
          type="submit"
          label={isSubmitting ? "Creating Account..." : "Register"}
          buttonType="one"
          loading={isSubmitting}
          disabled={isSubmitting}
        />

      </form>
    </AuthLayout>
  );
};

export default Register;
