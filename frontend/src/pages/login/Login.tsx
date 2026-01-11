import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { RootState } from "../../store/store";
import { setTokens } from "../../store/reducers/authReducers";
import { useLoginUserMutation } from "../../store/services/user.api";
import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import AuthLayout from "../../component/Layout/Layout";
import styles from "./Login.module.css";

interface LoginFormValues {
  email: string;
  password: string;
}

const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: "onSubmit",
  });

  


  const onSubmit = async (formData: LoginFormValues) => {
    try {
      console.log(" onSubmit Fired!", formData); 
      const response = await loginUser(formData).unwrap();
      console.log("res",response)
      console.log(" API Response:", response.data.accessToken)
      if (response?.data?.accessToken) {
        dispatch(setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken || '',
          user: response.data.user
        }));
        
        toast.success('Login successful!');
        navigate('/dashboard', { replace: true });
      }
    } catch (error: unknown) {
      const errorMessage = error?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout title="Login" subtitle="Document Generator">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input<LoginFormValues>
          label="Email"
          name="email"
          type="email"
          register={register}
          errors={errors}
          fullWidth
          required
          placeholder="Enter your email"
        />

        <Input<LoginFormValues>
          label="Password"
          name="password"
          type="password"
          register={register}
          errors={errors}
          fullWidth
          required
          placeholder="Enter your password"
        />

        <Button type="submit" label="Login" buttonType="one" loading={isLoading} />
      </form>
    </AuthLayout>
  );
};

export default Login;
