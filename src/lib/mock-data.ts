import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  Droplets,
  Dumbbell,
  Goal,
  LayoutDashboard,
  NotebookPen,
  ScanSearch,
  ShieldCheck,
  Users,
  UserSquare2,
  UtensilsCrossed,
} from "lucide-react";

export type AppRole = "admin" | "member";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AppRole[];
};

export const navItems: NavItem[] = [
  { href: "/ux-foundation", label: "UX-основа", icon: ScanSearch, roles: ["admin", "member"] },
  { href: "/dashboard", label: "Личный дашборд", icon: LayoutDashboard, roles: ["admin", "member"] },
  { href: "/family", label: "Семейный дашборд", icon: Users, roles: ["admin", "member"] },
  { href: "/nutrition", label: "Дневник питания", icon: UtensilsCrossed, roles: ["admin", "member"] },
  { href: "/nutrition/draft", label: "Черновик приема пищи", icon: NotebookPen, roles: ["admin", "member"] },
  { href: "/foods", label: "База продуктов", icon: Apple, roles: ["admin", "member"] },
  { href: "/water", label: "Трекер воды", icon: Droplets, roles: ["admin", "member"] },
  { href: "/workouts", label: "Тренировки", icon: Dumbbell, roles: ["admin", "member"] },
  { href: "/goals", label: "Цели", icon: Goal, roles: ["admin", "member"] },
  { href: "/profile", label: "Профиль", icon: UserSquare2, roles: ["admin", "member"] },
  { href: "/measurements", label: "Вес и замеры", icon: Activity, roles: ["admin", "member"] },
  { href: "/admin/users", label: "Пользователи", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/users/new", label: "Создать пользователя", icon: Users, roles: ["admin"] },
];

export const screenMap = [
  {
    group: "Доступ",
    screens: ["Вход"],
  },
  {
    group: "Ежедневное использование",
    screens: ["Личный дашборд", "Дневник питания", "Черновик приема пищи", "Трекер воды", "Тренировки", "Цели"],
  },
  {
    group: "Справочники и планирование",
    screens: ["Профиль", "Вес и замеры", "База продуктов"],
  },
  {
    group: "Администрирование",
    screens: ["Список пользователей", "Создать пользователя", "Семейный дашборд"],
  },
];

export const userFlows = {
  admin: [
    "Вход -> список пользователей -> создание пользователя -> переход в профиль пользователя",
    "Вход -> семейный дашборд -> выбор периода -> просмотр карточек членов семьи",
    "Вход -> база продуктов -> добавление общей записи -> предпросмотр использования в питании",
    "Вход -> тренировки -> переход к нормативам -> просмотр калорий на единицу",
  ],
  member: [
    "Вход -> личный дашборд -> быстрый переход в питание или воду на сегодня",
    "Дневник питания -> черновик приема пищи -> корректировка количества -> сохранение приема пищи",
    "Профиль -> предпросмотр пересчета норм -> возврат на дашборд",
    "Цели -> выбор шаблона -> просмотр прогресса и ближайших сроков",
  ],
};

export const pageInventory = [
  {
    name: "Общий каркас",
    components: ["Адаптивный сайдбар", "Верхняя панель с переключением роли", "Панель быстрых действий", "Заголовок страницы"],
  },
  {
    name: "Информационные компоненты",
    components: ["KPI-карточки", "Прогресс-бары", "Мини-графики", "Карточки членов семьи", "Панели план/факт"],
  },
  {
    name: "Компоненты ввода",
    components: ["Компактные формы", "Сегментированные вкладки", "Быстрые чипы добавления", "Моковые панели и карточки предпросмотра"],
  },
  {
    name: "Справочные компоненты",
    components: ["Таблицы с поиском", "Карточки продуктов", "Шаблоны целей", "Карточки нормативов тренировок"],
  },
];

export const proposedAppStructure = [
  "src/app: маршрутные mock-страницы для каждого MVP-экрана",
  "src/components/prototype: общий shell, карточки, графики, секции страниц",
  "src/components/ui: базовые UI-примитивы в стиле shadcn",
  "src/lib/mock-data.ts: моковые данные, сценарии, навигация и подписи",
  "src/lib/utils.ts: утилиты для CSS-классов",
];

export const users = [
  { id: "u1", name: "Анна Волкова", role: "Администратор", status: "Активен", calories: 1870, water: "1.9 / 2.3 л", workouts: 3, weight: "67.8 кг", goal: "Поддержание веса" },
  { id: "u2", name: "Максим Волков", role: "Пользователь", status: "Активен", calories: 2140, water: "2.1 / 2.5 л", workouts: 4, weight: "82.4 кг", goal: "Сбросить 4 кг к июню" },
  { id: "u3", name: "София Волкова", role: "Пользователь", status: "На паузе", calories: 1730, water: "1.4 / 1.8 л", workouts: 2, weight: "59.2 кг", goal: "Пробежать 12 тренировок" },
];

export const nutritionSummary = {
  targetCalories: 1870,
  consumedCalories: 1460,
  protein: { target: 122, actual: 101 },
  fat: { target: 62, actual: 48 },
  carbs: { target: 178, actual: 136 },
};

export const mealDraft = {
  item: "Боул с индейкой и булгуром",
  quantity: 320,
  mealType: "Обед",
  now: { calories: 1460, protein: 101, fat: 48, carbs: 136 },
  after: { calories: 1825, protein: 128, fat: 59, carbs: 171 },
  delta: { calories: 365, protein: 27, fat: 11, carbs: 35 },
};

export const foods = [
  { name: "Греческий йогурт 2%", type: "Продукт", unit: "100 г", calories: 73, protein: 10, fat: 2, carbs: 4, author: "Анна Волкова" },
  { name: "Боул с индейкой и булгуром", type: "Блюдо", unit: "1 порция", calories: 365, protein: 27, fat: 11, carbs: 35, author: "Максим Волков" },
  { name: "Овсянка с ягодами", type: "Блюдо", unit: "1 банка", calories: 290, protein: 13, fat: 7, carbs: 42, author: "Анна Волкова" },
  { name: "Огурец", type: "Продукт", unit: "100 г", calories: 15, protein: 1, fat: 0, carbs: 3, author: "Общий справочник" },
];

export const meals = [
  { time: "08:10", type: "Завтрак", item: "Овсянка с ягодами", calories: 290, protein: 13, fat: 7, carbs: 42 },
  { time: "12:45", type: "Обед", item: "Боул с индейкой и булгуром", calories: 365, protein: 27, fat: 11, carbs: 35 },
  { time: "16:20", type: "Перекус", item: "Греческий йогурт 2%", calories: 146, protein: 20, fat: 4, carbs: 8 },
  { time: "19:30", type: "Ужин", item: "Салат с лососем", calories: 659, protein: 41, fat: 26, carbs: 51 },
];

export const waterSummary = {
  goalMl: 2300,
  consumedMl: 1900,
  quickAdd: [100, 200, 250, 300, 500],
  timeline: [
    { time: "08:00", amount: 250 },
    { time: "10:15", amount: 300 },
    { time: "13:20", amount: 500 },
    { time: "17:40", amount: 350 },
    { time: "20:05", amount: 500 },
  ],
};

export const workouts = {
  history: [
    { date: "23 апр", type: "Ходьба", method: "По нормативу", value: "7 км", calories: 312 },
    { date: "22 апр", type: "Силовая тренировка", method: "Вручную", value: "55 мин", calories: 420 },
    { date: "20 апр", type: "Пробежка", method: "По нормативу", value: "45 мин", calories: 366 },
  ],
  norms: [
    { activity: "Ходьба", unit: "км", caloriesPerUnit: 44 },
    { activity: "Пробежка", unit: "мин", caloriesPerUnit: 8.1 },
    { activity: "Силовая тренировка", unit: "тренировка", caloriesPerUnit: 380 },
  ],
};

export const goals = [
  { title: "Снизить вес на 2 кг к 25 мая", progress: 64, status: "Активна", metric: "1.3 / 2 кг", due: "25 мая" },
  { title: "Выполнять норму воды 20 дней", progress: 55, status: "Активна", metric: "11 / 20 дней", due: "31 мая" },
  { title: "12 тренировок в апреле", progress: 92, status: "Почти выполнена", metric: "11 / 12 тренировок", due: "30 апр" },
];

export const personalTrend = [
  { label: "Пн", calories: 1710, water: 1.9, workouts: 0 },
  { label: "Вт", calories: 1840, water: 2.1, workouts: 1 },
  { label: "Ср", calories: 1650, water: 1.7, workouts: 1 },
  { label: "Чт", calories: 1460, water: 1.9, workouts: 0 },
  { label: "Пт", calories: 0, water: 0, workouts: 0 },
];

export const familyTrend = [
  { label: "Анна", calories: 78, water: 83, goals: 74 },
  { label: "Максим", calories: 86, water: 90, goals: 61 },
  { label: "София", calories: 69, water: 77, goals: 58 },
];

export const measurementHistory = [
  { date: "01 фев", weight: 69.4, waist: 78, hips: 98 },
  { date: "01 мар", weight: 68.6, waist: 76, hips: 97 },
  { date: "01 апр", weight: 67.9, waist: 75, hips: 96 },
  { date: "23 апр", weight: 67.8, waist: 74, hips: 96 },
];
