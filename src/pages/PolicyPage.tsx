import { Link } from "@/lib/spa-router";
import { useLanguage, type Locale } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";

type PolicyPageProps = {
  type: "shipping" | "refund" | "privacy" | "terms" | "faq";
};

type PolicyContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: {
    title: string;
    body: string;
  }[];
  contactLabel: string;
  productsLabel: string;
};

const policyContent: Record<PolicyPageProps["type"], Record<Locale, PolicyContent>> = {
  shipping: {
    en: {
      eyebrow: "Shopping",
      title: "Shipping and Delivery",
      intro: "Delivery timelines and handling details for Shivray Art orders.",
      sections: [
        {
          title: "Order Processing",
          body: "Most ready catalogue products are reviewed after enquiry or checkout confirmation. Custom, handcrafted, or made-to-order pieces may need additional preparation time depending on size, finish, and availability.",
        },
        {
          title: "Delivery Timeline",
          body: "Estimated delivery timelines are shared after order review. Delivery time can vary by product type, delivery city, courier availability, and custom work requirements.",
        },
        {
          title: "Shipping Updates",
          body: "Customers receive order and delivery updates by phone, WhatsApp, or email where applicable. For urgent delivery needs, contact the team before placing the order.",
        },
      ],
      contactLabel: "Contact Support",
      productsLabel: "Browse Products",
    },
    mr: {
      eyebrow: "खरेदी",
      title: "शिपिंग आणि डिलिव्हरी",
      intro: "शिवराय आर्टच्या ऑर्डरसाठी डिलिव्हरी वेळ आणि हाताळणीची माहिती.",
      sections: [
        {
          title: "ऑर्डर प्रक्रिया",
          body: "बहुतेक तयार कॅटलॉग उत्पादने चौकशी किंवा चेकआउट पुष्टीनंतर तपासली जातात. कस्टम, हस्तकला किंवा ऑर्डरनुसार तयार होणाऱ्या वस्तूंना आकार, फिनिश आणि उपलब्धतेनुसार अतिरिक्त वेळ लागू शकतो.",
        },
        {
          title: "डिलिव्हरी वेळ",
          body: "ऑर्डर तपासल्यानंतर अंदाजे डिलिव्हरी वेळ कळवली जाते. उत्पादनाचा प्रकार, डिलिव्हरी शहर, कुरिअर उपलब्धता आणि कस्टम कामाच्या गरजेनुसार वेळ बदलू शकतो.",
        },
        {
          title: "शिपिंग अपडेट्स",
          body: "ग्राहकांना ऑर्डर आणि डिलिव्हरी अपडेट फोन, WhatsApp किंवा ईमेलद्वारे दिले जातात. तातडीच्या डिलिव्हरीसाठी ऑर्डर करण्यापूर्वी टीमशी संपर्क साधा.",
        },
      ],
      contactLabel: "सपोर्टशी संपर्क करा",
      productsLabel: "उत्पादने पहा",
    },
  },
  refund: {
    en: {
      eyebrow: "Shopping",
      title: "Cancellation and Refund Policy",
      intro: "Cancellation and refund guidance for handcrafted and custom heritage products.",
      sections: [
        {
          title: "Cancellation",
          body: "Cancellation requests should be raised as early as possible. Custom work, personalized pieces, and products already dispatched or under production may not be eligible for cancellation.",
        },
        {
          title: "Refund Review",
          body: "Refund eligibility depends on product type, order status, payment status, and the reason for the request. Approved refunds are processed through the original payment mode where possible.",
        },
        {
          title: "Damaged or Incorrect Product",
          body: "If a product is received damaged or incorrect, contact Shivray Art with order details and clear photos as soon as possible so the team can review and assist.",
        },
      ],
      contactLabel: "Contact Support",
      productsLabel: "Browse Products",
    },
    mr: {
      eyebrow: "खरेदी",
      title: "कॅन्सलेशन आणि रिफंड पॉलिसी",
      intro: "हस्तकला आणि कस्टम हेरिटेज उत्पादनांसाठी कॅन्सलेशन व रिफंड मार्गदर्शन.",
      sections: [
        {
          title: "कॅन्सलेशन",
          body: "कॅन्सलेशनची विनंती शक्य तितक्या लवकर करावी. कस्टम काम, वैयक्तिकृत वस्तू आणि आधीच पाठवलेली किंवा उत्पादनात असलेली उत्पादने कॅन्सलेशनसाठी पात्र नसू शकतात.",
        },
        {
          title: "रिफंड तपासणी",
          body: "रिफंड पात्रता उत्पादनाचा प्रकार, ऑर्डर स्थिती, पेमेंट स्थिती आणि विनंतीचे कारण यावर अवलंबून असते. मंजूर रिफंड शक्य असल्यास मूळ पेमेंट पद्धतीने प्रक्रिया केला जातो.",
        },
        {
          title: "नुकसान झालेले किंवा चुकीचे उत्पादन",
          body: "उत्पादन नुकसान झालेले किंवा चुकीचे मिळाल्यास ऑर्डर तपशील आणि स्पष्ट फोटोसह शक्य तितक्या लवकर शिवराय आर्टशी संपर्क साधा.",
        },
      ],
      contactLabel: "सपोर्टशी संपर्क करा",
      productsLabel: "उत्पादने पहा",
    },
  },
  privacy: {
    en: {
      eyebrow: "Information",
      title: "Privacy Policy",
      intro: "How Shivray Art handles customer enquiry, account, and order information.",
      sections: [
        {
          title: "Information We Collect",
          body: "We collect details such as name, phone number, email, address, product interest, catalogue requests, and order information when customers submit forms, create accounts, or place enquiries.",
        },
        {
          title: "How We Use Information",
          body: "Customer information is used to respond to enquiries, process orders, share catalogue details, provide support, and improve the shopping experience.",
        },
        {
          title: "Data Sharing",
          body: "We do not sell customer information. Limited details may be shared with payment, delivery, hosting, or communication services only as needed to complete the requested service.",
        },
      ],
      contactLabel: "Contact Support",
      productsLabel: "Browse Products",
    },
    mr: {
      eyebrow: "माहिती",
      title: "प्रायव्हसी पॉलिसी",
      intro: "शिवराय आर्ट ग्राहक चौकशी, खाते आणि ऑर्डर माहिती कशी हाताळते.",
      sections: [
        {
          title: "आम्ही कोणती माहिती घेतो",
          body: "ग्राहक फॉर्म भरतात, खाते तयार करतात किंवा चौकशी करतात तेव्हा नाव, फोन नंबर, ईमेल, पत्ता, उत्पादनाची आवड, कॅटलॉग विनंती आणि ऑर्डर माहिती घेतली जाऊ शकते.",
        },
        {
          title: "माहितीचा वापर",
          body: "ग्राहक माहिती चौकशीला उत्तर देणे, ऑर्डर प्रक्रिया करणे, कॅटलॉग तपशील शेअर करणे, सपोर्ट देणे आणि खरेदी अनुभव सुधारण्यासाठी वापरली जाते.",
        },
        {
          title: "डेटा शेअरिंग",
          body: "आम्ही ग्राहक माहिती विकत नाही. पेमेंट, डिलिव्हरी, होस्टिंग किंवा कम्युनिकेशन सेवांसोबत आवश्यक तेवढीच माहिती शेअर केली जाऊ शकते.",
        },
      ],
      contactLabel: "सपोर्टशी संपर्क करा",
      productsLabel: "उत्पादने पहा",
    },
  },
  terms: {
    en: {
      eyebrow: "Information",
      title: "Terms and Conditions",
      intro: "Terms for using Shivray Art website, catalogues, and ordering services.",
      sections: [
        {
          title: "Product Information",
          body: "Product images, descriptions, sizes, and prices are shown for customer guidance. Handcrafted pieces may have small natural variations in finish, shade, or detailing.",
        },
        {
          title: "Orders and Payments",
          body: "Orders may be accepted through online payment, catalogue enquiry, or WhatsApp depending on the product. Shivray Art may verify order details before confirming fulfilment.",
        },
        {
          title: "Intellectual Property",
          body: "Website content, images, product presentation, and brand material belong to Shivray Art and Handcraft. Unauthorized copying, reuse, or distribution is not permitted.",
        },
      ],
      contactLabel: "Contact Support",
      productsLabel: "Browse Products",
    },
    mr: {
      eyebrow: "माहिती",
      title: "टर्म्स आणि कंडिशन्स",
      intro: "शिवराय आर्ट वेबसाइट, कॅटलॉग आणि ऑर्डर सेवांचा वापर करण्यासाठी अटी.",
      sections: [
        {
          title: "उत्पादन माहिती",
          body: "उत्पादनाचे फोटो, वर्णन, आकार आणि किंमती ग्राहकांच्या माहितीसाठी दाखवल्या जातात. हस्तकला वस्तूंमध्ये फिनिश, रंग किंवा तपशीलात नैसर्गिक लहान फरक असू शकतो.",
        },
        {
          title: "ऑर्डर आणि पेमेंट",
          body: "उत्पादनानुसार ऑनलाइन पेमेंट, कॅटलॉग चौकशी किंवा WhatsApp द्वारे ऑर्डर स्वीकारली जाऊ शकते. ऑर्डर निश्चित करण्यापूर्वी शिवराय आर्ट तपशील तपासू शकते.",
        },
        {
          title: "बौद्धिक संपदा",
          body: "वेबसाइटवरील मजकूर, फोटो, उत्पादन सादरीकरण आणि ब्रँड साहित्य शिवराय आर्ट अँड हँडक्राफ्टचे आहे. परवानगीशिवाय कॉपी, पुनर्वापर किंवा वितरण करू नये.",
        },
      ],
      contactLabel: "सपोर्टशी संपर्क करा",
      productsLabel: "उत्पादने पहा",
    },
  },
  faq: {
    en: {
      eyebrow: "Help",
      title: "Help and FAQs",
      intro: "Common questions about Shivray Art products, catalogues, payment, and support.",
      sections: [
        {
          title: "How do I order a product?",
          body: "Open a product page and use the available cart, payment, catalogue, or WhatsApp option. Some handcrafted products are enquiry-first so the team can confirm details.",
        },
        {
          title: "Can I request a custom product?",
          body: "Yes. Use the contact page or catalogue request page and share size, material, finish, quantity, budget, and delivery city details.",
        },
        {
          title: "Where is Shivray Art located?",
          body: `Shivray Art is located at ${siteConfig.address}. You can contact the team at ${siteConfig.phoneDisplay}.`,
        },
      ],
      contactLabel: "Contact Support",
      productsLabel: "Browse Products",
    },
    mr: {
      eyebrow: "मदत",
      title: "मदत आणि प्रश्नोत्तरे",
      intro: "शिवराय आर्ट उत्पादने, कॅटलॉग, पेमेंट आणि सपोर्टबद्दल सामान्य प्रश्न.",
      sections: [
        {
          title: "मी उत्पादनाची ऑर्डर कशी करू?",
          body: "उत्पादन पेज उघडा आणि उपलब्ध कार्ट, पेमेंट, कॅटलॉग किंवा WhatsApp पर्याय वापरा. काही हस्तकला उत्पादनांसाठी आधी चौकशी आवश्यक असते.",
        },
        {
          title: "मी कस्टम उत्पादनाची विनंती करू शकतो का?",
          body: "होय. संपर्क पेज किंवा कॅटलॉग विनंती पेज वापरून आकार, मटेरियल, फिनिश, प्रमाण, बजेट आणि डिलिव्हरी शहराची माहिती शेअर करा.",
        },
        {
          title: "शिवराय आर्ट कुठे आहे?",
          body: `शिवराय आर्टचा पत्ता ${siteConfig.address} आहे. तुम्ही ${siteConfig.phoneDisplay} वर टीमशी संपर्क करू शकता.`,
        },
      ],
      contactLabel: "सपोर्टशी संपर्क करा",
      productsLabel: "उत्पादने पहा",
    },
  },
};

export default function PolicyPage({ type }: PolicyPageProps) {
  const { resolvedLocale } = useLanguage();
  const content = policyContent[type][resolvedLocale];

  return (
    <div className="bg-[#f7f1e7] px-4 py-10 md:px-6 md:py-14">
      <div className="layout-shell">
        <div className="rounded-[28px] border border-[#eadbc8] bg-[#fffdf9] px-5 py-8 shadow-[0_24px_60px_-45px_rgba(70,36,15,0.55)] md:px-10 md:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">{content.eyebrow}</p>
          <h1 className="mt-3 font-heading text-4xl leading-tight text-[#34180e] md:text-5xl">{content.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#6c4b33]">{content.intro}</p>

          <div className="mt-8 grid gap-5">
            {content.sections.map((section) => (
              <section key={section.title} className="border-t border-[#eadbc8] pt-5">
                <h2 className="text-xl font-semibold text-[#34180e]">{section.title}</h2>
                <p className="mt-2 text-base leading-8 text-[#6c4b33]">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold text-white">
              {content.contactLabel}
            </Link>
            <Link to="/products" className="rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold text-[#6c4b33]">
              {content.productsLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
