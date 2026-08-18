"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import {
  type RegisterFormErrors,
  type RegisterFormValues,
  validateRegisterForm,
} from "@/lib/validate-register";

export type SubmitRegistrationResult =
  | { success: true }
  | { success: false; errors: RegisterFormErrors };

export async function submitRegistration(
  values: RegisterFormValues
): Promise<SubmitRegistrationResult> {
  const errors = validateRegisterForm(values);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("users").insert({
      name: values.name,
      dob: values.dob,
      email: values.email,
      phone: values.phone,
    });

    if (error) {
      return {
        success: false,
        errors: { email: "Không thể lưu thông tin. Vui lòng thử lại." },
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      errors: { email: "Không thể lưu thông tin. Vui lòng thử lại." },
    };
  }
}
