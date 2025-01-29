"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import {
  BriefcaseIcon,
  Users,
  MessageSquare,
  TrendingUp,
  Building2
} from "lucide-react";

interface DashboardStats {
  totalApplications?: number;
  totalJobs?: number;
  totalCandidates?: number;
  totalMessages?: number;
  totalCompanies?: number;
}

export default function DashboardPage() {
  const [userType, setUserType] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserType(profile.type);
        // Ici, nous simulons les statistiques car les tables correspondantes
        // n'ont pas encore été créées
        setStats({
          totalApplications: 12,
          totalJobs: 45,
          totalCandidates: 156,
          totalMessages: 8,
          totalCompanies: 23,
        });
      }
    };

    fetchUserData();
  }, [supabase]);

  const renderCandidateDashboard = () => (
    <>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord Candidat</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Candidatures</p>
              <h3 className="text-2xl font-bold">{stats.totalApplications}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offres correspondantes</p>
              <h3 className="text-2xl font-bold">{stats.totalJobs}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  const renderEmployerDashboard = () => (
    <>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord Employeur</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offres publiées</p>
              <h3 className="text-2xl font-bold">{stats.totalJobs}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 rounded-full">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Candidatures reçues</p>
              <h3 className="text-2xl font-bold">{stats.totalApplications}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord Administrateur</h1>
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Candidats</p>
              <h3 className="text-2xl font-bold">{stats.totalCandidates}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 rounded-full">
              <Building2 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entreprises</p>
              <h3 className="text-2xl font-bold">{stats.totalCompanies}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offres</p>
              <h3 className="text-2xl font-bold">{stats.totalJobs}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <MessageSquare className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <div>
      {userType === "candidate" && renderCandidateDashboard()}
      {userType === "employer" && renderEmployerDashboard()}
      {userType === "admin" && renderAdminDashboard()}
    </div>
  );
}