import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlogList from '@/src/pages/BlogList';
import BlogDetail from '@/src/pages/BlogDetail';
import PostBlog from '@/src/pages/PostBlog';
import logoUrl from './image.png?url';
import { 
  Menu, X, ArrowRight, ChevronDown, Check, 
  Zap, BarChart3, MessageSquare, 
  Clock, Shield, Mail, Phone, MapPin,
  Linkedin, Twitter, Instagram, ChevronUp, Sun, Moon, Star,
  TrendingUp, ArrowUpRight, Plus, Minus
} from 'lucide-react';

// --- Types & Interfaces ---
interface NavItem {
  label: string;
  href: string;
}

interface Service {
  title: string;
  description: string;
  features: string[];
  cta: string;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
  deliverable: string;
}

interface Stat {
  value: string;
  label: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface CaseStudy {
  title: string;
  industry: string;
  problem: string;
  solution: string;
  results: string[];
  quote: string;
}

// --- Custom Logo Component ---
const WebnexaLogo = ({ className = "w-8 h-8", theme }: { className?: string; theme?: 'light' | 'dark' }) => (
  <img src={logoUrl} alt="Brand Logo" className={`${className} object-contain ${theme === 'dark' ? 'invert' : ''} dark:invert`} loading="lazy" />
);

// --- Reusable UI Components ---

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  icon?: React.ElementType;
}> = ({ children, variant = 'primary', className = '', onClick, icon: Icon }) => {
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 rounded-full font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed tracking-tight text-sm";
  
  const variants = {
    // High contrast black/white for premium agency feel
    primary: "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",
    outline: "border-2 border-slate-200 text-slate-900 hover:border-slate-950 dark:border-slate-800 dark:text-white dark:hover:border-white bg-transparent",
    ghost: "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
      {Icon && <Icon className="ml-2 w-4 h-4" />}
    </button>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Count Up Animation Hook ---
const useCountUp = (end: number, duration: number = 2000, start: number = 0, decimals: number = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = start;
    const endValue = end;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      let current = startValue + (endValue - startValue) * easeOutQuart;
      
      // Round based on decimals parameter
      if (decimals === 0) {
        current = Math.floor(current);
      } else {
        current = Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals);
      }
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start, decimals]);

  return count;
};

// --- Theme Context ---
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
         setTheme('dark');
         document.documentElement.classList.add('dark');
      } else {
         setTheme('light');
         document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  return { theme, toggleTheme };
};

// --- Components ---

const Container = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <div className={`max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 ${className}`}>
    {children}
  </div>
);

const Header = ({ toggleTheme, theme }: { toggleTheme: () => void, theme: 'light' | 'dark' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: 'Services', href: '#services' },
    { label: 'Process', href: '#process' },
    { label: 'Case Studies', href: '#cases' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Blog', href: '/blog' },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        window.location.href = '/' + href;
        return;
      }
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = href;
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 py-4' : 'bg-transparent py-8'}`}>
      <Container>
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 z-50">
            <WebnexaLogo theme={theme} className="w-12 h-12" />
            <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">WEBNEXA AI</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12">
            {navItems.map((item) => (
              <button   
                key={item.label} 
                onClick={() => handleNavClick(item.href)}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex items-center gap-6 pl-8 border-l border-slate-200 dark:border-slate-800">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Button variant="primary" className="px-6 py-3 h-auto text-xs uppercase tracking-wider" onClick={() => handleNavClick('#contact')}>
                Get Free Consultation
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleTheme} className="text-slate-900 dark:text-white">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="text-slate-900 dark:text-white z-50" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Nav Overlay */}
          <div className={`fixed inset-0 bg-white dark:bg-black z-40 flex flex-col items-center justify-center transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
             <div className="flex flex-col gap-8 text-center">
              {navItems.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => handleNavClick(item.href)}
                  className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white hover:text-slate-500"
                >
                  {item.label}
                </button>
              ))}
              <Button className="mt-8" onClick={() => { setIsOpen(false); handleNavClick('#contact'); }}>
                Start Project
              </Button>
             </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

const Hero = () => {
  const revenue = useCountUp(124500, 2000, 0, 0);
  const formattedRevenue = revenue.toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
  const percentage = useCountUp(32.4, 2000, 0, 1);
  const formattedPercentage = percentage.toFixed(1);

  return (
    <section className="relative min-h-screen flex items-center pt-40 pb-20 overflow-hidden">
      <Container className="relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-7">
            <FadeIn delay={100}>
              <div className="inline-flex items-center gap-3 mb-10">
                 <span className="w-12 h-[2px] bg-slate-950 dark:bg-white"></span>
                 <span className="text-sm font-bold tracking-widest uppercase text-slate-950 dark:text-white">AI Automation Agency</span>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <h1 className="text-[5rem] md:text-[7rem] leading-[0.9] font-extrabold tracking-tighter mb-10 text-slate-950 dark:text-white">
                Plan.<br/>
                Manage.<br/>
                <span className="text-blue-600 dark:text-blue-500">Scale.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={300}>
              <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-xl leading-relaxed font-medium">
                We build AI systems that capture and nurture leads automatically, delivering more qualified bookings every single month.
              </h2>
            </FadeIn>

            <FadeIn delay={400} className="flex flex-wrap gap-4">
              <Button icon={ArrowRight} onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Book Strategy Call
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })}>
                View Case Studies
              </Button>
            </FadeIn>

            <FadeIn delay={500}>
              <div className="mt-16 space-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                   <Check className="w-4 h-4 text-green-500" />
                   <span>Generating $900K+ in client revenue this quarter</span>
                </div>
                <div className="flex items-center gap-2">
                   <Check className="w-4 h-4 text-green-500" />
                   <span>Trusted by 20+ growth-focused businesses</span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Visual Element - Right Aligned on Desktop */}
          <div className="hidden lg:block lg:col-span-5 relative h-[700px] w-full">
             <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Abstract Geometric Shapes */}
                <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8">
                    {/* Main dashboard abstraction */}
                    <div className="bg-white dark:bg-black border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-6 mb-6 animate-float">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-slate-950 dark:text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</div>
                                    <div className="text-lg font-bold text-slate-950 dark:text-white">${formattedRevenue}</div>
                                </div>
                            </div>
                            <span className="text-green-500 text-sm font-bold bg-green-500/10 px-2 py-1 rounded">+{formattedPercentage}%</span>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full w-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full w-2/3"></div>
                        </div>
                    </div>

                    {/* Secondary floater - Lead Nurture */}
                    <div className="bg-white dark:bg-black border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-4 max-w-[260px] ml-auto animate-float" style={{ animationDelay: '1.5s' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500">AI Assistant</div>
                                    <div className="text-xs text-slate-900 dark:text-white">Booking confirmed for Tuesday.</div>
                                </div>
                            </div>
                            <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">+25%</span>
                        </div>
                        <div className="flex justify-end">
                           <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500">Just now</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </Container>
      
      {/* Clean Scroll Indicator */}
      <div className="hidden lg:block absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-slate-400">
        <div className="w-[1px] h-16 bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-800 dark:to-slate-600"></div>
      </div>
    </section>
  );
};

const TechMarquee = () => {
  const technologies: { name: string; logo: string }[] = [
    { name: "OpenAI", logo: "https://cdn.simpleicons.org/openai" },
    { name: "Anthropic", logo: "https://cdn.simpleicons.org/anthropic" },
    { name: "Midjourney", logo: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/midjourney-color-icon.svg" },
    { name: "Make.com", logo: "https://cdn.simpleicons.org/make" },
    { name: "Zapier", logo: "https://cdn.simpleicons.org/zapier" },
    { name: "HubSpot", logo: "https://cdn.simpleicons.org/hubspot" },
    { name: "Salesforce", logo: "https://cdn.simpleicons.org/salesforce" },
    { name: "Stripe", logo: "https://cdn.simpleicons.org/stripe" },
    { name: "HighLevel", logo: "https://logo.clearbit.com/gohighlevel.com" },
    { name: "N8N", logo: "https://cdn.simpleicons.org/n8n" },
  ];

  return (
    <div className="py-10 border-y border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden">
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-40 px-12">
          {technologies.map((tech, idx) => (
            <div key={idx} className="flex items-center gap-3 whitespace-nowrap">
              <img src={tech.logo} alt={tech.name} className="h-10 w-auto" loading="lazy" />
              <span className="text-xl font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{tech.name}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-40 px-12 ml-32">
          {technologies.map((tech, idx) => (
            <div key={`dup-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
              <img src={tech.logo} alt={tech.name} className="h-10 w-auto" loading="lazy" />
              <span className="text-xl font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProblemSolution = () => {
  return (
    <section className="py-32 bg-white dark:bg-black">
      <Container>
        <div className="grid lg:grid-cols-2 gap-20">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-slate-950 dark:text-white tracking-tight">
              You're Losing Money <br/><span className="text-red-500">Every Single Day.</span>
            </h2>
            <div className="space-y-10">
              <div>
                <div className="text-5xl font-extrabold text-slate-950 dark:text-white mb-2">40%</div>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Of your team's time goes to repetitive tasks that could be automated.</p>
              </div>
              <div>
                <div className="text-5xl font-extrabold text-slate-950 dark:text-white mb-2">73%</div>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Of leads never get followed up because your team is overwhelmed.</p>
              </div>
              <div>
                <div className="text-5xl font-extrabold text-slate-950 dark:text-white mb-2">Capped</div>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Revenue is stuck because manual processes simply don't scale.</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200} className="bg-slate-50 dark:bg-slate-900/50 p-10 md:p-14 rounded-3xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-3xl font-bold mb-8 text-slate-950 dark:text-white">The Solution: Systems That Work While You Sleep</h3>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-slate-950 dark:text-white">Intelligent Lead Capture</h4>
                  <p className="text-slate-600 dark:text-slate-400">AI agents qualify and route leads instantly—no form goes unanswered.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-slate-950 dark:text-white">24/7 Automated Nurture</h4>
                  <p className="text-slate-600 dark:text-slate-400">Personalized follow-ups that convert cold leads into booked calls automatically.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-slate-950 dark:text-white">Unified Command Center</h4>
                  <p className="text-slate-600 dark:text-slate-400">One dashboard connecting CRM, email, and analytics. No more chaos.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
};

const Stats = () => {
  const stats: Stat[] = [
    { value: "87%", label: "Reduction in Response Time" },
    { value: "3.2x", label: "More Qualified Leads" },
    { value: "24/7", label: "AI Working For You" },
    { value: "23hrs", label: "Time Saved Weekly" }
  ];

  return (
    <section className="py-24 border-y border-slate-100 dark:border-slate-900 bg-white dark:bg-black">
       <Container>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
           {stats.map((stat, idx) => (
             <FadeIn key={idx} delay={idx * 100} className="flex flex-col justify-center">
               <div className="text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white mb-3 tracking-tighter">{stat.value}</div>
               <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-500 dark:text-slate-500 pl-4 border-l-2 border-blue-500">{stat.label}</div>
             </FadeIn>
           ))}
         </div>
       </Container>
    </section>
  );
};

const Services = () => {
  const services: Service[] = [
    {
      title: "AI Customer Acquisition",
      description: "Automated lead generation, instant qualification, and intelligent nurturing that books meetings while you sleep.",
      features: ["Lead Magnet Systems", "Instant Qualification", "Multi-channel Follow-up"],
      cta: "See How It Works"
    },
    {
      title: "Business Process Automation",
      description: "Eliminate busywork. We automate everything from data entry to client onboarding using Make.com & custom AI.",
      features: ["Workflow Mapping", "Custom Integrations", "Auto-Reporting"],
      cta: "Automate Workflows"
    },
    {
      title: "AI Chatbots & Assistants",
      description: "Support that never sleeps. Custom-trained chatbots that handle 80% of inquiries and qualify leads.",
      features: ["GPT-4 Powered", "24/7 Support", "CRM Integration"],
      cta: "Build Your Assistant"
    },
    {
      title: "Predictive Analytics",
      description: "Stop guessing. AI-powered insights that predict customer behavior and optimize marketing spend.",
      features: ["Churn Prediction", "ROI Optimization", "Sales Forecasting"],
      cta: "Get Insights"
    }
  ];

  return (
    <section id="services" className="py-32 bg-slate-50 dark:bg-slate-950/50">
      <Container>
        <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
                <FadeIn>
                    <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">Our Expertise</span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-950 dark:text-white tracking-tight leading-tight">
                        Custom AI Systems Built for <span className="text-slate-400">Your Business.</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg font-medium">
                        No cookie-cutter solutions. We architect systems that fit your exact workflow, industry, and growth goals.
                    </p>
                    <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView()}>
                        Explore All Services
                    </Button>
                </FadeIn>
            </div>

            <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
                {services.map((service, idx) => (
                    <FadeIn key={idx} delay={idx * 150}>
                        <div className="group p-8 md:p-10 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 hover:border-slate-950 dark:hover:border-white transition-colors duration-500 h-full flex flex-col justify-between rounded-xl">
                            <div>
                                <div className="mb-8 w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    {idx === 0 && <TrendingUp className="w-6 h-6 text-slate-950 dark:text-white" />}
                                    {idx === 1 && <Zap className="w-6 h-6 text-slate-950 dark:text-white" />}
                                    {idx === 2 && <MessageSquare className="w-6 h-6 text-slate-950 dark:text-white" />}
                                    {idx === 3 && <BarChart3 className="w-6 h-6 text-slate-950 dark:text-white" />}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-white tracking-tight">{service.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">{service.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-900">
                                <ul className="space-y-2">
                                    {service.features.slice(0, 2).map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        <div className="w-1 h-1 rounded-full bg-blue-500"></div> {feature}
                                    </li>
                                    ))}
                                </ul>
                                <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
      </Container>
    </section>
  );
};

const Process = () => {
  const steps: ProcessStep[] = [
    { 
      step: "01", 
      title: "Deep-Dive Audit", 
      description: "We map your current workflows, identify bottlenecks costing you money, and pinpoint the highest-ROI automation opportunities.",
      deliverable: "Automation Blueprint"
    },
    { 
      step: "02", 
      title: "Rapid Build & Test", 
      description: "Our engineers build your custom AI systems and integrate them with your existing tools. We test everything thoroughly before launch.",
      deliverable: "Functional AI System"
    },
    { 
      step: "03", 
      title: "Launch & Train", 
      description: "We deploy your systems and train your team. You get simple dashboards and hands-on support to ensure smooth adoption.",
      deliverable: "Live System & Training"
    },
    { 
      step: "04", 
      title: "Optimize & Scale", 
      description: "We monitor performance daily, making improvements based on real data. As you grow, we scale your systems.",
      deliverable: "Continuous Growth"
    }
  ];

  return (
    <section id="process" className="py-32 bg-white dark:bg-black text-slate-950 dark:text-white">
      <Container>
        <div className="grid lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-6">
             <FadeIn>
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">
                    From First Call to Revenue in <span className="text-slate-400">30 Days.</span>
                </h2>
             </FadeIn>
          </div>
          <div className="lg:col-span-6 flex items-end">
             <FadeIn delay={100}>
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                    We don't just build and disappear. We partner with you for measurable results through a streamlined, transparent process.
                </p>
             </FadeIn>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800">
          {steps.map((step, idx) => (
            <FadeIn key={idx} delay={idx * 100}>
              <div className="group py-16 border-b border-slate-200 dark:border-slate-800 grid md:grid-cols-12 gap-8 items-start transition-all hover:bg-slate-50 dark:hover:bg-slate-900/30 px-6 -mx-6 rounded-2xl">
                <div className="md:col-span-1 text-sm font-bold text-slate-300 dark:text-slate-700 tracking-widest font-mono">/{step.step}</div>
                <div className="md:col-span-4">
                  <h3 className="text-3xl font-bold tracking-tight group-hover:translate-x-2 transition-transform duration-300">{step.title}</h3>
                </div>
                <div className="md:col-span-4">
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-lg">{step.description}</p>
                </div>
                <div className="md:col-span-3 text-right flex md:justify-end items-center">
                   <span className="inline-block px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider bg-white dark:bg-black">{step.deliverable}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
};

const SocialProofBanner = () => (
  <section className="py-20 bg-blue-600 text-white text-center px-6">
    <Container>
      <FadeIn>
        <div className="flex justify-center mb-6">
            <div className="flex text-yellow-300">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-current" />)}
            </div>
        </div>
        <blockquote className="text-2xl md:text-4xl font-bold leading-tight mb-8 max-w-4xl mx-auto">
          "We went from 12 sales calls per month to 47—without spending an extra dollar on ads."
        </blockquote>
        <cite className="not-italic font-medium text-blue-100 text-lg">
          — Marcus Chen, Founder @ TechScale Solutions
        </cite>
      </FadeIn>
    </Container>
  </section>
);

const CaseStudies = () => {
  const cases: CaseStudy[] = [
    {
      title: "Real Estate Agency",
      industry: "Real Estate",
      problem: "Spending 3 hours daily on lead follow-up, but 60% of leads never got contacted.",
      solution: "AI lead qualification system + automated SMS/email nurturing.",
      results: ["313% increase in appointments", "2.1 hours saved daily", "$147K additional revenue"],
      quote: "From 15 to 62 qualified appointments per month."
    },
    {
      title: "E-commerce Brand",
      industry: "E-commerce",
      problem: "Support tickets piling up, response times 8+ hours, negative reviews increasing.",
      solution: "AI chatbot handling tier-1 support + automated order tracking.",
      results: ["83% tickets resolved by AI", "40 hours/week saved", "$12K monthly cost reduction"],
      quote: "Recovered 40 hours weekly and doubled customer satisfaction."
    },
    {
      title: "B2B SaaS Company",
      industry: "SaaS",
      problem: "High churn rate, no visibility into at-risk customers, manual outreach too late.",
      solution: "Predictive churn model + automated retention workflows.",
      results: ["34% reduction in churn", "$89K monthly revenue saved", "94% prediction accuracy"],
      quote: "Cut customer churn by 34% in one quarter."
    }
  ];

  return (
    <section id="cases" className="py-32 bg-white dark:bg-black">
      <Container>
        <FadeIn>
           <div className="flex flex-col md:flex-row items-end justify-between mb-20">
             <div className="max-w-2xl">
                 <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">Case Studies</span>
                 <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-950 dark:text-white">Real Businesses. <br/>Real Revenue Growth.</h2>
             </div>
             <Button variant="outline" className="mt-8 md:mt-0">View All Case Studies</Button>
           </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
           {cases.map((study, idx) => (
             <FadeIn key={idx} delay={idx * 100}>
               <div className="h-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 flex flex-col">
                 <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                        {study.industry}
                    </span>
                    <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-white">{study.title}</h3>
                    <p className="italic text-slate-600 dark:text-slate-400 text-lg mb-6">"{study.quote}"</p>
                 </div>
                 
                 <div className="space-y-4 mb-8 flex-grow">
                    <div className="text-sm">
                        <span className="font-bold text-slate-950 dark:text-white">Problem: </span>
                        <span className="text-slate-600 dark:text-slate-400">{study.problem}</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-slate-950 dark:text-white">Solution: </span>
                        <span className="text-slate-600 dark:text-slate-400">{study.solution}</span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    {study.results.map((res, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-bold text-green-600">
                            <TrendingUp className="w-4 h-4" /> {res}
                        </div>
                    ))}
                 </div>
               </div>
             </FadeIn>
           ))}
        </div>
      </Container>
    </section>
  );
};

const WhyUs = () => {
  return (
    <section id="why-us" className="py-32 bg-slate-50 dark:bg-black">
       <Container>
         <FadeIn>
           <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-950 dark:text-white tracking-tight">Why Choose Webnexa AI?</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">We aren't just developers; we are growth partners obsessed with your bottom line.</p>
           </div>
         </FadeIn>

         <div className="grid lg:grid-cols-3 gap-12">
            <FadeIn delay={0} className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 text-white">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-white">Focus on Revenue</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">We don't just build "cool tech". Every system is designed with one goal: to increase your bottom line. We track ROI obsessively.</p>
            </FadeIn>

            <FadeIn delay={150} className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 text-white">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-white">Fast Implementation</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Most agencies take 3+ months. We deliver working systems in 30 days with measurable results in the first 2 weeks.</p>
            </FadeIn>

            <FadeIn delay={300} className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 bg-slate-800 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-8 text-white">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-white">You Own Everything</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">No vendor lock-in. All systems, automations, and AI models are built in your accounts. You're never held hostage.</p>
            </FadeIn>
         </div>
       </Container>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How quickly will I see results?",
      answer: "Most clients see measurable improvements within 14 days—more leads captured, faster response times, hours saved. Full ROI typically hits within 90 days."
    },
    {
      question: "I'm not technical. Can I still use this?",
      answer: "That's the point. We build simple, intuitive systems with dashboards anyone can use. Plus, we provide training and ongoing support."
    },
    {
      question: "What if my business is unique?",
      answer: "Perfect. We don't do templates. Every system is custom-built for your specific industry, workflow, and goals. That's why we start with an audit."
    },
    {
      question: "How much does it cost?",
      answer: "Investment ranges from $3K-$15K depending on complexity. Most clients see 300-500% ROI within 6 months. Book a call for a custom quote."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We follow enterprise-grade security protocols (SOC 2 compliant, end-to-end encryption). Your data stays in your systems—we never store sensitive information."
    },
    {
      question: "What happens after the build is done?",
      answer: "We don't disappear. You get ongoing optimization, performance monitoring, and support. We're invested in your long-term success."
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-black border-t border-slate-100 dark:border-slate-900">
      <Container>
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4">
             <FadeIn>
               <h2 className="text-4xl font-bold mb-6 text-slate-950 dark:text-white tracking-tight">Questions?<br/>We've Got Answers.</h2>
               <p className="text-slate-600 dark:text-slate-400 mb-8">Can't find what you're looking for? Chat with our team directly.</p>
               <Button variant="outline">Contact Support</Button>
             </FadeIn>
          </div>
          <div className="lg:col-span-8">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {faqs.map((faq, idx) => (
                <FadeIn key={idx} delay={idx * 50}>
                  <div className="py-6">
                    <button 
                      onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <span className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-blue-600 transition-colors">{faq.question}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                         {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

const CTA = () => {
  return (
    <section id="contact" className="py-32 bg-slate-50 dark:bg-black">
      <Container>
        <div className="bg-slate-950 dark:bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <FadeIn>
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 text-white leading-[1.1]">
                        Stop Leaving Money <br/>on the Table
                    </h2>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
                        Every day without automation is revenue lost. Book a free strategy call and we'll show you exactly how AI can transform your business.
                    </p>
                    <div className="flex flex-col items-center gap-8">
                        <Button className="h-16 px-12 text-lg shadow-2xl hover:scale-105 transition-transform bg-white text-black hover:bg-slate-200 border-none">
                            Book Your Free Strategy Call
                        </Button>
                        <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> No commitment</span>
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Free 30-min audit</span>
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> ROI Roadmap</span>
                        </div>
                        <div className="mt-4 text-yellow-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                             Only 3 Enterprise Spots Available This Quarter
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
      </Container>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black border-t border-slate-100 dark:border-slate-900 py-24">
      <Container>
        <div className="grid lg:grid-cols-4 gap-12 lg:gap-24 items-start">
          <div className="lg:col-span-1">
             <a href="#" className="flex items-center gap-2 mb-8">
              <WebnexaLogo className="w-8 h-8" />
              <span className="text-xl font-extrabold tracking-tighter text-slate-950 dark:text-white">WEBNEXA</span>
            </a>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
              Building the intelligent infrastructures of tomorrow for forward-thinking businesses.
            </p>
            <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <Twitter className="w-4 h-4" />
                </a>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-6">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Company</span>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Case Studies</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Services</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Process</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">About</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Services</span>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Lead Acquisition</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Automation</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Intelligence</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Legal</span>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <p>&copy; 2025 Webnexa AI. All rights reserved.</p>
          <p>San Francisco, CA</p>
        </div>
      </Container>
    </footer>
  );
};

// --- Main App ---

const HomePage = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, []);

  return (
    <>
      <Hero />
      <TechMarquee />
      <ProblemSolution />
      <Stats />
      <Services />
      <Process />
      <SocialProofBanner />
      <CaseStudies />
      <WhyUs />
      <FAQ />
      <CTA />
    </>
  );
};

const App = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-500">
        <Header toggleTheme={toggleTheme} theme={theme} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/postblog" element={<PostBlog />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
