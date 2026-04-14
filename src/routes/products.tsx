import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Grid3X3, LayoutGrid } from "lucide-react";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productStatue2 from "@/assets/product-statue-2.jpg";
import productStatue3 from "@/assets/product-statue-3.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import productWeapon2 from "@/assets/product-weapon-2.jpg";
import productWeapon3 from "@/assets/product-weapon-3.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productShield1 from "@/assets/product-shield-1.jpg";
import productTalwar1 from "@/assets/product-talwar-1.jpg";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Products — Rudra Arts & Handicrafts" },
      { name: "description", content: "Browse our collection of handcrafted Maratha statues, weapons, shields, and heritage artifacts." },
      { property: "og:title", content: "Products — Rudra Arts & Handicrafts" },
      { property: "og:description", content: "Authentic handcrafted heritage artifacts and replicas." },
    ],
  }),
});

const allProducts = [
  { name: "Shastradhari Maharaj - Coloured", price: "₹5,100", image: productStatue1, category: "Statues", tag: "Featured" },
  { name: "Ashwarudh Maharaj", price: "₹12,850", image: productStatue2, category: "Statues", tag: "Featured" },
  { name: "Roudra Shambhu Chatrapati", price: "₹5,100", image: productStatue3, category: "Statues", tag: "" },
  { name: "Royal Khanjar with Sheath", price: "₹8,500", image: productWeapon1, category: "Weapons", tag: "Popular" },
  { name: "Vita (Battle Axe)", price: "₹6,200", image: productWeapon2, category: "Weapons", tag: "" },
  { name: "Ceremonial Gada", price: "₹9,800", image: productWeapon3, category: "Weapons", tag: "New" },
  { name: "Brass Dhoop Stand", price: "₹2,200", image: productDhoop1, category: "Dhoop", tag: "New" },
  { name: "Maratha War Shield", price: "₹7,500", image: productShield1, category: "Shields", tag: "" },
  { name: "Talwar - Curved Sword", price: "₹11,000", image: productTalwar1, category: "Weapons", tag: "Featured" },
];

const categories = ["All", "Statues", "Weapons", "Shields", "Dhoop"];

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const filtered = allProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20 text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Our Products</h1>
        <div className="w-24 h-1 bg-gold mx-auto mt-3" />
        <p className="mt-4 font-display italic text-lg opacity-90">Discover handcrafted treasures that embody centuries of tradition</p>
      </section>

      {/* Filters */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search our collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border hover:border-gold/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="hidden md:flex items-center gap-1 ml-4 border border-border rounded-md">
                <button onClick={() => setGridCols(3)} className={`p-2 ${gridCols === 3 ? "text-gold" : "text-muted-foreground"}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setGridCols(4)} className={`p-2 ${gridCols === 4 ? "text-gold" : "text-muted-foreground"}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6`}>
            {filtered.map((product) => (
              <div
                key={product.name}
                className="group bg-card rounded-lg overflow-hidden shadow-heritage hover:shadow-xl transition-all duration-300 border border-border hover:border-gold/30"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.tag && (
                    <span className="absolute top-3 right-3 bg-gold text-gold-foreground text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-gold">{product.category}</span>
                  <h3 className="font-heading text-sm font-semibold text-foreground mt-1 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold text-primary">{product.price}</p>
                    <button className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-heading uppercase tracking-wider">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
