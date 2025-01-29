"use client"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { 
  LayoutDashboard, 
  BriefcaseIcon, 
  FileTextIcon,
  Settings, 
  LogOut,
  Users,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string>("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserType(profile.type);
      }
    };

    getUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const candidateNavItems = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Mes candidatures",
      href: "/dashboard/applications",
      icon: FileTextIcon,
    },
  ];

  const adminNavItems = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Candidats",
      href: "/dashboard/candidates",
      icon: Users,
    },
    {
      title: "Entreprises",
      href: "/dashboard/companies",
      icon: Building2,
    },
    {
      title: "Offres",
      href: "/dashboard/jobs",
      icon: BriefcaseIcon,
    },
  ];

  const navItems = userType === "candidate" ? candidateNavItems : adminNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-aewf.png"
                alt="Logo AEWF"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-bold text-lg text-primary hidden md:inline">
                Agence de l&apos;Emploi WF
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent/5 ${
                    pathname === item.href
                      ? "bg-accent/10 text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}

            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent/5 ${
                pathname === "/dashboard/settings"
                  ? "bg-accent/10 text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <Settings className="h-5 w-5" />
              Paramètres
            </Link>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}