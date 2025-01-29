"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  BriefcaseIcon,
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  Loader2Icon
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  };
}

const statusConfig = {
  pending: {
    label: "En attente",
    icon: ClockIcon,
    color: "bg-yellow-100 text-yellow-800",
  },
  accepted: {
    label: "Acceptée",
    icon: CheckCircle2Icon,
    color: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Refusée",
    icon: XCircleIcon,
    color: "bg-red-100 text-red-800",
  },
  withdrawn: {
    label: "Retirée",
    icon: XCircleIcon,
    color: "bg-gray-100 text-gray-800",
  },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("applications")
          .select(`
            id,
            status,
            created_at,
            job:jobs (
              id,
              title,
              company,
              location,
              type
            )
          `)
          .eq("candidate_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos candidatures.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [supabase]);

  const handleWithdraw = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "withdrawn" })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: "withdrawn" }
          : app
      ));

      toast({
        title: "Candidature retirée",
        description: "Votre candidature a été retirée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer votre candidature.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mes candidatures</h1>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Aucune candidature</h2>
          <p className="text-muted-foreground mb-6">
            Vous n&apos;avez pas encore postulé à des offres d&apos;emploi.
          </p>
          <Button asChild>
            <Link href="/jobs">Voir les offres d&apos;emploi</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mes candidatures</h1>
      
      <div className="space-y-4">
        {applications.map((application) => {
          const status = statusConfig[application.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={application.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link 
                    href={`/jobs/${application.job.id}`}
                    className="text-xl font-semibold hover:text-primary"
                  >
                    {application.job.title}
                  </Link>
                  <div className="flex flex-wrap gap-4 text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <BuildingIcon className="h-4 w-4 mr-1" />
                      {application.job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {application.job.location}
                    </div>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      {application.job.type}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="secondary"
                  className={`flex items-center gap-1 ${status.color}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  {status.label}
                </Badge>
              </div>

              {application.status === "pending" && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleWithdraw(application.id)}
                  >
                    Retirer ma candidature
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}