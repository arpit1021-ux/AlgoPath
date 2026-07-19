import Link from "next/link";
import { Rocket, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#12131a] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white -rotate-12" />
              </div>
              <span className="font-bold text-[#f0f0f5]">AlgoPath</span>
            </Link>
            <p className="text-sm text-[#8b8d9e] leading-relaxed">
              AI-powered interview preparation for ambitious engineers.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="text-[#4b4d5e] hover:text-[#8b8d9e] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[#4b4d5e] hover:text-[#8b8d9e] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[#4b4d5e] hover:text-[#8b8d9e] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-[#f0f0f5] mb-4">
              Product
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Plans", href: "/dashboard/plans" },
                { label: "Analytics", href: "/dashboard/analytics" },
                { label: "Calendar", href: "/dashboard/calendar" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-[#8b8d9e] hover:text-[#f0f0f5] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-[#f0f0f5] mb-4">
              Resources
            </h4>
            <div className="flex flex-col gap-2.5">
              {["Blog", "Documentation", "Community"].map((item) => (
                <span
                  key={item}
                  className="text-sm text-[#8b8d9e] hover:text-[#f0f0f5] transition-colors cursor-pointer"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-[#f0f0f5] mb-4">
              Company
            </h4>
            <div className="flex flex-col gap-2.5">
              {["About", "Careers", "Contact"].map((item) => (
                <span
                  key={item}
                  className="text-sm text-[#8b8d9e] hover:text-[#f0f0f5] transition-colors cursor-pointer"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4b4d5e]">
            &copy; 2025 AlgoPath. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-[#4b4d5e] hover:text-[#8b8d9e] cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="text-xs text-[#4b4d5e] hover:text-[#8b8d9e] cursor-pointer transition-colors">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
