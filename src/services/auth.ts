import { SignUpFormData } from "@/schemas/auth.schema";
import axios from "axios";

export const signup = async (data: SignUpFormData) => {
  const response = await axios.post("/api/signup", data);
  return response.data;
};
