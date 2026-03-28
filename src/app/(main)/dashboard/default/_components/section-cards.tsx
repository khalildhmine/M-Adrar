import { Banknote, Package, Sparkles, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type DashboardSectionStats = {
  totalOrders: number;
  pendingOrders: number;
  successOrders: number;
  revenueCents: number;
  ordersWithPromo: number;
  totalDiscountCents: number;
  productsTotal: number;
  productsActive: number;
  currency: string;
};

function fmtMoney(cents: number, currency: string) {
  const v = (cents ?? 0) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "MRU",
    maximumFractionDigits: 0,
  }).format(v);
}

function SkeletonCard() {
  return (
    <Card className="@container/card animate-pulse *:data-[slot=card]:bg-muted/40" data-slot="card">
      <CardHeader>
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-2 h-8 w-36 rounded bg-muted" />
      </CardHeader>
      <CardFooter>
        <div className="h-4 w-full rounded bg-muted" />
      </CardFooter>
    </Card>
  );
}

export function SectionCards({ stats, loading }: { stats: DashboardSectionStats; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const promoRate =
    stats.totalOrders > 0 ? Math.round((stats.ordersWithPromo / stats.totalOrders) * 1000) / 10 : 0;

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Banknote className="size-4" />
            Chiffre d’affaires
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {fmtMoney(stats.revenueCents, stats.currency)}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            Livrées &amp; expédiées
          </Badge>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Somme des totaux des commandes au statut livrée ou expédiée.
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Package className="size-4" />
            Commandes
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{stats.totalOrders}</CardTitle>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">En cours: {stats.pendingOrders}</Badge>
            <Badge variant="outline">Réussies: {stats.successOrders}</Badge>
          </div>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          « En cours » = paiement en attente ou préparation. « Réussies » = expédiées ou livrées.
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Tags className="size-4" />
            Codes promo
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{stats.ordersWithPromo}</CardTitle>
          <Badge variant="outline" className="w-fit">
            −{fmtMoney(stats.totalDiscountCents, stats.currency)} remises
          </Badge>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Commandes avec un code appliqué ({promoRate}% du total).
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Parfums (produits)
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{stats.productsActive}</CardTitle>
          <Badge variant="outline" className="w-fit">
            {stats.productsTotal} réf. catalogue
          </Badge>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Produits actifs sur le total enregistré dans l’admin.
        </CardFooter>
      </Card>
    </div>
  );
}
