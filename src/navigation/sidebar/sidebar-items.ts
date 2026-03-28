import {
  Banknote,
  Beaker,
  ChartBar,
  CreditCard,
  FileText,
  Gift,
  ImageIcon,
  Kanban,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingBag,
  SquareStack,
  Truck,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: typeof LayoutDashboard;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: typeof LayoutDashboard;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      {
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
    ],
  },
  {
    id: 2,
    label: "Catalogue",
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Products",
        url: "/dashboard/products",
        icon: ShoppingBag,
      },
      {
        title: "Types",
        url: "/dashboard/types",
        icon: Kanban,
      },
      {
        title: "Ingredients",
        url: "/dashboard/ingredients",
        icon: Beaker,
      },
      {
        title: "Banners",
        url: "/dashboard/banners",
        icon: ImageIcon,
      },
      {
        title: "Gift selections",
        url: "/dashboard/gift-selections",
        icon: Gift,
      },
      {
        title: "Our Story",
        url: "/dashboard/our-story",
        icon: SquareStack,
      },
      {
        title: "Home sections",
        url: "/dashboard/home-sections",
        icon: LayoutDashboard,
      },
      {
        title: "Content",
        url: "/dashboard/content/pages",
        icon: FileText,
        subItems: [
          { title: "Pages", url: "/dashboard/content/pages" },
          { title: "FAQs", url: "/dashboard/content/faqs" },
        ],
      },
      {
        title: "Shipping",
        url: "/dashboard/settings/shipping",
        icon: Truck,
        subItems: [
          { title: "Free shipping", url: "/dashboard/settings/shipping" },
          {
            title: "Cities & quartiers",
            url: "/dashboard/settings/delivery-zones",
          },
        ],
      },
      {
        title: "Discounts",
        url: "/dashboard/discounts",
        icon: ReceiptText,
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: Package,
      },
      {
        title: "Payment methods",
        url: "/dashboard/payment-methods",
        icon: CreditCard,
      },
    ],
  },
];
