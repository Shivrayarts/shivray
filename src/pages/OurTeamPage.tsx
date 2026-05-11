import { Users } from "lucide-react";
import aboutCraftsman from "@/assets/about-craftsman.jpg";

const team = [
  { name: "Shivrayart", role: "Founder & Managing Director", desc: "A visionary studio preserving traditional Maratha weapon craftsmanship with modern precision.", image: "https://www.rudraartsandhandicrafts.in/images/IMG-20250617-WA0027.jpg" },
  { name: "Master Artisan Team", role: "Lead Craftsmen", desc: "Skilled artisans with decades of experience in traditional metal forging and sculpture.", image: aboutCraftsman },
  { name: "Design & Research", role: "Historical Research Wing", desc: "Ensuring every artifact is historically accurate through meticulous research.", image: "https://www.rudraartsandhandicrafts.in/images/bts21.jpg" },
] as const;

export default function OurTeamPage() {
  return (
    <div>
      <section className="bg-primary py-16 text-center text-primary-foreground md:py-20"><h1 className="font-heading text-4xl md:text-5xl font-bold">Our Team</h1><div className="w-24 h-1 bg-gold mx-auto mt-3" /></section>
      <section className="py-16 md:py-24"><div className="w-full px-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{team.map((member) => <div key={member.name} className="bg-card rounded-lg overflow-hidden shadow-heritage border border-border group text-center"><div className="aspect-[4/3] overflow-hidden"><img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div><div className="p-6"><h3 className="font-heading text-lg font-semibold">{member.name}</h3><span className="text-xs font-medium uppercase tracking-wider text-gold">{member.role}</span><p className="text-sm text-muted-foreground mt-2">{member.desc}</p></div></div>)}</div></div></section>
      <section className="py-16 md:py-24 bg-primary text-primary-foreground text-center"><div className="max-w-3xl mx-auto px-4"><Users className="w-12 h-12 text-gold mx-auto mb-4" /><h2 className="font-heading text-2xl md:text-3xl font-bold">Join Our Legacy</h2></div></section>
    </div>
  );
}
