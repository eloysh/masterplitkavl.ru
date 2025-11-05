
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Hammer,
  Ruler,
  ShieldCheck,
  Clock,
  Sparkles,
  Scissors,
  Layers,
  Calculator,
  Info,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/*
  Лендинг для мастера-плиточника Гуренко Евгения (Владивосток, Артём)
  Домашний домен (отображение в шапке/футере): masterplitkavl.ru
  CTA (WhatsApp): wa.me/79510050002
  В этой версии: React + Tailwind + Framer Motion, анимированный фон «плитка»,
  контрастные секции, улучшенный калькулятор, галерея с лайтбоксом и SEO.
*/

// === Контакты/домены ===
const DOMAIN = "masterplitkavl.ru";
const PHONE_DISPLAY = "+7 951 005‑00‑02";
const PHONE_TEL = "+79510050002";
const WHATSAPP_LINK_BASE = "https://wa.me/79510050002"; // без +
const CANONICAL = `https://${DOMAIN}/`;

// === Вспомогательные стили ===
const tileGridStyle = (size = 64, alpha = 0.08): React.CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,${alpha}) 0 1px, transparent 1px ${size}px), repeating-linear-gradient(90deg, rgba(255,255,255,${alpha}) 0 1px, transparent 1px ${size}px)`,
  backgroundSize: `${size}px ${size}px, ${size}px ${size}px`,
});

// === Данные/настройки ===
const initialPrices = {
  base: {
    bathroom: { tile: 1800, porcelain: 1800 },
    backsplash: { tile: 1800, porcelain: 1800 },
    floor: { tile: 1800, porcelain: 1800 },
  },
  extras: {
    demolitionPerM2: 200,
    waterproofingPerM2: 250,
    prepPerM2: 140,
    adhesivePerM2: 220,
    groutPerM2: 130,
    miterPerLm: 250,
    siliconePerLm: 90,
    packageDiscountPct: 5,
  },
  coefficients: {
    normal: 1.0,
    diagonal: 1.1,
    largeFormat: 1.15,
    mosaic: 1.2,
  },
} as const;

type AreaType = "bathroom" | "backsplash" | "floor";
type MaterialType = "tile" | "porcelain";
type Complexity = "normal" | "diagonal" | "largeFormat" | "mosaic";

type Prices = typeof initialPrices;

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6" aria-hidden />,
    title: "Гарантия на работы",
    text: "Письменная гарантия и чек. Работаю по договору, соблюдаю СНИПы и технологию.",
  },
  {
    icon: <Hammer className="w-6 h-6" aria-hidden />,
    title: "Профинструмент",
    text: "Станки под 45°, гребёнки, лазерный нивелир, пылесос. Чисто на объекте.",
  },
  {
    icon: <Ruler className="w-6 h-6" aria-hidden />,
    title: "Точный замер",
    text: "Рассчитаю плитку, клей, затирку. Оптимизирую раскладку и подрезки.",
  },
  {
    icon: <Clock className="w-6 h-6" aria-hidden />,
    title: "В срок",
    text: "Реальные сроки по договорённости. Ежедневная фото/видео-отчётность.",
  },
];

// --- Локальные изображения из public/gallery ---
const galleryImages: { src: string; alt: string }[] = [
  { src: "/public/photo1.jpg", alt: "Санузел — керамогранит, ванна" },
  { src: "/public/photo2.jpg", alt: "Открытая полка — керамогранит" },
  { src: "/public/photo3.jpg", alt: "Открытая полка — керамогранит" },
  { src: "/public/photo4.jpg", alt: "Открытая полка — керамогранит" },
  { src: "/public/photo5.jpg", alt: "Санузел под ключ" },
  { src: "/public/photo6.jpg", alt: "Санузел под ключ" },
  { src: "/public/photo7.jpg", alt: "Ванная комната — керамогранит, ванна" },
  { src: "/public/photo8.jpg", alt: "Ванная комната — керамогранит, душ" },
  { src: "/public/photo9.jpg", alt: "Санузел — керамогранит, ванна" },
  { src: "/public/photo10.jpg", alt: "Пол — крупный формат 60×120" },
  { src: "/public/photo12.jpg", alt: "Санузел — скрытая ниша" },
  { src: "/public/photo13.jpg", alt: "Фартук кухни — белый кабанчикКухня — фартук и столешница" },
  { src: "/public/photo14.jpg", alt: "Фартук кухни — белый кабанчик" },
  { src: "/public/photo15.jpg", alt: "Фартук кухни — белый кабанчикДекоративные швы и примыкания" },
  { src: "/public/photo16.jpg", alt: "Фартук кухни — белый кабанчик" },
   { src: "/public/photo22.jpg", alt: "Душ — линейный трап, стекло" },
];

const faq = [
  { q: "Как формируется окончательная цена?", a: "Считаю по площади, учитываю формат, подрезки, рисунок, сложность, состояние основания, гидроизоляцию, материалы мастера и демонтаж. Итог после замера." },
  { q: "Делаете закупку материалов?", a: "Да. Помогу выбрать, рассчитать и привезти. Могу принять и поднять заказ на объект." },
  { q: "Работаете по договору?", a: "Да, возможен договор и письменная гарантия на выполненные работы." },
  { q: "Какие районы обслуживаете?", a: "Владивосток и Артём. Возможен выезд: Уссурийск, Находка, Большой Камень, Партизанск и другие города Приморского края." },
];

function WhatsAppButton({ label, message }: { label?: string; message?: string }) {
  const href = useMemo(() => {
    const query = message ? `?text=${encodeURIComponent(message)}` : "";
    return `${WHATSAPP_LINK_BASE}${query}`;
  }, [message]);

  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition focus:outline-none focus:ring text-white bg-emerald-600 hover:bg-emerald-700"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
    >
      <MessageCircle className="w-5 h-5" aria-hidden />
      <span>{label ?? "Написать в WhatsApp"}</span>
    </a>
  );
}

function computeTotalExample({
  area,
  baseRate,
  coeff,
  extras,
  flags,
  lm,
}: {
  area: number;
  baseRate: number;
  coeff: number;
  extras: typeof initialPrices.extras;
  flags: { demolition?: boolean; prep?: boolean; adhesive?: boolean; grout?: boolean; waterproofing?: boolean; turnkey?: boolean };
  lm: { miter: number; silicone: number };
}) {
  const base = area * baseRate * coeff;
  const demolition = flags.demolition ? area * extras.demolitionPerM2 : 0;
  const prep = flags.prep ? area * extras.prepPerM2 : 0;
  const adhesive = flags.adhesive ? area * extras.adhesivePerM2 : 0;
  const grout = flags.grout ? area * extras.groutPerM2 : 0;
  const waterproofing = flags.waterproofing ? area * extras.waterproofingPerM2 : 0;
  const miter = lm.miter * extras.miterPerLm;
  const silicone = lm.silicone * extras.siliconePerLm;
  const subtotal = base + demolition + prep + adhesive + grout + waterproofing + miter + silicone;
  const discount = flags.turnkey ? Math.round((subtotal * extras.packageDiscountPct) / 100) : 0;
  return Math.max(0, subtotal - discount);
}

function runSelfTests() {
  const ex = initialPrices.extras;
  console.assert(
    computeTotalExample({ area: 10, baseRate: 1800, coeff: 1, extras: ex, flags: {}, lm: { miter: 0, silicone: 0 } }) === 18000,
    "Test 1 failed",
  );
  const t2 = computeTotalExample({
    area: 5, baseRate: 1800, coeff: 1.1, extras: ex, flags: { demolition: true, adhesive: true }, lm: { miter: 0, silicone: 0 },
  });
  const expected2 = Math.max(0, 5 * 1800 * 1.1 + 5 * ex.demolitionPerM2 + 5 * ex.adhesivePerM2);
  console.assert(Math.abs(t2 - expected2) < 1e-6, "Test 2 failed");
  const t3 = computeTotalExample({
    area: 8, baseRate: 1800, coeff: 1, extras: ex, flags: { turnkey: true, grout: true, prep: true }, lm: { miter: 2, silicone: 3 },
  });
  const subtotal3 = 8 * 1800 + 8 * ex.prepPerM2 + 8 * ex.groutPerM2 + 2 * ex.miterPerLm + 3 * ex.siliconePerLm;
  const expected3 = Math.max(0, subtotal3 - Math.round((subtotal3 * ex.packageDiscountPct) / 100));
  console.assert(Math.abs(t3 - expected3) < 1e-6, "Test 3 failed");
}

export default function LandingMasterPlitka25() {
  useEffect(() => { runSelfTests(); }, []);

  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [prices, setPrices] = useState<Prices>(initialPrices);
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [showLmHelper, setShowLmHelper] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % galleryImages.length);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const [areaType, setAreaType] = useState<AreaType>("bathroom");
  const [material, setMaterial] = useState<MaterialType>("tile");
  const [area, setArea] = useState<number>(6);
  const [complexity, setComplexity] = useState<Complexity>("normal");
  const [turnkey, setTurnkey] = useState<boolean>(true);

  const [withDemolition, setWithDemolition] = useState<boolean>(false);
  const [withPrep, setWithPrep] = useState<boolean>(true);
  const [withAdhesive, setWithAdhesive] = useState<boolean>(true);
  const [withGrout, setWithGrout] = useState<boolean>(true);
  const [withWaterproofing, setWithWaterproofing] = useState<boolean>(true);
  const [waterproofingArea, setWaterproofingArea] = useState<number>(6);
  const [linkWaterproofingToArea, setLinkWaterproofingToArea] = useState<boolean>(true);
  const [miterLm, setMiterLm] = useState<number>(0);
  const [siliconeLm, setSiliconeLm] = useState<number>(0);

  const [hWalls, setHWalls] = useState<number>(2.5);
  const [innerCorners, setInnerCorners] = useState<number>(2);
  const [outerCorners, setOuterCorners] = useState<number>(0);
  const [floorPerimeter, setFloorPerimeter] = useState<number>(0);
  const [extraSilicone, setExtraSilicone] = useState<number>(0);
  const [openEdges, setOpenEdges] = useState<number>(0);

  const applyLmHelper = () => {
    const miter = outerCorners * hWalls + openEdges;
    const silicone = innerCorners * hWalls + floorPerimeter + extraSilicone;
    setMiterLm(Number(miter.toFixed(2)));
    setSiliconeLm(Number(silicone.toFixed(2)));
  };

  useEffect(() => { if (linkWaterproofingToArea) setWaterproofingArea(area); }, [area, linkWaterproofingToArea]);
  useEffect(() => {
    if (turnkey) {
      setWithPrep(true); setWithAdhesive(true); setWithGrout(true); setWithWaterproofing(true); setLinkWaterproofingToArea(true);
    }
  }, [turnkey]);

  const baseRate = prices.base[areaType][material];
  const coeff = prices.coefficients[complexity];
  const baseCost = (area || 0) * baseRate * coeff;
  const demolitionCost = withDemolition ? (area || 0) * prices.extras.demolitionPerM2 : 0;
  const prepCost = withPrep ? (area || 0) * prices.extras.prepPerM2 : 0;
  const adhesiveCost = withAdhesive ? (area || 0) * prices.extras.adhesivePerM2 : 0;
  const groutCost = withGrout ? (area || 0) * prices.extras.groutPerM2 : 0;
  const waterproofingCost = withWaterproofing ? (linkWaterproofingToArea ? (area || 0) : (waterproofingArea || 0)) * prices.extras.waterproofingPerM2 : 0;
  const miterCost = (miterLm || 0) * prices.extras.miterPerLm;
  const siliconeCost = (siliconeLm || 0) * prices.extras.siliconePerLm;
  const subtotal = baseCost + demolitionCost + prepCost + adhesiveCost + groutCost + waterproofingCost + miterCost + siliconeCost;
  const discount = turnkey ? Math.round((subtotal * prices.extras.packageDiscountPct) / 100) : 0;
  const total = Math.max(0, subtotal - discount);

  const calcMsg =
    `Здравствуйте! Хочу рассчитать работы: ${areaType === "bathroom" ? "Санузел" : areaType === "backsplash" ? "Фартук кухни" : "Пол"}. ` +
    `Материал: ${material === "tile" ? "кафель" : "керамогранит"}. Площадь: ${area} м².\n` +
    `Сложность: ${ { normal: "стандарт", diagonal: "диагональ (+10%)", largeFormat: "крупный формат (+15%)", mosaic: "мозаика/рисунок (+20%)" }[complexity] }.\n` +
    `${withDemolition ? `Демонтаж: да (≈${prices.extras.demolitionPerM2} ₽/м²).\n` : ""}` +
    `${withPrep ? `Подготовка: да (≈${prices.extras.prepPerM2} ₽/м²).\n` : ""}` +
    `${withAdhesive ? `Клей/расходники: да (≈${prices.extras.adhesivePerM2} ₽/м²).\n` : ""}` +
    `${withGrout ? `Затирка: да (≈${prices.extras.groutPerM2} ₽/м²).\n` : ""}` +
    `${withWaterproofing ? `Гидроизоляция: ${linkWaterproofingToArea ? area : waterproofingArea} м² (≈${prices.extras.waterproofingPerM2} ₽/м²).\n` : ""}` +
    `${miterLm ? `Запил 45°: ${miterLm} пог. м (≈${prices.extras.miterPerLm} ₽/п.м).\n` : ""}` +
    `${siliconeLm ? `Силикон: ${siliconeLm} пог. м (≈${prices.extras.siliconePerLm} ₽/п.м).\n` : ""}` +
    `${turnkey ? `Пакет «под ключ»: скидка ${prices.extras.packageDiscountPct}%.\n` : ""}` +
    `Предварительная сумма: ~${total.toLocaleString("ru-RU")} ₽. Подскажите ближайшую дату выезда на замер?`;

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Гуренко Евгений — плиточник",
    url: CANONICAL,
    telephone: PHONE_TEL,
    areaServed: ["Владивосток", "Артём", "Уссурийск", "Находка", "Большой Камень", "Партизанск", "Приморский край"],
    address: { "@type": "PostalAddress", addressRegion: "Приморский край", addressLocality: "Владивосток" },
    sameAs: [WHATSAPP_LINK_BASE],
    priceRange: "₽₽",
  } as const;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  } as const;

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden">
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 -z-20" style={tileGridStyle(64, 0.06)} animate={{ backgroundPosition: ["0px 0px, 0px 0px", "64px 64px, 64px 64px"] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 -z-30" initial={{ opacity: 0.16 }} animate={{ opacity: [0.16, 0.22, 0.16] }} transition={{ duration: 10, repeat: Infinity }} style={{ background: "radial-gradient(800px 520px at 10% -10%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(800px 520px at 110% 110%, rgba(34,211,238,0.12), transparent 60%)" }} />

      <Helmet>
        <html lang="ru" />
        <title>Плиточник Владивосток, Артём — Гуренко Евгений | Укладка плитки и керамогранита</title>
        <meta name="description" content="Плиточные работы во Владивостоке и Артёме: санузел под ключ, фартук кухни, пол. Керамогранит/кафель, гидроизоляция, запил 45°, затирка. Калькулятор цены. WhatsApp +7 951 005-00-02." />
        <link rel="canonical" href={CANONICAL} />
        <meta name="robots" content="index,follow" />
        <meta name="geo.region" content="RU-PRI" />
        <meta name="geo.placename" content="Владивосток, Артём" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Гуренко Евгений — плиточник" />
        <meta property="og:title" content="Плиточник Владивосток, Артём — укладка плитки/керамогранита" />
        <meta property="og:description" content="Санузлы под ключ, фартуки кухонь, полы. Калькулятор стоимости. WhatsApp: +7 951 005-00-02" />
        <meta property="og:url" content={CANONICAL} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(localBusinessLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80 bg-slate-950/90 border-b border-white/10" style={tileGridStyle(48, 0.06)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div initial={{ rotate: -8, scale: 0.8, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="w-9 h-9 rounded-2xl bg-emerald-500/25 grid place-content-center shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div>
              <div className="text-sm uppercase tracking-widest text-emerald-400">{DOMAIN}</div>
              <div className="font-semibold text-lg">Гуренко Евгений — плиточник</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${PHONE_TEL}`} className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 transition bg-slate-900">
              <Phone className="w-4 h-4" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <WhatsAppButton />
          </div>
        </div>
      </header>

      <section className="relative" style={{ paddingTop: "4rem" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14 grid md:grid-cols-2 gap-10">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <h1 className="text-4xl/tight md:text-5xl font-extrabold tracking-tight drop-shadow">
              Плиточные работы во Владивостоке и Артёме
              <span className="block text-emerald-400">качественно, в срок, под ключ</span>
            </h1>
            <p className="text-slate-200 text-lg">
              Укладка плитки и керамогранита: санузлы, фартуки кухонь, полы. Подготовка основания, гидроизоляция, затирка, запил под 45°, аккуратные примыкания. Ламинат и мелкая электрика.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <WhatsAppButton label="Рассчитать и записаться" message={calcMsg} />
              <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 transition bg-slate-900">
                <Phone className="w-5 h-5" /> Позвонить
              </a>
            </div>
            <div className="text-sm text-slate-300">
              Базовая цена укладки: <span className="text-white font-medium">от 1 800 ₽/м²</span> (без материалов). Итог после замера и раскладки.
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl bg-slate-950/95" style={tileGridStyle(40, 0.06)}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h2 className="text-2xl font-bold">Калькулятор</h2>
              </div>
              <button onClick={() => setShowPricePanel((v) => !v)} className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 hover:border-white/30 bg-slate-900">
                <Scissors className="w-4 h-4" /> Настроить цены
              </button>
            </div>

            {showPricePanel && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {(["bathroom", "backsplash", "floor"] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <div className="font-medium capitalize">{key === "bathroom" ? "Санузел" : key === "backsplash" ? "Фартук кухни" : "Пол"}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <div className="text-slate-400 mb-1">Кафель ₽/м²</div>
                        <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={prices.base[key].tile} onChange={(e) => setPrices((p) => ({ ...p, base: { ...p.base, [key]: { ...p.base[key], tile: Number(e.target.value || 0) } } }))} />
                      </label>
                      <label className="block">
                        <div className="text-slate-400 mb-1">Керамогранит ₽/м²</div>
                        <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={prices.base[key].porcelain} onChange={(e) => setPrices((p) => ({ ...p, base: { ...p.base, [key]: { ...p.base[key], porcelain: Number(e.target.value || 0) } } }))} />
                      </label>
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <div className="font-medium">Доп. работы, ₽</div>
                  {[
                    ["demolitionPerM2", "Демонтаж плитки ₽/м²"],
                    ["waterproofingPerM2", "Гидроизоляция ₽/м²"],
                    ["prepPerM2", "Подготовка/выравнивание ₽/м²"],
                    ["adhesivePerM2", "Клей и расходники ₽/м²"],
                    ["groutPerM2", "Затирка ₽/м²"],
                    ["miterPerLm", "Запил под 45° ₽/п.м"],
                    ["siliconePerLm", "Силикон ₽/п.м"],
                  ].map(([key, label]) => (
                    <label className="block" key={key}>
                      <div className="text-slate-400 mb-1">{label}</div>
                      <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={(prices.extras as any)[key as keyof typeof prices.extras]} onChange={(e) => setPrices((p) => ({ ...p, extras: { ...p.extras, [key as string]: Number(e.target.value || 0) } as any }))} />
                    </label>
                  ))}

                  <label className="block">
                    <div className="text-slate-400 mb-1">Скидка пакета «под ключ», %</div>
                    <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={prices.extras.packageDiscountPct} onChange={(e) => setPrices((p) => ({ ...p, extras: { ...p.extras, packageDiscountPct: Number(e.target.value || 0) } }))} />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Коэффициенты сложности</div>
                  {[
                    ["normal", "Стандарт ×1.00"],
                    ["diagonal", "Диагональ ×1.10"],
                    ["largeFormat", "Крупный формат ×1.15"],
                    ["mosaic", "Мозаика/рисунок ×1.20"],
                  ].map(([key, label]) => (
                    <label className="block" key={key}>
                      <div className="text-slate-400 mb-1">{label}</div>
                      <input type="number" step={0.01} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={(prices.coefficients as any)[key as keyof typeof prices.coefficients]} onChange={(e) => setPrices((p) => ({ ...p, coefficients: { ...p.coefficients, [key as string]: Number(e.target.value || 0) } as any }))} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <div className="text-sm mb-2 text-slate-300">Зона работ</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["bathroom", "Санузел"],
                    ["backsplash", "Фартук кухни"],
                    ["floor", "Пол"],
                  ].map(([key, label]) => (
                    <button key={key} onClick={() => setAreaType(key as AreaType)} className={`px-3 py-2 rounded-xl border ${areaType === key ? "border-emerald-400 bg-emerald-400/10" : "border-white/15"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm mb-2 text-slate-300">Материал</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["tile", "Кафель"],
                    ["porcelain", "Керамогранит"],
                  ].map(([key, label]) => (
                    <button key={key} onClick={() => setMaterial(key as MaterialType)} className={`px-3 py-2 rounded-xl border ${material === key ? "border-emerald-400 bg-emerald-400/10" : "border-white/15"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <div className="text-sm mb-2 text-slate-300">Площадь, м²</div>
                <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={area} onChange={(e) => setArea(Number(e.target.value || 0))} />
              </label>

              <div>
                <div className="text-sm mb-2 text-slate-300">Сложность раскладки</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ["normal", "Стандарт"],
                    ["diagonal", "Диагональ"],
                    ["largeFormat", "Крупный формат"],
                    ["mosaic", "Мозаика/рисунок"],
                  ].map(([key, label]) => (
                    <button key={key} onClick={() => setComplexity(key as Complexity)} className={`px-3 py-2 rounded-xl border ${complexity === key ? "border-emerald-400 bg-emerald-400/10" : "border-white/15"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={turnkey} onChange={(e) => setTurnkey(e.target.checked)} />
                  <span className="text-sm text-slate-300">Санузел под ключ (скидка {prices.extras.packageDiscountPct}%)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withDemolition} onChange={(e) => setWithDemolition(e.target.checked)} />
                  <span className="text-sm text-slate-300">Добавить демонтаж</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withPrep} onChange={(e) => setWithPrep(e.target.checked)} />
                  <span className="text-sm text-slate-300">Подготовка/выравнивание</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withAdhesive} onChange={(e) => setWithAdhesive(e.target.checked)} />
                  <span className="text-sm text-slate-300">Клей и расходники</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withGrout} onChange={(e) => setWithGrout(e.target.checked)} />
                  <span className="text-sm text-slate-300">Затирка</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withWaterproofing} onChange={(e) => setWithWaterproofing(e.target.checked)} />
                    <span className="text-sm text-slate-300">Гидроизоляция</span>
                  </label>
                  {withWaterproofing && (
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={linkWaterproofingToArea} onChange={(e) => setLinkWaterproofingToArea(e.target.checked)} />
                      <span className="text-sm text-slate-300">= площади</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm mb-2 text-slate-300">Запил под 45°, пог. м</div>
                  <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={miterLm} onChange={(e) => setMiterLm(Number(e.target.value || 0))} />
                </label>
                <label className="block">
                  <div className="text-sm mb-2 text-slate-300">Силикон/примыкания, пог. м</div>
                  <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={siliconeLm} onChange={(e) => setSiliconeLm(Number(e.target.value || 0))} />
                </label>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <button onClick={() => setShowLmHelper((v) => !v)} className="inline-flex items-center gap-2 text-sm mb-2 hover:opacity-90">
                  <Info className="w-4 h-4" /> Как посчитать погонные метры?
                </button>
                {showLmHelper && (
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="col-span-1 space-y-2">
                      <label className="block">
                        <div className="text-slate-300 mb-1">Высота стен, м</div>
                        <input type="number" step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={hWalls} onChange={(e) => setHWalls(Number(e.target.value || 0))} />
                      </label>
                      <label className="block">
                        <div className="text-slate-300 mb-1">Внутренние углы, шт (силикон)</div>
                        <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={innerCorners} onChange={(e) => setInnerCorners(Number(e.target.value || 0))} />
                      </label>
                      <label className="block">
                        <div className="text-slate-300 mb-1">Внешние углы, шт (под 45°)</div>
                        <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={outerCorners} onChange={(e) => setOuterCorners(Number(e.target.value || 0))} />
                      </label>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="block">
                        <div className="text-slate-300 mb-1">Периметр примыкания пол-стена, м</div>
                        <input type="number" step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={floorPerimeter} onChange={(e) => setFloorPerimeter(Number(e.target.value || 0))} />
                      </label>
                      <label className="block">
                        <div className="text-slate-300 mb-1">Доп. примыкания (ванна/душ/столешница), м</div>
                        <input type="number" step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={extraSilicone} onChange={(e) => setExtraSilicone(Number(e.target.value || 0))} />
                      </label>
                      <label className="block">
                        <div className="text-slate-300 mb-1">Открытые торцы/полки/ниши (под 45°), м</div>
                        <input type="number" step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={openEdges} onChange={(e) => setOpenEdges(Number(e.target.value || 0))} />
                      </label>
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between pt-1">
                      <div className="text-xs text-slate-400">Формула: запил 45° = внешние углы × высота + открытые торцы. Силикон = внутренние углы × высота + периметр пол‑стена + доп. примыкания.</div>
                      <button onClick={applyLmHelper} className="px-3 py-2 rounded-xl border border-white/15 hover:border-white/30 bg-slate-900">Подставить в расчёт</button>
                    </div>
                  </div>
                )}
              </div>

              {withWaterproofing && !linkWaterproofingToArea && (
                <label className="block">
                  <div className="text-sm mb-2 text-slate-300">Гидроизоляция — площадь, м²</div>
                  <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={waterproofingArea} onChange={(e) => setWaterproofingArea(Number(e.target.value || 0))} />
                </label>
              )}

              <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950 p-4" style={tileGridStyle(32, 0.06)}>
                <div className="text-sm text-slate-300">Предварительный расчёт</div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <ul className="space-y-1">
                    <li className="flex justify-between gap-3"><span>База (×{coeff.toFixed(2)})</span><span>{Math.round(baseCost).toLocaleString("ru-RU")} ₽</span></li>
                    {withDemolition && <li className="flex justify-between gap-3"><span>Демонтаж</span><span>{Math.round(demolitionCost).toLocaleString("ru-RU")} ₽</span></li>}
                    {withPrep && <li className="flex justify-between gap-3"><span>Подготовка</span><span>{Math.round(prepCost).toLocaleString("ru-RU")} ₽</span></li>}
                    {withAdhesive && <li className="flex justify-between gap-3"><span>Клей/расходники</span><span>{Math.round(adhesiveCost).toLocaleString("ru-RU")} ₽</span></li>}
                  </ul>
                  <ul className="space-y-1">
                    {withGrout && <li className="flex justify-between gap-3"><span>Затирка</span><span>{Math.round(groutCost).toLocaleString("ru-RU")} ₽</span></li>}
                    {withWaterproofing && <li className="flex justify-between gap-3"><span>Гидроизоляция</span><span>{Math.round(waterproofingCost).toLocaleString("ru-RU")} ₽</span></li>}
                    {miterLm > 0 && <li className="flex justify-between gap-3"><span>Запил 45°</span><span>{Math.round(miterCost).toLocaleString("ru-RU")} ₽</span></li>}
                    {siliconeLm > 0 && <li className="flex justify_between gap-3"><span>Силикон</span><span>{Math.round(siliconeCost).toLocaleString("ru-RU")} ₽</span></li>}
                  </ul>
                </div>
                {turnkey && <div className="flex justify-between gap-3 text-sm mt-2 text-emerald-300"><span>Скидка «под ключ»</span><span>−{discount.toLocaleString("ru-RU")} ₽</span></div>}
                <div className="text-3xl font-extrabold mt-2">{total.toLocaleString("ru-RU")} ₽</div>
                <div className="text-xs text-slate-400 mt-1">Без материалов (если не отмечены). Итог после замера и раскладки.</div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <WhatsAppButton label="Отправить расчёт в WhatsApp" message={calcMsg} />
                  <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 transition bg-slate-900"><Phone className="w-5 h-5" /> Позвонить</a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={tileGridStyle(80, 0.05)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3"><Layers className="w-5 h-5 text-emerald-400" /><h2 className="text-3xl font-bold drop-shadow">Почему выбирают меня</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-emerald-500/15 grid place-content-center">{f.icon}</div><div className="font-semibold">{f.title}</div></div>
                <div className="text-sm text-slate-200">{f.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-white/10" style={tileGridStyle(56, 0.05)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3"><ImageIcon className="w-5 h-5 text-emerald-400" /><h2 className="text-3xl font-bold drop-shadow">Галерея выполненных работ</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <motion.button key={i} onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <img src={img.src} alt={img.alt} loading="lazy" className="aspect-[4/3] w-full h-full object-cover group-hover:scale-[1.03] transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute bottom-2 left-2 text-xs text-slate-200 drop-shadow">{img.alt}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 grid place-items-center p-4" role="dialog" aria-modal="true">
          <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setLightboxOpen(false)} aria-label="Закрыть">
            <X className="w-6 h-6" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)} aria-label="Предыдущее">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={galleryImages[lightboxIndex].src} alt={galleryImages[lightboxIndex].alt} className="max-h-[82vh] max-w-[92vw] rounded-2xl shadow-2xl" />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setLightboxIndex((i) => (i + 1) % galleryImages.length)} aria-label="Следующее">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      <section id="services" className="py-16 md:py-20 border-t border-white/10" style={tileGridStyle(56, 0.05)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold drop-shadow mb-6">Услуги</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
              <h3 className="font-semibold mb-2">Укладка плитки и керамогранита</h3>
              <ul className="list-disc pl-5 text-slate-200 space-y-1">
                <li>Санузлы под ключ (стены/пол)</li>
                <li>Фартук кухни</li>
                <li>Полы (жилые и коммерческие)</li>
                <li>Запил под 45°, раскладка, затирка</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
              <h3 className="font-semibold mb-2">Подготовка и сопутствующие работы</h3>
              <ul className="list-disc pl-5 text-slate-200 space-y-1">
                <li>Подготовка основания, грунтование</li>
                <li>Разметка, нивелирование плоскостей</li>
                <li>Гидроизоляция в мокрых зонах</li>
                <li>Установка профилей, герметизация</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
              <h3 className="font-semibold mb-2">Ламинат</h3>
              <ul className="list-disc pl-5 text-slate-200 space-y-1">
                <li>Подложка, укладка, плинтус</li>
              </ul>
            </div>
            <div className="rounded-2xl border border_white/10 bg-slate-900/90 p-5">
              <h3 className="font-semibold mb-2">Электрика (мелкие работы)</h3>
              <ul className="list-disc pl-5 text-slate-200 space-y-1">
                <li>Розетки, выключатели, светильники</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-white/10" style={tileGridStyle(40, 0.05)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold drop-shadow mb-4">Вопросы и ответы</h2>
          <div className="rounded-2xl border border-white/10 bg-slate-950/90 divide-y divide-white/10">
            {faq.map((item, idx) => (
              <button key={idx} className="w-full text-left p-4 hover:bg-white/5 transition" onClick={() => setOpenFAQ(openFAQ === item.q ? null : item.q)}>
                <div className="font-medium">{item.q}</div>
                {openFAQ === item.q && <div className="text-sm text-slate-300 mt-2">{item.a}</div>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10" style={tileGridStyle(48, 0.05)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div className="text-slate-300 text-sm">© {new Date().getFullYear()} {DOMAIN} • Мастер плитки — Гуренко Евгений</div>
          <div className="flex items-center gap-3">
            <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 transition bg-slate-900">
              <Phone className="w-4 h-4" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <WhatsAppButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
