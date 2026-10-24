"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import type { Order } from "@/lib/api/types";
import { STORE_PATH } from "@/lib/auth/constants";
import { listMyStoreOrdersAction } from "@/lib/customer/actions";
import { deviceToken } from "@/lib/customer/device";
import { formatPrice } from "@/lib/money";

export function MyRecentOrders({ slug }: { slug: string }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    listMyStoreOrdersAction(slug, deviceToken()).then((items) => {
      if (active) setOrders(items.filter((order) => order.status === "placed" || order.status === "accepted"));
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (orders.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-col gap-2" aria-label="Pedidos em andamento">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`${STORE_PATH}/${slug}/pedido/${order.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 font-medium text-on-primary"
          >
            <span>
              Pedido #{order.number} {order.status === "placed" ? "aguardando a loja" : "a caminho"} · {formatPrice(order.total)}
            </span>
            <ChevronRightIcon />
          </Link>
        </li>
      ))}
    </ul>
  );
}
