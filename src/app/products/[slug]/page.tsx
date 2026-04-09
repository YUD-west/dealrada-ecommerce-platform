"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useLanguage from "@/components/useLanguage";

const productMap: Record<
  string,
  {
    name: string;
    nameAm: string;
    price: string;
    store: string;
    description: string;
    descriptionAm: string;
    image: string;
    rating: number;
    stock: number;
    category: string;
  }
> = {
  "budget-earphones": {
    name: "Budget earphones",
    nameAm: "ዋጋ ተመጣጣኝ ኢርፖኖች",
    price: "320 ETB",
    store: "Tech House",
    description: "Lightweight earphones with clear sound and strong bass.",
    descriptionAm: "ቀላል ክብደት ያላቸው እና ግልጽ ድምፅ ያላቸው ኢርፖኖች።",
    image: "/products/photo_2_2026-02-12_05-59-42.jpg",
    rating: 4.2,
    stock: 14,
    category: "Electronics",
  },
  "womens-casual-dress": {
    name: "Women’s casual dress",
    nameAm: "የሴቶች ዕለታዊ ልብስ",
    price: "890 ETB",
    store: "Woliso Style",
    description: "Comfortable everyday dress for work or weekend.",
    descriptionAm: "ለስራ ወይም ለመዝናኛ ተስማሚ የዕለታዊ ልብስ።",
    image: "/products/photo_3_2026-02-12_05-59-42.jpg",
    rating: 4.5,
    stock: 10,
    category: "Fashion",
  },
  "mens-casual-shoes": {
    name: "Men’s casual shoes",
    nameAm: "የወንዶች የዕለታዊ ጫማ",
    price: "1,150 ETB",
    store: "Sheger Fashion",
    description: "Durable casual shoes for daily wear.",
    descriptionAm: "ለዕለታዊ እግር ጉዞ ተስማሚ ጽኑ ጫማ።",
    image: "/products/photo_4_2026-02-12_05-59-42.jpg",
    rating: 4.4,
    stock: 9,
    category: "Fashion",
  },
  "sports-sneakers": {
    name: "Sports sneakers",
    nameAm: "የስፖርት ስኒከርስ",
    price: "1,180 ETB",
    store: "Sheger Fashion",
    description: "Comfortable sneakers for running and everyday use.",
    descriptionAm: "ለሩጫ እና ለዕለታዊ አጠቃቀም ተስማሚ ስኒከርስ።",
    image: "/products/photo_5_2026-02-12_05-59-42.jpg",
    rating: 4.6,
    stock: 12,
    category: "Fashion",
  },
  "bluetooth-speaker": {
    name: "Bluetooth speaker",
    nameAm: "ብሉቱዝ ስፒከር",
    price: "1,350 ETB",
    store: "Tech House",
    description: "Portable speaker with deep bass and 6-hour battery.",
    descriptionAm: "ተንቀሳቃሽ ስፒከር ከጥልቅ ባስ እና 6 ሰዓት ባትሪ ጋር።",
    image: "/products/photo_6_2026-02-12_05-59-42.jpg",
    rating: 4.4,
    stock: 8,
    category: "Electronics",
  },
  "kids-school-kit": {
    name: "Kids school kit",
    nameAm: "የልጆች ትምህርት ቦርሳ ስብስብ",
    price: "430 ETB",
    store: "Bright Stationery",
    description: "Notebook set, pens, backpack, and stationery essentials.",
    descriptionAm: "ኖትቡክ ስብስብ፣ ብዕሮች፣ ቦርሳ እና የትምህርት እቃዎች።",
    image: "/products/photo_7_2026-02-12_05-59-42.jpg",
    rating: 4.7,
    stock: 16,
    category: "Stationery",
  },
  "womens-handbag": {
    name: "Women’s handbag",
    nameAm: "የሴቶች ቦርሳ",
    price: "780 ETB",
    store: "Woliso Style",
    description: "Stylish handbag with enough space for daily essentials.",
    descriptionAm: "ለዕለታዊ እቃዎች በቂ ቦታ ያለው ዘመናዊ ቦርሳ።",
    image: "/products/photo_8_2026-02-12_05-59-42.jpg",
    rating: 4.3,
    stock: 6,
    category: "Fashion",
  },
  "mens-casual-set": {
    name: "Men’s casual set",
    nameAm: "የወንዶች ዕለታዊ ልብስ ስብስብ",
    price: "980 ETB",
    store: "Sheger Fashion",
    description: "Comfortable casual outfit for daily wear.",
    descriptionAm: "ለዕለታዊ አጠቃቀም ተስማሚ ምቹ ልብስ።",
    image: "/products/photo_9_2026-02-12_05-59-42.jpg",
    rating: 4.1,
    stock: 7,
    category: "Fashion",
  },
  "led-torch-power-bank": {
    name: "LED torch & power bank",
    nameAm: "LED መብራት እና ፓወር ባንክ",
    price: "760 ETB",
    store: "Woliso Electronics",
    description: "Rechargeable LED torch with built-in power bank.",
    descriptionAm: "ተሞላ የሚሆን LED መብራት ከተካተተ ፓወር ባንክ ጋር።",
    image: "/products/photo_10_2026-02-12_05-59-42.jpg",
    rating: 4.5,
    stock: 11,
    category: "Electronics",
  },
  "casual-backpack": {
    name: "Casual backpack",
    nameAm: "የዕለታዊ ቦርሳ",
    price: "640 ETB",
    store: "Urban Bags",
    description: "Multi-pocket backpack for school or travel.",
    descriptionAm: "ለትምህርት ወይም ጉዞ ብዙ ኪስ ያለው ቦርሳ።",
    image: "/products/photo_11_2026-02-12_05-59-42.jpg",
    rating: 4.2,
    stock: 13,
    category: "Fashion",
  },
  "classic-wrist-watch": {
    name: "Classic wrist watch",
    nameAm: "የባለታሪክ እጅ ሰዓት",
    price: "720 ETB",
    store: "Time Zone",
    description: "Classic design with durable strap and clear dial.",
    descriptionAm: "ጽኑ ጥርፍ እና ግልጽ መለኪያ ያለው የባለታሪክ ዲዛይን።",
    image: "/products/photo_12_2026-02-12_05-59-42.jpg",
    rating: 4.3,
    stock: 5,
    category: "Fashion",
  },
  "ladies-sandals": {
    name: "Ladies sandals",
    nameAm: "የሴቶች ሳንዳል",
    price: "520 ETB",
    store: "Woliso Style",
    description: "Lightweight sandals for daily comfort.",
    descriptionAm: "ለዕለታዊ ምቹነት ቀላል ሳንዳሎች።",
    image: "/products/photo_13_2026-02-12_05-59-42.jpg",
    rating: 4.1,
    stock: 15,
    category: "Fashion",
  },
  "premium-running-shoes": {
    name: "Premium running shoes",
    nameAm: "ፕሪሚየም የሩጫ ጫማ",
    price: "2,180 ETB",
    store: "Sheger Fashion",
    description: "High-grip running shoes with breathable lining.",
    descriptionAm: "ከፍተኛ መጠን ያለው የመያዣ እና የእርጥበት መቆጣጠሪያ ማቅረብ ያላቸው የሩጫ ጫማዎች።",
    image: "/products/photo_14_2026-02-12_05-59-42.jpg",
    rating: 4.6,
    stock: 6,
    category: "Fashion",
  },
  "classic-leather-handbag": {
    name: "Classic leather handbag",
    nameAm: "የባለታሪክ ቆዳ ቦርሳ",
    price: "2,450 ETB",
    store: "Woliso Style",
    description: "Elegant leather handbag for work and daily use.",
    descriptionAm: "ለስራ እና ለዕለታዊ አጠቃቀም ተስማሚ የቆዳ ቦርሳ።",
    image: "/products/photo_15_2026-02-12_05-59-42.jpg",
    rating: 4.5,
    stock: 4,
    category: "Fashion",
  },
  "premium-casual-sneakers": {
    name: "Premium casual sneakers",
    nameAm: "ፕሪሚየም የዕለታዊ ስኒከርስ",
    price: "2,320 ETB",
    store: "Sheger Fashion",
    description: "Comfortable sneakers with modern styling.",
    descriptionAm: "ተመጣጣኝ ቅርፅ ያለው ምቹ ስኒከርስ።",
    image: "/products/photo_16_2026-02-12_05-59-42.jpg",
    rating: 4.4,
    stock: 3,
    category: "Fashion",
  },
  "stylish-backpack": {
    name: "Stylish backpack",
    nameAm: "ዘመናዊ ቦርሳ",
    price: "2,060 ETB",
    store: "Urban Bags",
    description: "Roomy backpack with multiple compartments.",
    descriptionAm: "ብዙ ክፍሎች ያሉት ሰፊ ቦርሳ።",
    image: "/products/photo_17_2026-02-12_05-59-42.jpg",
    rating: 4.2,
    stock: 8,
    category: "Fashion",
  },
  "luxury-wrist-watch": {
    name: "Luxury wrist watch",
    nameAm: "የሁሉ ደረጃ እጅ ሰዓት",
    price: "2,780 ETB",
    store: "Time Zone",
    description: "Classic dial with premium strap finish.",
    descriptionAm: "ጥሩ ጥርፍ ያለው የባለጌ እጅ ሰዓት።",
    image: "/products/photo_18_2026-02-12_05-59-42.jpg",
    rating: 4.7,
    stock: 2,
    category: "Fashion",
  },
  "designer-handbag": {
    name: "Designer handbag",
    nameAm: "ዲዛይነር ቦርሳ",
    price: "2,690 ETB",
    store: "Woliso Style",
    description: "Statement bag with premium stitching.",
    descriptionAm: "የሚለይ ዲዛይን ያለው የቆዳ ቦርሳ።",
    image: "/products/photo_19_2026-02-12_05-59-42.jpg",
    rating: 4.6,
    stock: 5,
    category: "Fashion",
  },
  "formal-mens-shoes": {
    name: "Formal men’s shoes",
    nameAm: "የወንዶች ፎርማል ጫማ",
    price: "2,430 ETB",
    store: "Sheger Fashion",
    description: "Smart formal shoes for office and events.",
    descriptionAm: "ለቢሮ እና ለዝግጅቶች ተስማሚ ፎርማል ጫማ።",
    image: "/products/photo_20_2026-02-12_05-59-42.jpg",
    rating: 4.4,
    stock: 4,
    category: "Fashion",
  },
  "womens-fashion-heels": {
    name: "Women’s fashion heels",
    nameAm: "የሴቶች ፋሽን ሂል",
    price: "2,120 ETB",
    store: "Woliso Style",
    description: "Stylish heels for special occasions.",
    descriptionAm: "ለልዩ አጋጣሚዎች የተስማማ ሂል።",
    image: "/products/photo_21_2026-02-12_05-59-42.jpg",
    rating: 4.3,
    stock: 6,
    category: "Fashion",
  },
  "premium-fashion-set": {
    name: "Premium fashion set",
    nameAm: "ፕሪሚየም ፋሽን ስብስብ",
    price: "2,950 ETB",
    store: "Sheger Fashion",
    description: "Coordinated set with modern tailoring.",
    descriptionAm: "ዘመናዊ ቅርፅ ያለው ተዛማጅ ልብስ ስብስብ።",
    image: "/products/photo_22_2026-02-12_05-59-42.jpg",
    rating: 4.8,
    stock: 3,
    category: "Fashion",
  },
  "leather-travel-bag": {
    name: "Leather travel bag",
    nameAm: "የቆዳ የጉዞ ቦርሳ",
    price: "2,610 ETB",
    store: "Urban Bags",
    description: "Spacious travel bag with leather finish.",
    descriptionAm: "ሰፊ እና የቆዳ ጨርቅ ያለው የጉዞ ቦርሳ።",
    image: "/products/photo_23_2026-02-12_05-59-42.jpg",
    rating: 4.5,
    stock: 5,
    category: "Fashion",
  },
  "smart-casual-shoes": {
    name: "Smart casual shoes",
    nameAm: "ስማርት ካዙዋል ጫማ",
    price: "2,340 ETB",
    store: "Sheger Fashion",
    description: "Everyday smart shoes with soft padding.",
    descriptionAm: "ለዕለታዊ አጠቃቀም ተስማሚ ለስማርት ቅርፅ እና ምቹ ክፍል።",
    image: "/products/photo_24_2026-02-12_05-59-42.jpg",
    rating: 4.4,
    stock: 7,
    category: "Fashion",
  },
  "designer-womens-bag": {
    name: "Designer women’s bag",
    nameAm: "ዲዛይነር የሴቶች ቦርሳ",
    price: "2,730 ETB",
    store: "Woliso Style",
    description: "Premium bag with gold-tone accents.",
    descriptionAm: "የወርቅ አሳይ የተደረገ የክፍያ ቦርሳ።",
    image: "/products/photo_25_2026-02-12_05-59-42.jpg",
    rating: 4.6,
    stock: 4,
    category: "Fashion",
  },
  "premium-sports-shoes": {
    name: "Premium sports shoes",
    nameAm: "ፕሪሚየም የስፖርት ጫማ",
    price: "2,520 ETB",
    store: "Sheger Fashion",
    description: "Lightweight sports shoes for daily training.",
    descriptionAm: "ለዕለታዊ ስልጠና ተስማሚ ቀላል የስፖርት ጫማ።",
    image: "/products/photo_26_2026-02-12_05-59-42.jpg",
    rating: 4.7,
    stock: 5,
    category: "Fashion",
  },
  "executive-leather-shoes": {
    name: "Executive leather shoes",
    nameAm: "የአስፈፃሚ ቆዳ ጫማ",
    price: "2,870 ETB",
    store: "Sheger Fashion",
    description: "Executive leather shoes with polished finish.",
    descriptionAm: "የተቀለቀ መጨረሻ ያለው የቆዳ ፎርማል ጫማ።",
    image: "/products/photo_27_2026-02-12_05-59-42.jpg",
    rating: 4.8,
    stock: 3,
    category: "Fashion",
  },
};

export default function ProductPage() {
  const language = useLanguage();
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug;
  const t =
    language === "am"
      ? {
          categories: "ምድቦች",
          cart: "ጋሪ",
          deliveryEstimate: "መድረስ በ45-60 ደቂቃ",
          inStock: "በክምችት ውስጥ",
          outOfStock: "አልተገኘም",
          left: "{count} ቀርቷል",
          ratingLabel: "ደረጃ",
          sellerRatingLabel: "የሻጭ ደረጃ",
          viewedToday: "ዛሬ የታየ ሰው",
          lastPurchased: "መጨረሻ ግዢ ከ{minutes} ደቂቃ በፊት",
          codAvailable: "COD ይገኛል",
          freeDelivery: "ነጻ መድረስ",
          buyNow: "አሁን ግዛ",
          addToCart: "ወደ ጋሪ ጨምር",
          payment: "ክፍያ: በመቀበል ጊዜ ወይም በሞባይል ገንዘብ",
          returns: "መመለስ: ለተፈቀዱ እቃዎች በ24 ሰዓት ውስጥ",
          reviewsTitle: "ደረጃዎች እና ግምገማዎች",
          reviewsCount: "{count} ግምገማዎች",
          checkingAccount: "መለያዎን እየመረመርን ነው...",
          buyersOnly: "ግምገማ ለመስጠት የገዢ መለያ ያስፈልጋል።",
          postReview: "ግምገማ ያስገቡ",
          reviewSubmitted: "ግምገማ ተልኳል። ለማጣራት በቅርቡ ይታያል።",
          reviewFailed: "ግምገማ ማስገባት አልተሳካም።",
          reviewPhotos: "የደንበኛ ፎቶዎች",
          faq: "ተደጋጋሚ ጥያቄዎች",
          faqDeliveryQ: "መድረስ ፈጣን ነው?",
          faqDeliveryA: "አብዛኞቹ ትዕዛዞች በ45-60 ደቂቃ ውስጥ ይደርሳሉ።",
          faqCodQ: "COD አለ?",
          faqCodA: "አዎ፣ COD ለተፈቀዱ እቃዎች ይገኛል።",
          faqReturnQ: "መመለስ እችላለሁ?",
          faqReturnA: "ተስማሚ እቃዎች ለ24 ሰዓት ውስጥ መመለስ ይቻላል።",
          relatedItems: "ተመሳሳይ እቃዎች",
          viewAll: "ሁሉን እይ",
          ratingFormat: "ደረጃ {rating} / 5",
        }
      : {
          categories: "Categories",
          cart: "Cart",
          deliveryEstimate: "Delivery in 45-60 minutes",
          inStock: "In stock",
          outOfStock: "Out of stock",
          left: "{count} left",
          ratingLabel: "Rating",
          sellerRatingLabel: "Seller rating",
          viewedToday: "people viewed this today",
          lastPurchased: "Last purchased {minutes} minutes ago",
          codAvailable: "COD Available",
          freeDelivery: "Free delivery",
          buyNow: "Buy Now",
          addToCart: "Add to Cart",
          payment: "Payment: Cash on delivery or mobile money.",
          returns: "Returns: 24-hour return policy for eligible items.",
          reviewsTitle: "Ratings & reviews",
          reviewsCount: "{count} reviews",
          checkingAccount: "Checking your account...",
          buyersOnly: "Only signed-in buyers can post reviews.",
          postReview: "Post review",
          reviewSubmitted:
            "Review submitted. It will appear after moderation.",
          reviewFailed: "Failed to post review.",
          reviewReward:
            "Earn rewards for reviews: get 5 ETB credit after a verified review.",
          reviewPhotos: "Review photos",
          faq: "FAQ",
          faqDeliveryQ: "How fast is delivery?",
          faqDeliveryA: "Most orders arrive within 45-60 minutes in Woliso.",
          faqCodQ: "Can I pay cash on delivery?",
          faqCodA: "Yes, COD is available for eligible items.",
          faqReturnQ: "What if I need a return?",
          faqReturnA: "Returns are accepted within 24 hours for qualifying products.",
          relatedItems: "Related items",
          viewAll: "View all",
          ratingFormat: "Rating {rating} / 5",
          stars: "stars",
          quickFeedbackPlaceholder: "Share quick feedback",
        };
  const product =
    productMap[slug ?? ""] ?? {
      name: "Product not found",
      nameAm: "ምርት አልተገኘም",
      price: "--",
      store: "DealArada",
      description: "This item is not available right now.",
      descriptionAm: "ይህ ምርት አሁን አይገኝም።",
      image: "/products/photo_1_2026-02-12_05-59-42.jpg",
      rating: 0,
      stock: 0,
      category: "Other",
    };

  const discountBadge = "25% OFF";
  const categoryLabel =
    language === "am"
      ? {
          Electronics: "ኤሌክትሮኒክስ",
          Fashion: "ፋሽን",
          Stationery: "የጽሕፈት እቃዎች",
          Other: "ሌሎች",
        }[product.category] ?? product.category
      : product.category;
  const localizedName = language === "am" ? product.nameAm : product.name;
  const localizedDescription =
    language === "am" ? product.descriptionAm : product.description;
  const sellerRating = 4.8;
  const viewedToday = 125;
  const lastPurchasedMinutes = 5;

  const galleryImages = useMemo(() => {
    const fallback = [
      "/products/photo_11_2026-02-12_05-59-42.jpg",
      "/products/photo_12_2026-02-12_05-59-42.jpg",
      "/products/photo_13_2026-02-12_05-59-42.jpg",
    ];
    return Array.from(new Set([product.image, ...fallback])).slice(0, 4);
  }, [product.image]);

  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  const relatedItems = useMemo(() => {
    const entries = Object.entries(productMap).filter(
      ([productSlug, item]) =>
        productSlug !== slug && item.category === product.category
    );
    const fallback = Object.entries(productMap).filter(
      ([productSlug]) => productSlug !== slug
    );
    return (entries.length > 0 ? entries : fallback).slice(0, 4);
  }, [slug, product.category]);

  const [reviews, setReviews] = useState<
    Array<{
      id: number;
      author: string;
      rating: number;
      note: string;
      photoUrl?: string | null;
    }>
  >([]);
  const [reviewForm, setReviewForm] = useState({
    rating: "5",
    note: "",
    photoUrl: "",
  });
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [auth, setAuth] = useState<{ role?: string; name?: string } | null>(
    null
  );
  const [authLoading, setAuthLoading] = useState(true);
  const reviewPhotos = useMemo(() => {
    const fallback = [
      "/products/photo_14_2026-02-12_05-59-42.jpg",
      "/products/photo_15_2026-02-12_05-59-42.jpg",
      "/products/photo_16_2026-02-12_05-59-42.jpg",
      "/products/photo_17_2026-02-12_05-59-42.jpg",
    ];
    const fromReviews = reviews
      .map((review) => review.photoUrl)
      .filter((photo): photo is string => Boolean(photo));
    return (fromReviews.length > 0 ? fromReviews : fallback).slice(0, 4);
  }, [reviews]);

  const loadReviews = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/reviews?product=${encodeURIComponent(product.name)}`
      );
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{
          id: number;
          author: string;
          rating: number;
          note: string;
          photoUrl?: string | null;
        }>;
      };
      setReviews(data.items);
    } catch {
      // Ignore review errors.
    }
  }, [product.name]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          setAuth(null);
          setAuthLoading(false);
          return;
        }
        const data = (await response.json()) as {
          user: { role: string; name: string };
        };
        setAuth(data.user);
      } catch {
        setAuth(null);
      } finally {
        setAuthLoading(false);
      }
    };
    loadAuth();
  }, []);

  const submitReview = async () => {
    setReviewMessage(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          rating: Number(reviewForm.rating),
          note: reviewForm.note,
          photoUrl: reviewForm.photoUrl,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to post review.");
      }
      setReviewForm({ rating: "5", note: "", photoUrl: "" });
      setReviewMessage(t.reviewSubmitted);
      await loadReviews();
    } catch (error) {
      setReviewMessage(
        error instanceof Error ? error.message : t.reviewFailed
      );
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return product.rating;
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews, product.rating]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
              <Image
                src="/dealarada-logo.png"
                alt="DealArada logo"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="text-lg font-semibold">DealArada</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link
              href="/categories"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
            >
              {t.categories}
            </Link>
            <Link
              href="/cart"
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t.cart}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
              <Image
                src={activeImage}
                alt={localizedName}
                width={900}
                height={720}
                className="h-72 w-full object-cover"
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                    activeImage === image
                      ? "border-emerald-500"
                      : "border-slate-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt="Product thumbnail"
                    width={160}
                    height={160}
                    className="h-20 w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 10vw, 20vw"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700">
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold">
                {categoryLabel}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{product.store}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                {t.sellerRatingLabel} {sellerRating} ⭐
              </span>
            </div>
            <h1 className="text-3xl font-semibold">{localizedName}</h1>
            <p className="text-slate-600">{localizedDescription}</p>
          </div>
        </section>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-emerald-600">
              {product.price}
            </div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {discountBadge}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-amber-500">⭐</span>
            <span className="font-semibold text-slate-800">
              {averageRating}
            </span>
            <span>
              ({t.reviewsCount.replace("{count}", reviews.length.toString())})
            </span>
          </div>
          <div className="text-sm text-slate-500">{t.deliveryEstimate}</div>
          <div className="text-xs font-semibold text-emerald-700">
            {product.stock > 0 ? t.inStock : t.outOfStock}
            {product.stock > 0 && (
              <span className="ml-2 font-normal text-slate-500">
                {t.left.replace("{count}", product.stock.toString())}
              </span>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">
              {viewedToday} {t.viewedToday}
            </p>
            <p className="mt-1 text-slate-500">
              {t.lastPurchased.replace(
                "{minutes}",
                lastPurchasedMinutes.toString()
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              {t.codAvailable}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
              {t.freeDelivery}
            </span>
          </div>
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              {t.buyNow}
            </Link>
            <button className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200">
              {t.addToCart}
            </button>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>{t.payment}</p>
            <p>{t.returns}</p>
          </div>
        </aside>
      </main>

      <section className="mx-auto max-w-6xl space-y-4 px-6 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.reviewsTitle}</h2>
          <span className="text-sm text-slate-500">
            {t.reviewsCount.replace("{count}", reviews.length.toString())}
          </span>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {t.reviewReward}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {authLoading && (
            <p className="text-sm text-slate-500">{t.checkingAccount}</p>
          )}
          {!authLoading && auth?.role !== "BUYER" && (
            <p className="text-sm text-slate-500">{t.buyersOnly}</p>
          )}
          {!authLoading && auth?.role === "BUYER" && (
            <div className="grid gap-3 md:grid-cols-[160px_1fr] md:items-center">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={reviewForm.rating}
                onChange={(event) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    rating: event.target.value,
                  }))
                }
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} {t.stars}
                  </option>
                ))}
              </select>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder={t.quickFeedbackPlaceholder}
                value={reviewForm.note}
                onChange={(event) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
              />
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                placeholder={
                  language === "am"
                    ? "የግምገማ ፎቶ URL (ከፈለጉ)"
                    : "Review photo URL (optional)"
                }
                value={reviewForm.photoUrl}
                onChange={(event) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    photoUrl: event.target.value,
                  }))
                }
              />
              <button
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 md:col-span-2"
                onClick={submitReview}
              >
                {t.postReview}
              </button>
              {reviewMessage && (
                <p className="text-xs text-emerald-600 md:col-span-2">
                  {reviewMessage}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            {t.reviewPhotos}
          </h3>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {reviewPhotos.map((photo) => (
              <div
                key={photo}
                className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
              >
                <Image
                  src={photo}
                  alt="Customer review"
                  width={140}
                  height={140}
                  className="h-16 w-full object-cover"
                  loading="lazy"
                  sizes="(min-width: 1024px) 10vw, 20vw"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">{t.faq}</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <details className="rounded-xl border border-slate-200 px-4 py-3">
              <summary className="cursor-pointer font-semibold text-slate-700">
                {t.faqDeliveryQ}
              </summary>
              <p className="mt-2 text-slate-500">
                {t.faqDeliveryA}
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 px-4 py-3">
              <summary className="cursor-pointer font-semibold text-slate-700">
                {t.faqCodQ}
              </summary>
              <p className="mt-2 text-slate-500">
                {t.faqCodA}
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 px-4 py-3">
              <summary className="cursor-pointer font-semibold text-slate-700">
                {t.faqReturnQ}
              </summary>
              <p className="mt-2 text-slate-500">
                {t.faqReturnA}
              </p>
            </details>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-semibold">{review.author}</p>
              <p className="text-xs text-slate-500">
                {t.ratingFormat.replace("{rating}", review.rating.toString())}
              </p>
              <p className="mt-2 text-sm text-slate-600">{review.note}</p>
              {review.photoUrl && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <Image
                    src={review.photoUrl}
                    alt="Review photo"
                    width={320}
                    height={240}
                    className="h-32 w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 20vw, 40vw"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-6 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.relatedItems}</h2>
          <Link href="/categories" className="text-sm text-emerald-700">
            {t.viewAll}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedItems.map(([slug, item]) => (
            <Link
              key={slug}
              href={`/products/${slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={320}
                className="h-32 w-full object-cover"
                loading="lazy"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <p className="text-sm font-semibold">
                {language === "am" ? item.nameAm : item.name}
              </p>
              <p className="text-xs text-slate-500">{item.store}</p>
              <div className="mt-2 text-sm font-semibold">{item.price}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
