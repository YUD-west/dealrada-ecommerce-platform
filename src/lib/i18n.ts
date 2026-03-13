export type Language = "en" | "am";

const orderStatusMap: Record<string, string> = {
  New: "አዲስ",
  Packed: "ተሰብስቧል",
  Dispatched: "ተላክ",
  Delivered: "ተደርሷል",
  Cancelled: "ተሰርዟል",
  "Out for delivery": "በመድረስ ላይ",
};

const trackingTitleMap: Record<string, string> = {
  "Order placed": "ትዕዛዝ ተቀብሏል",
  "Shop confirmed": "ሱቅ አረጋግጧል",
  "Out for delivery": "በመድረስ ላይ",
  Delivered: "ተደርሷል",
};

const trackingDetailMap: Record<string, string> = {
  "We received your order.": "ትዕዛዝዎን ተቀብለናል።",
  "Seller packed the items.": "ሻጩ እቃዎቹን ጠቅላላ አዘጋጅቷል።",
  "Rider is on the way.": "መድረሻ ላይ ነው።",
  "Customer receives the order.": "ደንበኛው ትዕዛዙን ይቀበላል።",
};

export const translateOrderStatus = (status: string, lang: Language) =>
  lang === "am" ? orderStatusMap[status] ?? status : status;

export const translateTrackingTitle = (title: string, lang: Language) =>
  lang === "am" ? trackingTitleMap[title] ?? title : title;

export const translateTrackingDetail = (detail: string, lang: Language) =>
  lang === "am" ? trackingDetailMap[detail] ?? detail : detail;
