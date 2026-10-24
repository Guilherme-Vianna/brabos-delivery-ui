"use client";

import { registerStaffPushAction } from "@/lib/push/actions";
import { EnablePushButton } from "./enable-push-button";

export function OwnerPushButton() {
  return <EnablePushButton register={(token) => registerStaffPushAction(token, "owner")} label="Avisar novos pedidos" />;
}

export function CourierPushButton() {
  return <EnablePushButton register={(token) => registerStaffPushAction(token, "courier")} label="Avisar novas entregas" />;
}
