import { LoginFormData, SignUpFormData } from "@/schemas/auth.schema";
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
