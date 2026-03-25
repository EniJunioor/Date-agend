import type { LucideProps } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Book,
  BookOpen,
  Cake,
  Calendar,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  Flame,
  Frown,
  Gift,
  Globe,
  Heart,
  Hexagon,
  History,
  Home,
  Hourglass,
  Image,
  Images,
  Inbox,
  Laptop,
  LayoutDashboard,
  LineChart,
  Link2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Package,
  Palette,
  PartyPopper,
  Pencil,
  Plane,
  Plus,
  RotateCw,
  Send,
  Settings,
  Share2,
  Smile,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  Trophy,
  User,
  Users,
  UtensilsCrossed,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const icons = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  "bar-chart-3": BarChart3,
  bell: Bell,
  book: Book,
  "book-open": BookOpen,
  cake: Cake,
  calendar: Calendar,
  "calendar-days": CalendarDays,
  camera: Camera,
  check: Check,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  clock: Clock,
  cloud: Cloud,
  copy: Copy,
  flame: Flame,
  frown: Frown,
  gift: Gift,
  globe: Globe,
  heart: Heart,
  hexagon: Hexagon,
  history: History,
  home: Home,
  hourglass: Hourglass,
  image: Image,
  images: Images,
  inbox: Inbox,
  laptop: Laptop,
  "layout-dashboard": LayoutDashboard,
  "line-chart": LineChart,
  "link-2": Link2,
  lock: Lock,
  "log-out": LogOut,
  mail: Mail,
  "map-pin": MapPin,
  "message-square": MessageSquare,
  moon: Moon,
  package: Package,
  palette: Palette,
  "party-popper": PartyPopper,
  pencil: Pencil,
  plane: Plane,
  plus: Plus,
  "rotate-cw": RotateCw,
  send: Send,
  settings: Settings,
  "share-2": Share2,
  smile: Smile,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  tag: Tag,
  trash: Trash2,
  trophy: Trophy,
  user: User,
  users: Users,
  "utensils-crossed": UtensilsCrossed,
  wrench: Wrench,
  x: X,
  zap: Zap,
} as const;

export type AppIconName = keyof typeof icons;

const LEGACY_MOOD_EMOJI: Record<string, AppIconName> = {
  "😊": "smile",
  "🥰": "heart",
  "🎉": "party-popper",
  "😢": "frown",
  "😌": "cloud",
  "🤩": "sparkles",
  "😍": "star",
  "💕": "heart",
};

export function resolveMoodIconKey(stored: string | null | undefined): AppIconName {
  if (!stored) return "smile";
  if (stored in LEGACY_MOOD_EMOJI) return LEGACY_MOOD_EMOJI[stored];
  if (stored in icons) return stored as AppIconName;
  return "smile";
}

export const moodIconOptions: { id: AppIconName; label: string }[] = [
  { id: "smile", label: "Feliz" },
  { id: "heart", label: "Amor" },
  { id: "party-popper", label: "Comemoração" },
  { id: "frown", label: "Triste" },
  { id: "cloud", label: "Calmo" },
  { id: "sparkles", label: "Animado" },
  { id: "star", label: "Especial" },
  { id: "flame", label: "Intenso" },
];

const LEGACY_REACTION_EMOJI: Record<string, AppIconName> = {
  "❤️": "heart",
  "😍": "star",
  "🎉": "party-popper",
  "😊": "smile",
  "🥰": "heart",
  "💕": "heart",
  "🔥": "flame",
  "✨": "sparkles",
};

export function resolveReactionIconKey(stored: string): AppIconName {
  if (stored in LEGACY_REACTION_EMOJI) return LEGACY_REACTION_EMOJI[stored];
  if (stored in icons) return stored as AppIconName;
  return "heart";
}

/** Opções de reação rápida (armazenadas como chave do ícone) */
export const reactionIconOptions: AppIconName[] = [
  "heart",
  "star",
  "party-popper",
  "smile",
  "sparkles",
  "flame",
  "zap",
  "message-square",
];

export const NOTIFICATION_TYPE_ICONS: Record<string, AppIconName> = {
  evento_amanha: "calendar",
  evento_hoje: "bell",
  aniversario: "cake",
  conquista: "trophy",
  capsula: "hourglass",
  mensagem: "mail",
};

type AppIconProps = LucideProps & {
  name: string;
  fallback?: AppIconName;
};

export function AppIcon({
  name,
  fallback = "sparkles",
  size = 18,
  strokeWidth = 1.75,
  ...props
}: AppIconProps) {
  const key = (name in icons ? name : fallback) as AppIconName;
  const Cmp = icons[key] ?? icons[fallback];
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden {...props} />;
}
