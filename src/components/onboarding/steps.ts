export const STEPS = [
  { id: "cardapio", label: "Cardápio" },
  { id: "horarios", label: "Horários" },
  { id: "divulgar", label: "Divulgar" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export function isStepId(value: string | undefined): value is StepId {
  return STEPS.some((step) => step.id === value);
}

export function firstPendingStep(done: { cardapio: boolean; horarios: boolean }): StepId {
  if (!done.cardapio) return "cardapio";
  if (!done.horarios) return "horarios";
  return "divulgar";
}
