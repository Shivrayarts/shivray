import { Link } from "@/lib/spa-router";

export default function AdminUnavailablePage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="max-w-xl rounded-[28px] border border-[#eadbc8] bg-white p-8 text-center shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">Admin Notice</p>
        <h1 className="mt-3 font-heading text-4xl text-[#34180e]">Admin panel is disabled in the Hostinger version</h1>
        <p className="mt-4 text-sm leading-7 text-[#6c4b33]">The public storefront now runs as a static React app for Hostinger compatibility. The old admin and MySQL server features need a backend host to work.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-[#34180e] px-6 py-3 text-sm font-semibold text-white">Back to Home</Link>
      </div>
    </div>
  );
}
