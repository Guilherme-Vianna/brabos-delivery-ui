"use server";

import { refresh } from "next/cache";
import { apiStatus, handleCommonErrors, requireSession, UNAVAILABLE, type ActionResult } from "@/lib/actions";
import { createProduct, deleteProduct, requestUpload, updateProduct, type ProductInput } from "@/lib/api/owner";
import type { Upload } from "@/lib/api/types";
import { parsePrice } from "@/lib/money";
import { duplicateMessage, validateProduct, type ProductErrors, type ProductValues } from "./validation";

export type SaveProductResult = { ok: true } | { ok: false; fieldErrors: ProductErrors; formError: string | null };

export async function saveProductAction(productId: string | null, values: ProductValues): Promise<SaveProductResult> {
  await requireSession();
  const fieldErrors = validateProduct(values);
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors, formError: null };
  const payload: ProductInput = {
    name: values.name.trim(),
    price: parsePrice(values.price) ?? 0,
    category: values.category.trim(),
    description: values.description.trim(),
    ingredients: values.ingredients.trim(),
    allows_half: values.allowsHalf,
    asks_doneness: values.asksDoneness,
    image_key: values.imageKey,
  };
  try {
    if (productId) await updateProduct(productId, payload);
    else await createProduct(payload);
  } catch (error) {
    handleCommonErrors(error);
    const status = apiStatus(error);
    if (status === 409) return { ok: false, fieldErrors: { name: duplicateMessage(values.name) }, formError: null };
    if (status === 404) return { ok: false, fieldErrors: {}, formError: "Este produto não existe mais. Feche e atualize a página." };
    if (status === 422 && values.imageKey) {
      return { ok: false, fieldErrors: {}, formError: "A foto não pôde ser usada. Remova a foto e tente salvar de novo." };
    }
    return { ok: false, fieldErrors: {}, formError: UNAVAILABLE };
  }
  refresh();
  return { ok: true };
}

export async function quickAddProductAction(payload: ProductInput): Promise<ActionResult> {
  await requireSession();
  try {
    await createProduct(payload);
  } catch (error) {
    handleCommonErrors(error);
    return { ok: false, error: apiStatus(error) === 409 ? duplicateMessage(payload.name ?? "") : UNAVAILABLE };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function setProductActiveAction(productId: string, active: boolean): Promise<ActionResult> {
  await requireSession();
  try {
    await updateProduct(productId, { active });
  } catch (error) {
    handleCommonErrors(error);
    return { ok: false, error: "Não foi possível mudar agora. Tente de novo." };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  await requireSession();
  try {
    await deleteProduct(productId);
  } catch (error) {
    handleCommonErrors(error);
    if (apiStatus(error) === 409) {
      return {
        ok: false,
        error: "Este produto já aparece em pedidos, então não pode ser excluído. Desative-o para escondê-lo do cardápio.",
      };
    }
    return { ok: false, error: "Não foi possível excluir agora. Tente de novo em instantes." };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function requestImageUploadAction(
  kind: "product" | "logo",
  contentType: string,
  size: number,
): Promise<ActionResult<Upload>> {
  await requireSession();
  try {
    return { ok: true, data: await requestUpload(kind, contentType, size) };
  } catch (error) {
    handleCommonErrors(error);
    if (apiStatus(error) === 503) {
      return { ok: false, error: "O envio de fotos ainda não foi configurado no servidor (Google Cloud Storage ou R2)." };
    }
    if (apiStatus(error) === 422) return { ok: false, error: "Use uma imagem JPG, PNG ou WebP de até 5 MB." };
    return { ok: false, error: "Não foi possível enviar a foto agora. Tente de novo." };
  }
}
