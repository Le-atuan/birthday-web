import { DateTime } from "luxon";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VN_PHONE_REGEX = /^(0|\+84)\d{9,10}$/;
const MIN_AGE_YEARS = 1;
const MAX_AGE_YEARS = 120;

export type RegisterFormValues = {
  name: string;
  dob: string;
  email: string;
  phone: string;
};

export type RegisterFormErrors = Partial<
  Record<"name" | "dob" | "email" | "phone", string>
>;

export function validateRegisterForm(
  values: RegisterFormValues
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Vui lòng nhập tên của bạn";
  }

  if (!values.dob) {
    errors.dob = "Vui lòng nhập ngày sinh";
  } else {
    const dob = DateTime.fromISO(values.dob);
    if (!dob.isValid) {
      errors.dob = "Ngày sinh không hợp lệ";
    } else if (dob > DateTime.now()) {
      errors.dob = "Ngày sinh phải ở trong quá khứ";
    } else {
      const age = DateTime.now().diff(dob, "years").years;
      if (age < MIN_AGE_YEARS || age > MAX_AGE_YEARS) {
        errors.dob = "Tuổi không hợp lệ";
      }
    }
  }

  if (!values.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Email không hợp lệ";
  }

  // if (!values.phone.trim()) {
  //   errors.phone = "Vui lòng nhập số điện thoại";
  // } else if (!VN_PHONE_REGEX.test(values.phone)) {
  //   errors.phone = "Số điện thoại không hợp lệ";
  // }

  return errors;
}
