"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { submitRegistration } from "@/app/(flow)/register/actions";
import { useAppStore } from "@/store/app-store";
import {
  type RegisterFormErrors,
  type RegisterFormValues,
  validateRegisterForm,
} from "@/lib/validate-register";
import styles from "@/components/birthday-card.module.css";

const EMPTY_VALUES: RegisterFormValues = {
  name: "",
  dob: "",
  email: "",
  phone: "",
};
type FieldName = keyof RegisterFormValues;

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [values, setValues] = useState<RegisterFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: FieldName, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    if (errors[field])
      setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await submitRegistration(values);
    setIsSubmitting(false);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    setUser(values);
    router.push("/permission");
  }

  return (
    <section className={styles.welcome} aria-labelledby="register-title">
      <div className={styles.paperGlow} aria-hidden="true" />
      <div className={styles.welcomeCard}>
        <p className={styles.welcomeEyebrow}>A little surprise for you</p>
        <h1 id="register-title" className={styles.welcomeTitle}>
          Trước khi mở quà...
        </h1>
        <p className={styles.welcomeIntro}>
          Hãy để lại một chút thông tin để tấm thiệp biết người đặc biệt hôm nay
          là ai nhé.
        </p>

        <form className={styles.guestForm} onSubmit={handleSubmit} noValidate>
          <FormField
            label="Họ và tên"
            name="name"
            autoComplete="name"
            placeholder="Nguyễn Minh Anh"
            value={values.name}
            error={errors.name}
            onChange={updateField}
            wide
            required
          />
          <FormField
            label="Ngày sinh"
            name="dob"
            type="date"
            autoComplete="bday"
            value={values.dob}
            error={errors.dob}
            onChange={updateField}
            required
          />
          <FormField
            label="Số điện thoại (không bắt buộc)"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="09xx xxx xxx"
            value={values.phone}
            error={errors.phone}
            onChange={updateField}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ban@email.com"
            value={values.email}
            error={errors.email}
            onChange={updateField}
            wide
            required
          />
          <button
            className={styles.enterButton}
            type="submit"
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting ? "Đang lưu thông tin…" : "Bước vào điều bất ngờ"}
            </span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className={styles.privacyNote}>
          Thông tin được lưu an toàn để cá nhân hoá tấm thiệp và gửi lời nhắc
          sinh nhật cho bạn.
        </p>
      </div>
    </section>
  );
}

function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  value,
  error,
  onChange,
  wide = false,
  required = false,
}: {
  label: string;
  name: FieldName;
  type?: string;
  autoComplete?: string;
  inputMode?: "tel";
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (field: FieldName, value: string) => void;
  wide?: boolean;
  required?: boolean;
}) {
  const errorId = `${name}-error`;
  return (
    <label className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {error && (
        <small id={errorId} className={styles.fieldError} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
