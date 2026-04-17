export const ESSENTIAL_DOCTOR_LIMIT = 3;

export const getDoctorLimitByPlan = (plan?: string | null) => {
  if (plan === "essential") {
    return ESSENTIAL_DOCTOR_LIMIT;
  }

  return 0;
};
