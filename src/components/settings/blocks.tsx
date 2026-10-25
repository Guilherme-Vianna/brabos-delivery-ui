import type { ComponentType } from "react";
import { BikeIcon, ClockIcon, StoreIcon, UserIcon } from "@/components/ui/icons";
import { SETTINGS_PATH } from "@/lib/auth/constants";

type SettingsBlock = {
  href: string;
  title: string;
  summary: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export const SETTINGS_BLOCKS = {
  store: {
    href: `${SETTINGS_PATH}/loja`,
    title: "Sua loja",
    summary: "Link do cardápio, dados e cores",
    description: "Como os clientes encontram e veem o seu cardápio.",
    icon: StoreIcon,
  },
  operation: {
    href: `${SETTINGS_PATH}/funcionamento`,
    title: "Funcionamento",
    summary: "Horários, pausa e entrega",
    description: "Quando e como você recebe pedidos.",
    icon: ClockIcon,
  },
  team: {
    href: `${SETTINGS_PATH}/equipe`,
    title: "Equipe",
    summary: "Entregadores e convites",
    description: "Quem leva os pedidos até o cliente.",
    icon: BikeIcon,
  },
  account: {
    href: `${SETTINGS_PATH}/conta`,
    title: "Conta",
    summary: "Sair ou excluir a loja",
    description: "Acesso e exclusão da loja.",
    icon: UserIcon,
  },
} satisfies Record<string, SettingsBlock>;
