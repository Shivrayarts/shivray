import { Link } from "@/lib/spa-router";
import { siteConfig } from "@/lib/site-config";

type PolicyPageProps = {
  type: "shipping" | "refund" | "privacy" | "terms" | "faq";
};

const policyContent = {
  shipping: {
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
  },
  refund: {
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
  },
  privacy: {
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
  },
  terms: {
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
  },
  faq: {
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
  },
} as const;

export default function PolicyPage({ type }: PolicyPageProps) {
  const content = policyContent[type];

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
              Contact Support
            </Link>
            <Link to="/products" className="rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold text-[#6c4b33]">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
