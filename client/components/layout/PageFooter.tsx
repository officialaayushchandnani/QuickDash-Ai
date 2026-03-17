import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Instagram, Twitter, Facebook } from "lucide-react";

export const PageFooter = () => (
  <footer className="bg-muted/30 border-t pt-12 pb-6">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-green to-brand-orange flex items-center justify-center overflow-hidden shadow-lg ring-1 ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white drop-shadow-sm relative z-10">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold bg-gradient-to-r from-brand-green to-brand-orange bg-clip-text text-transparent">
                QuickDash AI
              </h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered hyperlocal delivery platform bringing fresh groceries
            and essentials to your doorstep in 10-30 minutes.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <MapPin className="w-4 h-4 text-brand-green" />
            <span>Ahmedabad, India</span>
          </div>
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-muted-foreground hover:text-brand-orange transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-brand-green transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-brand-blue transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">For Customers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {['How it Works', 'Track Your Order', 'Delivery Areas', 'Pricing & Fees', 'Customer Support'].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-brand-green hover:pl-1 transition-all duration-200 block">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">For Partners</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/delivery" className="hover:text-brand-green hover:pl-1 transition-all duration-200 block">Become a Delivery Agent</Link></li>
            <li><Link to="/admin" className="hover:text-brand-green hover:pl-1 transition-all duration-200 block">Business Dashboard</Link></li>
            {['Partner with Us', 'Merchant Resources', 'API Documentation'].map((item) => (
              <li key={item}><a href="#" className="hover:text-brand-green hover:pl-1 transition-all duration-200 block">{item}</a></li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> support@quickdash.ai
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> +91 8824521614
            </li>
          </ul>
          <div className="pt-4">
            <p className="text-xs text-muted-foreground/60">
              Download our app
            </p>
            <div className="flex gap-2 mt-2">
              <div className="h-8 w-24 bg-foreground/10 rounded cursor-pointer hover:bg-foreground/20 transition-colors"></div>
              <div className="h-8 w-24 bg-foreground/10 rounded cursor-pointer hover:bg-foreground/20 transition-colors"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-center items-center gap-4">
        <p className="text-center">&copy; 2025 QuickDash AI. All rights reserved.</p>
        <div className="flex gap-6 text-xs">
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <a href="#" className="hover:text-foreground">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);