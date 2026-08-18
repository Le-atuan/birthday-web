"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { normalizeTimezone } from "@/lib/birthday-schedule";
import {
  type RegisterFormErrors,
  type RegisterFormValues,
  validateRegisterForm,
} from "@/lib/validate-register";

export type SubmitRegistrationResult =
  { success: true } | { success: false; errors: RegisterFormErrors };

export async function submitRegistration(
  values: RegisterFormValues,
): Promise<SubmitRegistrationResult> {
  const errors = validateRegisterForm(values);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const hasValidCoordinates =
    values.destinationLatitude !== null &&
    values.destinationLongitude !== null &&
    Number.isFinite(values.destinationLatitude) &&
    Number.isFinite(values.destinationLongitude) &&
    values.destinationLatitude >= -90 &&
    values.destinationLatitude <= 90 &&
    values.destinationLongitude >= -180 &&
    values.destinationLongitude <= 180;

  const locationAccuracy =
    hasValidCoordinates &&
    values.locationAccuracy !== null &&
    Number.isFinite(values.locationAccuracy) &&
    values.locationAccuracy >= 0
      ? values.locationAccuracy
      : null;

  const locationCapturedAt =
    hasValidCoordinates &&
    values.locationCapturedAt &&
    !Number.isNaN(Date.parse(values.locationCapturedAt))
      ? values.locationCapturedAt
      : null;
  const timezone = normalizeTimezone(values.timezone);

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("users").insert({
      name: values.name,
      dob: values.dob,
      email: values.email,
      phone: values.phone,
      destination_latitude: hasValidCoordinates
        ? values.destinationLatitude
        : null,
      destination_longitude: hasValidCoordinates
        ? values.destinationLongitude
        : null,
      location_accuracy: locationAccuracy,
      location_captured_at: locationCapturedAt,
      timezone,
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
