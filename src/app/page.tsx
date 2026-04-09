"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/i18n";
import useLanguage from "@/components/useLanguage";
import NotificationBell from "@/components/NotificationBell";
import { setLanguagePreference } from "@/lib/language";
import AdminLink from "@/components/AdminLink";

export default function Home() {
  const language = useLanguage();
  const [cartCount, setCartCount] = useState(0);
  const [flashCountdown, setFlashCountdown] = useState(4 * 60 * 60 + 12 * 60 + 32);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("dealarada-recent-searches");
      if (!saved) return [];
      const parsed = JSON.parse(saved) as unknown;
      return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
        ? (parsed as string[])
        : [];
    } catch {
      return [];
    }
  });
  const [filters, setFilters] = useState({
    price: "Any",
    location: "Woliso",
    rating: "4+",
    brand: "All",
    codOnly: true,
  });
  const [showExitOffer, setShowExitOffer] = useState(false);
  const t =
    language === "am"
      ? {
          wolisoEdition: "ወሊሶ እትም",
          utilityLanguage: "ቋንቋ",
          utilityCurrency: "ምንዛሬ",
          utilityCallNow: "አሁን ይደውሉ",
          utilityFreeDelivery: "በወሊሶ ከ1500 ብር በላይ ነጻ መድረስ",
          searchPlaceholder: "ምርቶች፣ ሱቆች፣ ምድቦች ፈልግ...",
          search: "ፈልግ",
          sellerDashboard: "የሻጭ ዳሽቦርድ",
          signIn: "ግባ",
          cart: "ጋሪ",
          categories: "ምድቦች",
          flashDeals: "ፈጣን ቅናሾች",
          featured: "የተመረጡ",
          stores: "ሱቆች",
          sellOn: "በDealArada ላይ ሽጥ",
          trackOrder: "ትዕዛዝ ክትትል",
          app: "መተግበሪያ",
          support: "ድጋፍ",
          heroTag: "ፍላሽ ሽያጭ • የጊዜ ገደብ ቅናሾች",
          heroTitle: "ትልቅ ቅናሾች። እውነተኛ ቆጠራ። እስከ ቤትዎ መድረስ።",
          heroDesc: "ኤሌክትሮኒክስ፣ ፋሽን እና የቀን አስፈላጊ እቃዎችን በኢትዮጵያ ሙሉ ይግዙ።",
          shopNow: "አሁን ግዛ",
          todaysDeals: "የዛሬ ቅናሾች",
          flashSaleEnds: "ፍላሽ ሽያጭ ይያዛል",
          trustCod: "COD ይገኛል",
          trustSecure: "ደህንነት ያለው ክፍያ",
          trustFast: "ፈጣን መድረስ",
          becomeSeller: "ሻጭ ሁን",
          localShops: "አካባቢ ሱቆች",
          commission: "ኮሚሽን",
          avgDelivery: "አማካይ መድረስ",
          megaDeals: "ትልቅ ቅናሾች",
          megaTitle: "እስከ 35% ቅናሽ በሳምንታዊ ጥቅሎች",
          megaDesc: "የጊዜ ገደብ ያላቸው ቅናሾች በመመገቢያ፣ ፋሽን እና ኤሌክትሮኒክስ።",
          shopDeals: "ቅናሾችን ግዛ",
          shopByCategory: "በምድብ ግዛ",
          viewAll: "ሁሉን እይ",
          flashDealsTitle: "በወሊሶ የጊዜ ገደብ ቅናሾች",
          featuredPicks: "የተመረጡ ምርቶች",
          trending: "በዚህ ሳምንት ታዋቂ ምርቶች",
          newArrivals: "አዲስ የመጡ",
          freshPicks: "በዚህ ሳምንት አዲስ ምርጦች",
          featuredStores: "የተመረጡ ሱቆች",
          visitStore: "ሱቅ ጎብኝ",
          sellTag: "በDealArada ላይ ሽጥ",
          sellTitle: "ያለ ቅድመ ክፍያ ሽያጭዎን አድጉ",
          sellDesc:
            "ደንበኞችን እናመጣለን፣ ዲጂታል መደብርን እንያዝ፣ መድረስም እንተያይዛለን። ዕቃዎች በእጅዎ ይቀመጣሉ።",
          joinSeller: "ሻጭ ሆን",
          appTag: "DealArada መተግበሪያ",
          appTitle: "በDealArada መተግበሪያ ፈጣን ግዢ",
          appDesc: "አድራሻ ያስቀምጡ፣ መድረስ ይከታተሉ፣ ቅናሾችን ያግኙ።",
          ctaTitle: "DealArada በወሊሶ ለመጀመር ዝግጁ ነዎት?",
          ctaDesc: "ያለ እቃ መያዝ ጀምሩ እና በእያንዳንዱ ትዕዛዝ ያድጉ።",
          requestDemo: "ዴሞ ጠይቅ",
          talkToUs: "እኛን አናግሩ",
          footerTag: "የወሊሶ አካባቢ ገበያ",
          account: "መለያ",
          wishlist: "የምኞት ዝርዝር",
          home: "መነሻ",
          searchLabel: "ፍለጋ",
          explore: "እይ",
          addToCart: "ወደ ጋሪ ጨምር",
          deal: "ቅናሽ",
          endsIn: "ያበቃል በ",
          soldToday: "ዛሬ ተሸጧል",
          onlyLeft: "ብቻ {count} ቀርቷል",
          autoSuggestions: "ራስ-ሰር ምክሮች",
          popularSearches: "ታዋቂ ፍለጋዎች",
          recentSearches: "ቅርብ ፍለጋዎች",
          noRecentSearches: "የቅርብ ፍለጋ የለም",
          filters: "ማጣሪያዎች",
          priceRange: "የዋጋ ክልል",
          location: "አካባቢ",
          ratingLabel: "ደረጃ",
          brandLabel: "ብራንድ",
          codOnly: "COD ብቻ",
          any: "ማንኛውም",
          under500: "ከ500 ብር በታች",
          between500_1500: "500 - 1500 ብር",
          over1500: "1500+ ብር",
          all: "ሁሉም",
          mostOrdered: "🔥 በዚህ ሳምንት ብዙ የተጠየቁ",
          reviewSnippet: "4.8 ⭐ ከ214 ደንበኞች",
          exploreDeals: "ቅናሾችን ያስሱ",
          heroCoupon: "የመጀመሪያ ገዢ ኩፖን: WELCOME5 (5% ቅናሽ)",
          limitedOffer: "የጊዜ ገደብ ቅናሽ",
          exitTitle: "በመጀመሪያ ትዕዛዝ 5% ቅናሽ ያግኙ",
          exitBody: "በመክፈል ጊዜ WELCOME5 ይጠቀሙ።",
          claimDiscount: "ቅናሹን ይውሰዱ",
          sellerSnapshot: "የሻጭ አጠቃለይ",
          testimonial: "“በሁለት ሳምንት ውስጥ የኦንላይን ትዕዛዜ ተደበደበ።”",
          googlePlay: "Google Play",
          appStore: "App Store",
          footerCategories: "ምድቦች",
          footerHowItWorks: "እንዴት እንደሚሰራ",
          footerSellers: "ሻጮች",
          footerContact: "እኛን አግኙ",
          view: "እይ",
        }
      : {
          wolisoEdition: "Woliso Edition",
          utilityLanguage: "Language",
          utilityCurrency: "Currency",
          utilityCallNow: "Call Now",
          utilityFreeDelivery: "Free Delivery in Woliso Above 1500 ETB",
          searchPlaceholder: "Search products, shops, categories...",
          search: "Search",
          sellerDashboard: "Seller Dashboard",
          signIn: "Sign In",
          cart: "Cart",
          categories: "Categories",
          flashDeals: "Flash Deals",
          featured: "Featured",
          stores: "Stores",
          sellOn: "Sell on DealArada",
          trackOrder: "Track Order",
          app: "App",
          support: "Support",
          heroTag: "Flash Sale • Limited-time offers",
          heroTitle: "Big Deals. Real Savings. Delivered to Your Door.",
          heroDesc: "Shop electronics, fashion, and essentials across Ethiopia.",
          shopNow: "Shop now",
          todaysDeals: "Today’s Deals",
          flashSaleEnds: "Flash Sale Ends",
          trustCod: "COD Available",
          trustSecure: "Secure Payment",
          trustFast: "Fast Delivery",
          becomeSeller: "Become a seller",
          localShops: "Local shops",
          commission: "Commission",
          avgDelivery: "Avg delivery",
          megaDeals: "Mega Deals",
          megaTitle: "Up to 35% off weekly bundles",
          megaDesc:
            "Limited-time offers on groceries, fashion, and electronics.",
          shopDeals: "Shop deals",
          shopByCategory: "Shop by category",
          viewAll: "View all",
          flashDealsTitle: "Limited-time offers in Woliso",
          featuredPicks: "Featured picks",
          trending: "Trending products this week",
          newArrivals: "New arrivals",
          freshPicks: "Fresh picks this week",
          featuredStores: "Featured stores",
          visitStore: "Visit store",
          sellTag: "Sell on DealArada",
          sellTitle: "Grow your shop with zero upfront cost",
          sellDesc:
            "We bring customers to your shop, handle the digital storefront, and manage delivery. You keep inventory and control pricing.",
          joinSeller: "Join as a seller",
          appTag: "DealArada mobile",
          appTitle: "Shop faster on the DealArada app",
          appDesc:
            "Save your address, track deliveries, and get real-time deals.",
          ctaTitle: "Ready to launch DealArada in Woliso?",
          ctaDesc: "Start with zero inventory and grow with every order.",
          requestDemo: "Request a demo",
          talkToUs: "Talk to us",
          footerTag: "Local marketplace for Woliso",
          account: "Account",
          wishlist: "Wishlist",
          home: "Home",
          searchLabel: "Search",
          explore: "Explore",
          addToCart: "Add to cart",
          deal: "Deal",
          endsIn: "Ends in",
          soldToday: "sold today",
          onlyLeft: "Only {count} left",
          autoSuggestions: "Auto-suggestions",
          popularSearches: "Popular searches",
          recentSearches: "Recent searches",
          noRecentSearches: "No recent searches",
          filters: "Filters",
          priceRange: "Price range",
          location: "Location",
          ratingLabel: "Rating",
          brandLabel: "Brand",
          codOnly: "COD only",
          any: "Any",
          under500: "Under 500 ETB",
          between500_1500: "500 - 1500 ETB",
          over1500: "1500+ ETB",
          all: "All",
          mostOrdered: "🔥 Most Ordered This Week",
          reviewSnippet: "4.8 ⭐ from 214 customers",
          exploreDeals: "Explore deals",
          heroCoupon: "First-time buyer coupon: WELCOME5 (5% off)",
          limitedOffer: "Limited offer",
          exitTitle: "Get 5% Off Your First Order",
          exitBody: "Use code WELCOME5 at checkout.",
          claimDiscount: "Claim discount",
          sellerSnapshot: "Seller snapshot",
          testimonial: "“My shop doubled online orders in two weeks.”",
          googlePlay: "Google Play",
          appStore: "App Store",
          footerCategories: "Categories",
          footerHowItWorks: "How it works",
          footerSellers: "Sellers",
          footerContact: "Contact",
          view: "View",
        };
  const setLanguage = (next: Language) => {
    if (next === language) return;
    setLanguagePreference(next);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const readCount = () => {
      const stored = window.localStorage.getItem("dealarada-cart-count");
      const parsed = stored ? Number.parseInt(stored, 10) : 0;
      setCartCount(Number.isFinite(parsed) ? parsed : 0);
    };

    readCount();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "dealarada-cart-count") {
        readCount();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const shown = window.localStorage.getItem("dealarada-exit-offer");
    if (shown) {
      return;
    }
    const handleExit = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        setShowExitOffer(true);
        window.localStorage.setItem("dealarada-exit-offer", "shown");
      }
    };
    document.addEventListener("mouseout", handleExit);
    return () => document.removeEventListener("mouseout", handleExit);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFlashCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const popularSearches = [
    "Wireless earbuds",
    "Women’s fashion",
    "Kitchen essentials",
    "Smartphones",
    "Baby care",
  ];

  const normalizeQuery = (value: string) =>
    value.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const baseSuggestions = [
    "Bluetooth speaker",
    "Budget earphones",
    "Women’s casual dress",
    "LED torch & power bank",
    "Kids school kit",
    "Smartphone accessories",
    "Kitchen bundles",
    "Wireless earbuds",
  ];
  const synonymMap: Record<string, string[]> = {
    earphones: ["earbuds", "headphones"],
    shoes: ["sneakers", "runners"],
    kitchen: ["home & kitchen", "cookware"],
    fashion: ["style", "outfits"],
    phone: ["smartphone", "mobile"],
  };
  const normalizedQuery = normalizeQuery(searchQuery);
  const looseQuery = normalizedQuery.replace(/[aeiou]/g, "");
  const expandedTerms = normalizedQuery
    ? [
        normalizedQuery,
        ...Object.entries(synonymMap)
          .filter(([key, synonyms]) =>
            [key, ...synonyms].some((term) =>
              term.includes(normalizedQuery)
            )
          )
          .flatMap(([key, synonyms]) => [key, ...synonyms]),
      ]
    : [];
  const suggestions = baseSuggestions.filter((item) => {
    if (!normalizedQuery) return true;
    const normalizedItem = normalizeQuery(item);
    return (
      normalizedItem.includes(normalizedQuery) ||
      (looseQuery && normalizedItem.includes(looseQuery)) ||
      expandedTerms.some((term) => normalizedItem.includes(term))
    );
  });
  const didYouMean =
    normalizedQuery && suggestions.length === 0
      ? baseSuggestions.find(
          (item) =>
            normalizeQuery(item).startsWith(normalizedQuery[0]) &&
            normalizeQuery(item).length >= normalizedQuery.length - 1
        )
      : null;
  const relatedSearches = normalizedQuery
    ? popularSearches.filter((item) =>
        normalizeQuery(item).includes(normalizedQuery)
      )
    : popularSearches;

  const handleSearchSubmit = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recentSearches.filter((item) => item !== trimmed)]
      .slice(0, 5);
    setRecentSearches(next);
    window.localStorage.setItem(
      "dealarada-recent-searches",
      JSON.stringify(next)
    );
  };

  const categories = useMemo(
    () => [
      {
        name: language === "am" ? "ኤሌክትሮኒክስ" : "Electronics",
        icon: "📱",
      },
      { name: language === "am" ? "ፋሽን" : "Fashion", icon: "👕" },
      {
        name: language === "am" ? "ቤት እና ምግብ ቤት" : "Home & Kitchen",
        icon: "🏠",
      },
      { name: language === "am" ? "ውበት" : "Beauty", icon: "💄" },
      { name: language === "am" ? "ልጆች" : "Kids", icon: "🧒" },
      {
        name: language === "am" ? "መለዋወጫዎች" : "Accessories",
        icon: "🖥️",
      },
    ],
    [language]
  );
  const heroBenefits = useMemo(
    () => [
      {
        title: language === "am" ? "ፈጣን መድረስ" : "Express delivery",
        desc: language === "am" ? "በ45 ደቂቃ ውስጥ" : "Within 45 minutes",
      },
      {
        title: language === "am" ? "የተረጋገጡ ሻጮች" : "Verified sellers",
        desc: language === "am" ? "እርግጠኛ ሱቆች ብቻ" : "Trusted shops only",
      },
      {
        title: language === "am" ? "በመቀበል ጊዜ ክፍያ" : "Cash on delivery",
        desc: language === "am" ? "ካገኙ በኋላ ይክፈሉ" : "Pay after you receive",
      },
      {
        title: language === "am" ? "የቀን ድጋፍ" : "Daily support",
        desc: language === "am" ? "ቻት እና ስልክ ድጋፍ" : "Chat & phone help",
      },
    ],
    [language]
  );
  const sellerBenefits = useMemo(
    () =>
      language === "am"
        ? [
            "ምርት ዝርዝር እና ማስተዋወቂያ",
            "ዕለታዊ የትዕዛዝ ማሳወቂያ",
            "ግልፅ ኮሚሽን እና ፈጣን ክፍያ",
            "አካባቢ መድረሻ አቀናብር",
          ]
        : [
            "Product listing and promotion",
            "Daily order notifications",
            "Fast settlement with transparent commission",
            "Local delivery coordination",
          ],
    [language]
  );
  const sellerStats = useMemo(
    () =>
      language === "am"
        ? [
            { label: "ሳምንታዊ ትዕዛዞች", value: "120+" },
            { label: "አማካይ መድረሻ ጊዜ", value: "35 ደቂቃ" },
            { label: "የኮሚሽን ክልል", value: "5-15%" },
          ]
        : [
            { label: "Weekly orders", value: "120+" },
            { label: "Avg. delivery time", value: "35 min" },
            { label: "Commission range", value: "5-15%" },
          ],
    [language]
  );
  const supportCards = useMemo(
    () =>
      language === "am"
        ? [
            {
              title: "ደህንነት ያለው ክፍያ",
              desc: "በመቀበል ጊዜ ወይም በሞባይል ገንዘብ ይክፈሉ።",
            },
            {
              title: "ታማኝ መድረሻ",
              desc: "የተማሩ ነጂዎች ከክትትል ጋር።",
            },
            {
              title: "የደንበኛ ድጋፍ",
              desc: "በስልክ እና በTelegram ዕለታዊ እገዛ።",
            },
          ]
        : [
            {
              title: "Secure payments",
              desc: "Cash on delivery or pay with mobile money.",
            },
            {
              title: "Reliable delivery",
              desc: "Trained riders with tracking updates.",
            },
            {
              title: "Customer support",
              desc: "Daily help via phone and Telegram.",
            },
          ],
    [language]
  );
  const footerLinks = useMemo(
    () => [
      { label: t.footerCategories, href: "#categories" },
      { label: t.footerHowItWorks, href: "#how-it-works" },
      { label: t.footerSellers, href: "#sellers" },
      { label: t.footerContact, href: "#cta" },
    ],
    [t.footerCategories, t.footerHowItWorks, t.footerSellers, t.footerContact]
  );

  const flashDeals = [
    {
      title: "Smartphone accessories bundle",
      price: "699 ETB",
      oldPrice: "999 ETB",
      badge: "-25%",
      image: "/products/photo_1_2026-02-12_05-59-42.jpg",
      rating: 4.7,
      reviews: 128,
      soldToday: 23,
      stockLeft: 4,
    },
    {
      title: "Budget earphones",
      price: "320 ETB",
      oldPrice: "450 ETB",
      badge: "-25%",
      image: "/products/photo_2_2026-02-12_05-59-42.jpg",
      rating: 4.4,
      reviews: 86,
      soldToday: 23,
      stockLeft: 4,
    },
    {
      title: "Women’s casual dress",
      price: "890 ETB",
      oldPrice: "1,120 ETB",
      badge: "-25%",
      image: "/products/photo_3_2026-02-12_05-59-42.jpg",
      rating: 4.6,
      reviews: 64,
      soldToday: 23,
      stockLeft: 4,
    },
    {
      title: "Men’s casual shoes",
      price: "1,150 ETB",
      oldPrice: "1,450 ETB",
      badge: "-25%",
      image: "/products/photo_4_2026-02-12_05-59-42.jpg",
      rating: 4.5,
      reviews: 112,
      soldToday: 23,
      stockLeft: 4,
    },
  ];

  const featuredProducts = [
    {
      name: "Sports sneakers",
      price: "1,180 ETB",
      store: "Sheger Fashion",
      slug: "sports-sneakers",
      image: "/products/photo_5_2026-02-12_05-59-42.jpg",
    },
    {
      name: "Bluetooth speaker",
      price: "1,350 ETB",
      store: "Tech House",
      slug: "bluetooth-speaker",
      image: "/products/photo_6_2026-02-12_05-59-42.jpg",
    },
    {
      name: "Kids school kit",
      price: "430 ETB",
      store: "Bright Stationery",
      slug: "kids-school-kit",
      image: "/products/photo_7_2026-02-12_05-59-42.jpg",
    },
    {
      name: "Women’s handbag",
      price: "780 ETB",
      store: "Woliso Style",
      slug: "womens-handbag",
      image: "/products/photo_8_2026-02-12_05-59-42.jpg",
    },
    {
      name: "Men’s casual set",
      price: "980 ETB",
      store: "Sheger Fashion",
      slug: "mens-casual-set",
      image: "/products/photo_9_2026-02-12_05-59-42.jpg",
    },
    {
      name: "LED torch & power bank",
      price: "760 ETB",
      store: "Woliso Electronics",
      slug: "led-torch-power-bank",
      image: "/products/photo_10_2026-02-12_05-59-42.jpg",
    },
  ];

  const partnerStores = [
    { name: "Tech House", focus: "Electronics & accessories" },
    { name: "Alem Coffee", focus: "Local coffee & tea" },
    { name: "Sheger Fashion", focus: "Clothes & shoes" },
    { name: "Green Farm", focus: "Organic groceries" },
  ];

  const newArrivals = [
    {
      name: "Premium running shoes",
      price: "2,180 ETB",
      store: "Sheger Fashion",
      slug: "premium-running-shoes",
      image: "/products/photo_14_2026-02-12_05-59-42.jpg",
    },
    {
      name: "Classic leather handbag",
      price: "2,450 ETB",
      store: "Woliso Style",
      slug: "classic-leather-handbag",
      image: "/products/photo_15_2026-02-12_05-59-42.jpg",
    },
    {
      name: "Luxury wrist watch",
      price: "2,780 ETB",
      store: "Time Zone",
      slug: "luxury-wrist-watch",
      image: "/products/photo_18_2026-02-12_05-59-42.jpg",
    },
    {
      name: "Premium fashion set",
      price: "2,950 ETB",
      store: "Sheger Fashion",
      slug: "premium-fashion-set",
      image: "/products/photo_22_2026-02-12_05-59-42.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-900/10 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white/70">{t.utilityLanguage}:</span>
              <div className="flex overflow-hidden rounded-full border border-white/20 bg-white/10">
                <button
                  type="button"
                  onClick={() => setLanguage("am")}
                  className={`px-3 py-1 text-xs font-semibold transition ${
                    language === "am"
                      ? "bg-white text-slate-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  🇪🇹 አማርኛ
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-xs font-semibold transition ${
                    language === "en"
                      ? "bg-white text-slate-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  English
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span>{t.utilityCurrency}:</span>
              <span className="font-semibold text-white">ETB</span>
            </div>
          </div>
          <div className="text-white/90">{t.utilityFreeDelivery}</div>
          <a
            href="tel:+251000000000"
            className="inline-flex items-center gap-2 font-semibold text-white hover:text-white/90"
          >
            <span aria-hidden>📞</span>
            {t.utilityCallNow}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-6 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
        <Image
                src="/dealarada-logo.png"
                alt="DealArada logo"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
          priority
        />
            </div>
            <div>
              <p className="text-lg font-semibold">DealArada</p>
              <p className="text-xs text-slate-500">{t.wolisoEdition}</p>
            </div>
          </div>

          <div className="relative w-full">
            <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm shadow-sm transition focus-within:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-100">
            <span className="text-slate-400">🔍</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            />
            <button
              onClick={handleSearchSubmit}
              className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t.search}
            </button>
          </div>
            {searchOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-lg">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    {didYouMean && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        {language === "am"
                          ? "ማለት ተፈልጎ የሚሆነው"
                          : "Did you mean"}{" "}
                        <button
                          type="button"
                          className="font-semibold underline"
                          onClick={() => setSearchQuery(didYouMean)}
                        >
                          {didYouMean}
                        </button>
                        ?
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {t.autoSuggestions}
                      </p>
                      <div className="mt-2 flex flex-col gap-2">
                        {suggestions.slice(0, 5).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSearchQuery(item)}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {language === "am" ? "ተያያዥ ፍለጋ" : "Related searches"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {relatedSearches.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSearchQuery(item)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {t.popularSearches}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {popularSearches.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSearchQuery(item)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {t.recentSearches}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recentSearches.length === 0 && (
                          <span className="text-xs text-slate-400">
                            {t.noRecentSearches}
                          </span>
                        )}
                        {recentSearches.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSearchQuery(item)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      {t.filters}
                    </p>
                    <div className="grid gap-2 text-xs text-slate-600">
                      <label className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                        <span>{t.priceRange}</span>
                        <select
                          value={filters.price}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              price: event.target.value,
                            }))
                          }
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                        >
                          <option>{t.any}</option>
                          <option>{t.under500}</option>
                          <option>{t.between500_1500}</option>
                          <option>{t.over1500}</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                        <span>{t.location}</span>
                        <select
                          value={filters.location}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              location: event.target.value,
                            }))
                          }
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                        >
                          <option>Woliso</option>
                          <option>Addis Ababa</option>
                          <option>Adama</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                        <span>{t.ratingLabel}</span>
                        <select
                          value={filters.rating}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              rating: event.target.value,
                            }))
                          }
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                        >
                          <option>4+</option>
                          <option>3+</option>
                          <option>{t.all}</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                        <span>{t.brandLabel}</span>
                        <select
                          value={filters.brand}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              brand: event.target.value,
                            }))
                          }
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                        >
                          <option>{t.all}</option>
                          <option>Samsung</option>
                          <option>Apple</option>
                          <option>Local</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                        <span>{t.codOnly}</span>
                        <input
                          type="checkbox"
                          checked={filters.codOnly}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              codOnly: event.target.checked,
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:justify-end">
            <NotificationBell />
            <AdminLink />
            <Link
              href="/login"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              {t.account}
            </Link>
            <Link
              href="/wishlist"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              {t.wishlist}
            </Link>
            <Link
              href="/cart"
              className="relative rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t.cart}
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-6 py-3 text-sm text-slate-600">
            <Link href="/categories" className="font-semibold text-slate-900">
              {t.categories}
            </Link>
            <a href="#deals" className="hover:text-slate-900">
              {t.flashDeals}
            </a>
            <a href="#featured" className="hover:text-slate-900">
              {t.featured}
          </a>
            <a href="#stores" className="hover:text-slate-900">
              {t.stores}
            </a>
            <Link href="/seller" className="hover:text-slate-900">
              {t.sellOn}
            </Link>
            <Link href="/track" className="hover:text-slate-900">
              {t.trackOrder}
            </Link>
            <a href="#app" className="hover:text-slate-900">
              {t.app}
            </a>
            <a href="#support" className="hover:text-slate-900">
              {t.support}
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-white via-white to-slate-50">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {t.heroCoupon}
              </div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t.heroTag}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                {t.heroTitle}
              </h1>
              <p className="text-lg text-slate-600">{t.heroDesc}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/categories"
                  className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  🛒 {t.shopNow}
                </Link>
                <Link
                  href="/seller"
                  className="rounded-full border border-orange-200 px-6 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:border-orange-300"
                >
                  🔥 {t.todaysDeals}
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                  <span>{t.flashSaleEnds}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-700">
                    {formatCountdown(flashCountdown)}
                  </span>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1">
                  {t.trustCod}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1">
                  {t.trustSecure}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1">
                  {t.trustFast}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-2xl border border-emerald-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <div>
                  <p className="text-xl font-semibold text-slate-900">30+</p>
                  <p>{t.localShops}</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">5-15%</p>
                  <p>{t.commission}</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">45 min</p>
                  <p>{t.avgDelivery}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-emerald-600">
                  {t.megaDeals}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {t.megaTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{t.megaDesc}</p>
                <Link
                  href="/categories"
                  className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  {t.shopDeals}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {heroBenefits.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="mb-3 h-10 w-10 rounded-xl bg-emerald-100" />
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  {t.shopByCategory}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {t.shopByCategory}
                </h2>
              </div>
              <Link
                href="/categories"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-600"
              >
                {t.viewAll}
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href="/categories"
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                    {category.icon}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-base font-semibold text-slate-900">
                      {category.name}
                    </p>
                  <p className="text-xs text-slate-500">{t.exploreDeals}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="deals" className="bg-slate-50 py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  {t.flashDeals}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {t.flashDealsTitle}
                </h2>
              </div>
              <div className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700">
                {t.endsIn} 04:12:32
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flashDeals.map((deal) => (
                <div
                  key={deal.title}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      {deal.badge}
                    </span>
                    <span className="text-xs text-slate-400">{t.deal}</span>
                  </div>
                  <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      width={400}
                      height={320}
                    className="h-32 w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {deal.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-xs text-slate-400 line-through">
                      {deal.oldPrice}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {deal.price}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-amber-500">⭐</span>
                    <span className="font-semibold text-slate-700">
                      {deal.rating}
                    </span>
                    <span>({deal.reviews})</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>
                        {deal.soldToday} {t.soldToday}
                      </span>
                      <span className="font-semibold text-orange-600">
                        {t.onlyLeft.replace(
                          "{count}",
                          deal.stockLeft.toString()
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: "70%" }}
                      />
                    </div>
                  </div>
                  <Link
                    href="/cart"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
                  >
                    {t.addToCart}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="featured" className="py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  {t.mostOrdered}
                </p>
                <p className="text-sm font-semibold text-emerald-600">
                  {t.featuredPicks}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {t.trending}
                </h2>
                <p className="text-xs text-slate-500">{t.reviewSnippet}</p>
              </div>
              <Link
                href="/categories"
                className="text-sm font-semibold text-emerald-700"
              >
                {t.viewAll}
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <div
                  key={product.name}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={320}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">{product.store}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">
                      {product.price}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                    >
                      {t.view}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="new-arrivals" className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  {t.newArrivals}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {t.freshPicks}
                </h2>
              </div>
              <Link
                href="/categories"
                className="text-sm font-semibold text-emerald-700"
              >
                {t.viewAll}
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map((item) => (
                <Link
                  key={item.name}
                  href={`/products/${item.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={320}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.store}</p>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {item.price}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="stores" className="bg-slate-50 py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.featuredStores}
              </h2>
              <Link
                href="/categories"
                className="text-sm font-semibold text-emerald-700"
              >
                {t.viewAll}
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {partnerStores.map((store) => (
                <div
                  key={store.name}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {store.name}
                    </p>
                    <p className="text-sm text-slate-500">{store.focus}</p>
                  </div>
                  <Link
                    href="/categories"
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm"
                  >
                    {t.visitStore}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="sellers" className="py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div className="space-y-5">
                <p className="text-sm font-semibold text-emerald-600">
                  {t.sellTag}
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.sellTitle}
                </h2>
                <p className="text-slate-600">{t.sellDesc}</p>
                <ul className="space-y-3 text-sm text-slate-600">
                  {sellerBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/seller"
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {t.joinSeller}
                </Link>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  {t.sellerSnapshot}
                </h3>
                <div className="mt-6 space-y-5">
                  {sellerStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm"
                    >
                      <span className="text-slate-500">{stat.label}</span>
                      <span className="font-semibold text-slate-900">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                  {t.testimonial}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="app" className="bg-emerald-600 py-14 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase text-emerald-100">
                {t.appTag}
              </p>
              <h2 className="text-3xl font-semibold">{t.appTitle}</h2>
              <p className="text-emerald-100">{t.appDesc}</p>
              <div className="flex flex-wrap gap-3">
              <Link
                href="/checkout"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
              >
                {t.googlePlay}
              </Link>
                <button className="rounded-full border border-white/50 px-5 py-2 text-sm font-semibold text-white shadow-sm">
                {t.appStore}
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/30 bg-emerald-500/40 p-6">
              <div className="h-56 rounded-2xl bg-white/20" />
            </div>
          </div>
        </section>

        <section id="support" className="py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {supportCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 h-10 w-10 rounded-xl bg-emerald-100" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="payment-trust" className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  "Telebirr (Integrated)",
                  "CBE Birr",
                  "Cash on Delivery",
                  "Visa / MasterCard",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-slate-600">
                Secure Payments | 7-Day Return | Verified Sellers
              </p>
            </div>
          </div>
        </section>

        <section id="cta" className="bg-slate-900 py-14 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold">{t.ctaTitle}</h2>
              <p className="text-slate-300">{t.ctaDesc}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/seller"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm"
              >
                {t.requestDemo}
              </Link>
              <Link
                href="/checkout"
                className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white shadow-sm"
              >
                {t.talkToUs}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-10 pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
              <Image
                src="/dealarada-logo.png"
                alt="DealArada logo"
                width={140}
                height={44}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">DealArada</p>
              <p className="text-sm text-slate-500">{t.footerTag}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-slate-900">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {showExitOffer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-orange-600">
                  {t.limitedOffer}
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  {t.exitTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{t.exitBody}</p>
              </div>
              <button
                onClick={() => setShowExitOffer(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <Link
              href="/checkout"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              {t.claimDiscount}
            </Link>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-10px_30px_-20px_rgba(15,23,42,0.3)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-xs font-semibold text-slate-600">
          <Link href="/" className="flex flex-col items-center gap-1">
            <span className="text-lg">🏠</span>
            {t.home}
          </Link>
          <Link href="/categories" className="flex flex-col items-center gap-1">
            <span className="text-lg">🗂️</span>
            {t.categories}
          </Link>
          <Link href="/" className="flex flex-col items-center gap-1">
            <span className="text-lg">🔎</span>
            {t.searchLabel}
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-1">
            <span className="text-lg">🛒</span>
            {t.cart}
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-1">
            <span className="text-lg">👤</span>
            {t.account}
          </Link>
        </div>
      </nav>
    </div>
  );
}
