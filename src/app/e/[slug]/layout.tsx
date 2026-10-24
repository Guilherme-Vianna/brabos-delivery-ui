import { Suspense } from "react";
import { getStore } from "@/lib/api/public";
import { storeTheme } from "@/lib/color";

export default function StoreLayout({ children, params }: LayoutProps<"/e/[slug]">) {
  return (
    <Suspense fallback={<div className="flex flex-1 flex-col">{children}</div>}>
      <ThemedStore params={params}>{children}</ThemedStore>
    </Suspense>
  );
}

async function ThemedStore({ children, params }: LayoutProps<"/e/[slug]">) {
  const { slug } = await params;
  const store = await getStore(slug).catch(() => null);
  return (
    <div className="flex flex-1 flex-col" style={store ? storeTheme(store.primary_color, store.accent_color) : undefined}>
      {children}
    </div>
  );
}
