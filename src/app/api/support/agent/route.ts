import { NextResponse } from "next/server";

type Lang = "en" | "am";

const FALLBACK_REPLY: Record<Lang, string> = {
  en: "I can help with order tracking, delivery time, refunds, payments, account access, and contacting a seller. Tell me your order code (for example DA-1023) and what happened.",
  am: "ስለ ትዕዛዝ ክትትል፣ የመድረሻ ጊዜ፣ ተመላሽ ገንዘብ፣ ክፍያ፣ መለያ መግባት እና ሻጭን ማግኘት ማገዝ እችላለሁ። የትዕዛዝ ኮድዎን (ለምሳሌ DA-1023) እና የተፈጠረውን ችግር ያስቀምጡ።",
};

const KEYWORDS = {
  tracking: ["track", "where", "status", "order", "delay", "ትዕዛዝ", "ክትትል", "ዘግይ", "መድረስ"],
  refund: ["refund", "return", "damaged", "missing", "ተመላሽ", "መመለስ", "ተጎዳ", "ጠፋ"],
  payment: ["pay", "payment", "cash", "mobile money", "ክፍያ", "ገንዘብ", "ካሽ"],
  account: ["login", "password", "account", "signin", "register", "መለያ", "ይለፍ ቃል", "ግባ", "ተመዝገብ"],
  contact: ["seller", "support", "call", "telegram", "contact", "ሻጭ", "ድጋፍ", "ይደውሉ", "ቴሌግራም"],
};

const REPLIES: Record<
  keyof typeof KEYWORDS,
  {
    en: string;
    am: string;
  }
> = {
  tracking: {
    en: "For order tracking, open Track Order and enter your order code. If no update appears for 45+ minutes, share the code here and we can escalate to dispatch.",
    am: "ለትዕዛዝ ክትትል ወደ Track Order ይሂዱ እና የትዕዛዝ ኮድ ያስገቡ። ከ45 ደቂቃ በላይ አዲስ መረጃ ካልታየ ኮዱን እዚህ ያስገቡ እኛም ወደ ማድረሻ ቡድን እናስተላልፋለን።",
  },
  refund: {
    en: "If an item is missing or damaged, submit a dispute with order code, item name, and a short note. Most refund reviews complete within 1-2 business days.",
    am: "እቃ ከጠፋ ወይም ከተጎዳ የትዕዛዝ ኮድ፣ የእቃ ስም እና አጭር ማብራሪያ ጨምረው ቅሬታ ያስገቡ። አብዛኛው የተመላሽ ገንዘብ ግምገማ በ1-2 የስራ ቀን ይጠናቀቃል።",
  },
  payment: {
    en: "You can pay with cash on delivery or mobile money where available. If payment was charged but order failed, share transaction time and amount for verification.",
    am: "በሚቻልበት ቦታ በመድረሻ ጊዜ ካሽ ወይም በሞባይል ገንዘብ መክፈል ይችላሉ። ክፍያ ተከፍሎ ትዕዛዝ ካልተሳካ የክፍያ ሰዓት እና መጠን ያስገቡ እንዲመረምር።",
  },
  account: {
    en: "For account access issues, use Sign In -> forgot/reset flow first. If it still fails, send the phone/email linked to your account and we will verify it.",
    am: "ለመለያ መግባት ችግር በመጀመሪያ Sign In -> forgot/reset መንገድ ይጠቀሙ። ካልተሳካ ከመለያዎ ጋር የተያያዘ ስልክ/ኢሜይል ያስገቡ እኛም እናረጋግጣለን።",
  },
  contact: {
    en: "You can reach support by phone (+251 900 000 000), Telegram (@DealAradaSupport), or by opening a dispute ticket on this page.",
    am: "ድጋፍን በስልክ (+251 900 000 000)፣ በቴሌግራም (@DealAradaSupport) ወይም በዚህ ገጽ ላይ ቅሬታ ትኬት በመክፈት ማግኘት ይችላሉ።",
  },
};

const ORDER_CODE_REGEX = /\b(?:DA|ORD|DS)-?\d{3,}\b/i;

const detectIntent = (message: string): keyof typeof KEYWORDS | null => {
  const lower = message.toLowerCase();
  for (const [intent, words] of Object.entries(KEYWORDS) as Array<
    [keyof typeof KEYWORDS, string[]]
  >) {
    if (words.some((word) => lower.includes(word))) {
      return intent;
    }
  }
  return null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string; language?: string };
  const rawMessage = body.message?.trim();
  const language: Lang = body.language === "am" ? "am" : "en";

  if (!rawMessage) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const intent = detectIntent(rawMessage);
  const matchedOrderCode = rawMessage.match(ORDER_CODE_REGEX)?.[0] ?? null;

  let reply = FALLBACK_REPLY[language];
  if (intent) {
    reply = REPLIES[intent][language];
  }

  if (matchedOrderCode) {
    const orderHint =
      language === "am"
        ? ` ኮድ ${matchedOrderCode} ተቀባይነት አለው፤ ከፈለጉ በTrack Order ገጽ ላይ ወዲያው ማረጋገጥ ይችላሉ።`
        : ` I detected order code ${matchedOrderCode}; you can verify it immediately on the Track Order page.`;
    reply += orderHint;
  }

  return NextResponse.json({
    reply,
    intent: intent ?? "general",
    detectedOrderCode: matchedOrderCode,
  });
}
