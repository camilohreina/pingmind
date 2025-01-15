import { dbCreateUser, dbExistingUser } from "@/db/queries/users";
import { ValidationError } from "@/lib/error";
import { SignUpFormData } from "@/schemas/auth.schema";
import { hash } from "bcrypt";

export const createUser = async (data: SignUpFormData) => {
  const { name, phone, password } = data;
  try {
    // Verify if the user already exists
    const [existingUser] = await dbExistingUser(phone);
    console.log(existingUser);
    if (existingUser) {
      throw new ValidationError("User already exists");
    }
    // Hash the password
    const hashedPassword = await hash(password, 17);

    // Create the user
    await dbCreateUser({
      id: crypto.randomUUID(),
      name,
      phone,
      password: hashedPassword,
    });

    return { name, phone };
  } catch (error) {
    throw error;
  }
};
