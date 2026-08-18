import type { SubmitRegistrationResult } from "@/app/(flow)/register/actions";
import type { RegisterFormValues } from "@/lib/validate-register";

export function initBirthdayExperience(
  root: ShadowRoot,
  options: {
    onOpenWish: () => void;
    onRegister: (
      values: RegisterFormValues,
    ) => Promise<SubmitRegistrationResult>;
  },
): () => void;
