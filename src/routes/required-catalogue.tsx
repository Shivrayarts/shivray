import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, FileCheck2, MessageCircle, Phone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { defaultCatalogueTypes, getCatalogueTypeById } from "@/lib/catalogue-types";
import { siteConfig } from "@/lib/site-config";
import { getCatalogueTypesFromDbServer } from "@/lib/server/catalogues.functions";

export const Route = createFileRoute("/required-catalogue")({
  loader: () => getCatalogueTypesFromDbServer(),
  component: RequiredCataloguePage,
  head: () => ({
    meta: [
      { title: "Required Catalogue - Shivray" },
      {
        name: "description",
        content:
          "Request Shivray's latest catalogue through a mobile-friendly enquiry page.",
      },
    ],
  }),
});

function RequiredCataloguePage() {
  const catalogueTypes = Route.useLoaderData();
  const defaultCatalogueId =
    catalogueTypes.find((type) => type.id === "full-catalogue")?.id ??
    catalogueTypes[0]?.id ??
    defaultCatalogueTypes[0].id;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    catalogueType: defaultCatalogueId,
    notes: "",
  });
  const [categorySlide, setCategorySlide] = useState(0);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const categoryCards = catalogueTypes.slice(0, 4);

  useEffect(() => {
    if (!catalogueTypes.some((type) => type.id === form.catalogueType)) {
      setForm((value) => ({
        ...value,
        catalogueType: defaultCatalogueId,
      }));
    }
  }, [catalogueTypes, defaultCatalogueId, form.catalogueType]);

  const selectedCatalogue = getCatalogueTypeById(form.catalogueType, catalogueTypes);

  const whatsappLink = useMemo(() => {
    const text = encodeURIComponent(
      `Hi Shivray, please share your latest catalogue.\nName: ${form.name || "-"}\nPhone: ${
        form.phone || "-"
      }\nCatalogue Type: ${selectedCatalogue.title}\nNotes: ${form.notes || "-"}`,
    );
    return `${siteConfig.whatsappHref}?text=${text}`;
  }, [form, selectedCatalogue.title]);

  const handleCategoriesScroll = () => {
    const node = categoriesRef.current;
    if (!node || window.innerWidth >= 768) {
      return;
    }

    const firstCard = node.querySelector<HTMLElement>("[data-catalogue-card]");
    if (!firstCard) {
      return;
    }

    const cardWidth = firstCard.offsetWidth + 16;
    const nextSlide = Math.round(node.scrollLeft / cardWidth);
    setCategorySlide(Math.max(0, Math.min(nextSlide, categoryCards.length - 1)));
  };

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      <section className="bg-[#2b130c] px-4 pb-8 pt-6 text-white md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">
            Required Catalogue
          </span>
          <h1 className="mt-4 font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">
            Ask for the right catalogue type in one quick step.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f4e7d8] md:text-base">
            This page is designed for mobile-first lead capture so users can request the
            exact catalogue they want without long forms or hidden actions.
          </p>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
          <div className="text-center">
            <h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">
              Popular Categories
            </h2>
          </div>

          <div
            ref={categoriesRef}
            onScroll={handleCategoriesScroll}
            className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-x-6 md:gap-y-8 md:overflow-visible md:pb-0"
          >
            {categoryCards.map((card) => (
              <button
                key={card.id}
                type="button"
                data-catalogue-card
                onClick={() => setForm((value) => ({ ...value, catalogueType: card.id }))}
                className="group min-w-[78%] snap-center text-center sm:min-w-[calc(50%-0.5rem)] md:min-w-0"
              >
                <div className="relative overflow-hidden rounded-[30px] bg-[#b65a73] shadow-[0_18px_45px_-30px_rgba(89,34,49,0.65)]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="aspect-square w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105"
                    width={420}
                    height={420}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,226,152,0.16),rgba(132,33,58,0.28))]" />
                </div>
                <h3 className="mt-4 font-body text-xl font-semibold text-[#1c140f] md:text-2xl">
                  {card.shortLabel}
                </h3>
                <p className="mt-1 text-base text-[#7d766f]">{card.itemCountLabel}</p>
              </button>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            {categoryCards.map((card, index) => (
              <span
                key={card.id}
                className={`rounded-full ${
                  index === categorySlide
                    ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]"
                    : "h-2.5 w-2.5 bg-[#a9a29c]"
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-center text-sm text-[#8a837d]">
            Swipe to explore more categories
          </p>
        </div>
      </section>

      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
            Why request it
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                icon: BookOpenText,
                title: "Multiple catalogue types",
                text: "Customers can directly choose statue, weapon, shield, decor, or full-range catalogue requests.",
              },
              {
                icon: FileCheck2,
                title: "Filtered recommendations",
                text: "Each request can point to the exact catalogue type and help us send more relevant options.",
              },
              {
                icon: Phone,
                title: "Fast follow-up",
                text: "Phone-first users can move directly from request to call or WhatsApp support.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] bg-[#fcf7f0] p-4">
                <div className="flex gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" />
                  <div>
                    <p className="font-semibold text-[#34180e]">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#7e624b]">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>

          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
            Request Form
          </p>
          <h2 className="mt-2 font-heading text-3xl text-[#34180e]">
            Choose the catalogue type you need
          </h2>

          <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label className="text-sm font-medium text-[#34180e]">Catalogue type</label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {catalogueTypes.map((type) => {
                  const active = form.catalogueType === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setForm((value) => ({ ...value, catalogueType: type.id }))
                      }
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        active
                          ? "border-[#34180e] bg-[#34180e] text-white"
                          : "border-[#eadbc8] bg-[#fcf8f2] text-[#34180e] hover:border-[#d6a35c] hover:bg-white"
                      }`}
                    >
                      <p className="text-sm font-semibold">{type.title}</p>
                      <p
                        className={`mt-2 text-xs leading-5 ${
                          active ? "text-white/75" : "text-[#7e624b]"
                        }`}
                      >
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="catalogue-name" className="text-sm font-medium text-[#34180e]">
                Name
              </label>
              <input
                id="catalogue-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((value) => ({ ...value, name: event.target.value }))
                }
                placeholder="Your name"
                className="mt-2 w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none transition placeholder:text-[#927863] focus:border-[#d6a35c] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="catalogue-phone" className="text-sm font-medium text-[#34180e]">
                Phone Number
              </label>
              <input
                id="catalogue-phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((value) => ({ ...value, phone: event.target.value }))
                }
                placeholder="+91"
                className="mt-2 w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none transition placeholder:text-[#927863] focus:border-[#d6a35c] focus:bg-white"
              />
            </div>

            <div>
              <div className="rounded-[24px] border border-[#eadbc8] bg-[#fcf8f2] px-4 py-4">
                <p className="text-sm font-medium text-[#34180e]">Selected catalogue</p>
                <p className="mt-2 font-semibold text-[#34180e]">{selectedCatalogue.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#7e624b]">
                  {selectedCatalogue.description}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="catalogue-notes" className="text-sm font-medium text-[#34180e]">
                Notes
              </label>
              <textarea
                id="catalogue-notes"
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  setForm((value) => ({ ...value, notes: event.target.value }))
                }
                placeholder="Budget, quantity, or special requirement"
                className="mt-2 w-full resize-none rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none transition placeholder:text-[#927863] focus:border-[#d6a35c] focus:bg-white"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#221008]"
              >
                <MessageCircle className="h-4 w-4" />
                Request on WhatsApp
              </a>
              <a
                href={`tel:${siteConfig.phoneHref}`}
                className="inline-flex items-center justify-center rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e] transition hover:bg-[#fff7ec]"
              >
                Call Now
              </a>
            </div>
          </form>
          </div>
        </div>
      </section>
    </div>
  );
}
