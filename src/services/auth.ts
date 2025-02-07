import {
  LoginFormData,
  PhoneFormValues,
  SignUpFormData,
  UpdatePasswordFormData,
  VerificationCodeValues,
} from "@/schemas/auth.schema";
import axios from "axios";
import { signIn } from "next-auth/react";

export const signup = async (data: SignUpFormData) => {
  const response = await axios.post("/api/signup", data);
  return response.data;
};

export const login = async (data: LoginFormData) => {
  const response = await signIn("credentials", {
    redirect: false,
    phone: data.phone,
    password: data.password,
  });
  console.log(response);
  return response;
};

export const sendCodeResetPassword = async (data: PhoneFormValues) => {
  try {
    const { phone } = data;
    const response = await axios.post("/api/reset-password/send-code", {
      phone,
    });
    return response.data;
  } catch (error: any) {
    console.error(error);
    return error.response.data;
  }
};

export const verifyCodeResetPassword = async (data: VerificationCodeValues) => {
  try {
    const { phone, code } = data;
    const response = await axios.post("/api/reset-password/verify-code", {
      phone,
      code,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updatePassword = async (data: UpdatePasswordFormData) => {
  try {
    const { confirmPassword, password, phone } = data;
    const response = await axios.post("/api/reset-password/new-password", {
      phone,
      password,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
