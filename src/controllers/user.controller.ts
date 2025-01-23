import { dbCreateUser, getUserByPhone } from "@/db/queries/users";
import { ValidationError } from "@/lib/error";
import { getTimeZoneFromCountryCode } from "@/lib/utils";
import { SignUpFormData } from "@/schemas/auth.schema";
import { hash } from "bcrypt";

export const createUser = async (data: SignUpFormData) => {
  const { name, phone, password, country } = data;
  try {
    // Verify if the user already exists
    const existingUser = await getUserByPhone(phone);
    console.log(existingUser);
    if (existingUser) {
      throw new ValidationError("User already exists");
    }
    // Hash the password
    const hashedPassword = await hash(password, 10);
    const timezone = getTimeZoneFromCountryCode(country);

    // Create the user
    await dbCreateUser({
      id: crypto.randomUUID(),
      name,
      phone,
      password: hashedPassword,
      timezone
    });

    return { name, phone };
  } catch (error) {
    throw error;
  }
};
