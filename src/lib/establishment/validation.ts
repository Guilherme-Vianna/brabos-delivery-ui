export type ProfileValues = { name: string; phone: string; address: string; cnpj: string; slug?: string };
export type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/;

export function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCnpj(value: string): boolean {
  const numbers = digits(value).split("").map(Number);
  if (numbers.length !== 14 || new Set(numbers).size === 1) return false;
  for (const size of [12, 13]) {
    const weights = [...Array.from({ length: size - 8 }, (_, index) => size - 7 - index), 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = numbers.slice(0, size).reduce((total, digit, index) => total + digit * weights[index], 0);
    const remainder = sum % 11;
    if (numbers[size] !== (remainder < 2 ? 0 : 11 - remainder)) return false;
  }
  return true;
}

export function maskPhone(value: string): string {
  const numbers = digits(value).slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

export function maskCnpj(value: string): string {
  const numbers = digits(value).slice(0, 14);
  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function validatePhone(value: string): string | undefined {
  const length = digits(value).length;
  return length === 10 || length === 11 ? undefined : "Digite o telefone com DDD, ex.: (11) 98888-7777.";
}

export function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!values.name.trim()) errors.name = "Digite o nome do estabelecimento.";
  const phone = validatePhone(values.phone);
  if (phone) errors.phone = phone;
  if (values.address.trim().length < 5) errors.address = "Digite o endereço completo (rua, número e bairro).";
  if (values.cnpj.trim() && !isValidCnpj(values.cnpj)) errors.cnpj = "CNPJ inválido. Confira os números ou deixe em branco.";
  if (values.slug !== undefined && !SLUG_PATTERN.test(values.slug)) {
    errors.slug = "Use de 3 a 60 letras minúsculas, números ou hífen (ex.: brabos-burguer).";
  }
  return errors;
}
