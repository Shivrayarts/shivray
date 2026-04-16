import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us - Shivray" },
      { name: "description", content: "Get in touch with Shivray for inquiries, collaborations, or orders." },
      { property: "og:title", content: "Contact Us - Shivray" },
      { property: "og:description", content: "Reach out for inquiries, collaborations, or to place an order." },
    ],
  }),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-16 md:py-20 text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Get In Touch</h1>
        <div className="w-24 h-1 bg-gold mx-auto mt-3" />
        <p className="mt-4 font-display italic text-lg opacity-90">We cherish every conversation about our traditional craftsmanship</p>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-card rounded-lg p-8 shadow-heritage border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-gold" />
                </div>
                <h2 className="font-heading text-xl font-bold">Send Us a Message</h2>
              </div>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gold mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-1.5">Your Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share your thoughts with us..."
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-md font-heading text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="bg-card rounded-lg p-8 shadow-heritage border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <h2 className="font-heading text-xl font-bold">Our Studio</h2>
              </div>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Address</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Famous Chowk, Kirti Nagar Ln No. 1,<br />
                      Ganesh Nagar, Samata Nagar,<br />
                      New Sangavi, Pune, Pimpri-Chinchwad,<br />
                      Maharashtra 411027
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-gold shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Email</h4>
                    <a href="mailto:shivray.arts30@gmail.com" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                      shivray.arts30@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-gold shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Phone</h4>
                    <a href="tel:+917028996666" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                      +91 7028996666
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <a
                  href="mailto:shivray.arts30@gmail.com"
                  className="flex items-center justify-center gap-2 bg-gold text-gold-foreground py-3 rounded-md text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <Mail className="w-4 h-4" /> Email Us
                </a>
                <a
                  href="https://wa.me/7028996666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-md text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

