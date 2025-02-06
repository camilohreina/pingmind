import {
  getUserByPhone,
  getUserByPhoneAndCode,
  saveResetPasswordCode,
} from "@/db/queries/users";
import { verificationCodeMessage } from "@/lib/infobip";
import { generateVerificationCode } from "@/lib/utils";

export const sendOTPCode = async ({ phone }: { phone: string }) => {
  try {
    const user = await getUserByPhone(phone);

    if (!user) {
      return { status: 400, ok: false, message: "User not found" };
    }

    const code = generateVerificationCode();
    await saveResetPasswordCode(code);
    //await verificationCodeMessage({ phone, code });
    return { status: 200, ok: true, message: "Code sent successfully" };
  } catch (error) {
    return { status: 500, ok: false, message: "Internal server error" };
  }
};

export const verifyCodeResetPassword = async ({
  phone,
  code,
}: {
  phone: string;
  code: string;
}) => {
  try {
    const user = await getUserByPhoneAndCode(phone, code);
    if (user?.reset_password_code === code) {
      return { status: 200, ok: true, message: "Code verified successfully" };
    }

    return { status: 400, ok: false, message: "Invalid code" };
  } catch (error) {
    return { status: 500, ok: false, message: "Internal server error" };
  }
};
