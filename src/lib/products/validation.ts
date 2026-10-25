import { MAX_PRICE, parsePrice } from "@/lib/money";

export type ProductValues = {
  name: string;
  price: string;
  category: string;
  description: string;
  ingredients: string;
  allowsHalf: boolean;
  asksDoneness: boolean;
  featured: boolean;
  images: ProductImage[];
};

export type ProductImage = { key: string; url: string };

export type ProductErrors = Partial<Record<"name" | "price" | "description" | "ingredients" | "category", string>>;

export const PRODUCT_SUGGESTIONS = [
  { name: "X-Burguer", price: 25, category: "Lanches", ingredients: "Pão, hambúrguer 150g, queijo", asks_doneness: true, allows_half: true },
  { name: "X-Bacon", price: 30, category: "Lanches", ingredients: "Pão, hambúrguer 150g, queijo, bacon", asks_doneness: true, allows_half: true },
  { name: "X-Salada", price: 27, category: "Lanches", ingredients: "Pão, hambúrguer 150g, queijo, alface, tomate", asks_doneness: true, allows_half: true },
  { name: "Batata frita", price: 18, category: "Porções", ingredients: "Batata frita crocante 300g", asks_doneness: false, allows_half: false },
  { name: "Refrigerante lata", price: 7, category: "Bebidas", ingredients: "350ml", asks_doneness: false, allows_half: false },
];

export function duplicateMessage(name: string): string {
  return `Já existe um produto chamado “${name.trim()}”. Use outro nome ou edite o existente.`;
}

export function validateProduct(values: ProductValues, otherNames: string[] = []): ProductErrors {
  const errors: ProductErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Digite o nome do produto.";
  else if (name.length > 100) errors.name = "Use até 100 caracteres.";
  else if (otherNames.some((other) => other.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) {
    errors.name = duplicateMessage(name);
  }
  const price = parsePrice(values.price);
  if (price === null) errors.price = "Digite o preço, ex.: 29,90.";
  else if (price > MAX_PRICE) errors.price = "Preço alto demais.";
  if (values.description.length > 500) errors.description = "Use até 500 caracteres.";
  if (values.ingredients.length > 500) errors.ingredients = "Use até 500 caracteres.";
  if (values.category.length > 60) errors.category = "Use até 60 caracteres.";
  return errors;
}
