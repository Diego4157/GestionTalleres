import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailManager from "./OrderDetailManager";
import { getInventory } from "@/app/actions/inventory";
import { auth } from "@/auth";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: true,
      vehicle: true,
      mechanic: true,
      invoice: true,
      parts: { include: { part: true } }
    }
  });

  if (!order) notFound();

  const inventoryRes = await getInventory();
  const inventory = inventoryRes.success && inventoryRes.data ? inventoryRes.data : [];

  const session = await auth();
  const role = (session?.user as any)?.role || "RECEPTIONIST";

  return (
    <div className="animate-fade-in">
      <OrderDetailManager order={order as any} inventory={inventory} role={role} />
    </div>
  );
}
