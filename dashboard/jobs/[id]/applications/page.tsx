"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  ArrowLeft,
  Loader2Icon,
  FileTextIcon,
  EyeIcon
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  cover_letter?: string;
  created_at: string;
  candidate: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
  applications_count: number;
}

const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
  },
  accepted: {
    label: "Acceptée",
    color: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Refusée",
    color: "bg-red-100 text-red-800",
  },
  withdrawn: {
    label: "Retirée",
    color: "bg-gray-100 text-gray-800",
  },
};

export default function JobApplicationsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Récupérer l'offre
        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .select("id, title, company, applications_count")
          .eq("id", params.id)
          .eq("employer_id", user.id)
          .single();

        if (jobError) throw jobError;
        if (!job) {
          router.push("/dashboard/jobs");
          return;
        }

        setJob(job);

        // Récupérer les candidatures
        const { data: applications, error: applicationsError } = await supabase
          .from("applications")
          .select(`
            id,
            status,
            cover_letter,
            created_at,
            candidate:profiles (
              id,
              full_name,
              email,
              phone
            )
          `)
          .eq("job_id", params.id)
          .order("created_at", { ascending: false });

        if (applicationsError) throw applicationsError;
        setApplications(applications || []);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les candidatures.",
          variant: "destructive",
        });
        router.push("/dashboard/jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [supabase, params.id, router]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      toast({
        title: "Statut mis à jour",
        description: `La candidature a été ${
          newStatus === "accepted" ? "acceptée" : "refusée"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la candidature.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Offre non trouvée</h1>
        <p className="text-muted-foreground mb-6">
          L&apos;offre que vous recherchez n&apos;existe pas ou vous n&apos;avez pas les droits pour y accéder.
        </p>
        <Button asChild>
          <Link href="/dashboard/jobs">Retour aux offres</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/jobs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux offres
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Candidatures pour {job.title}
        </h1>
        <p className="text-muted-foreground">
          {applications.length} candidature{applications.length > 1 ? "s" : ""} reçue{applications.length > 1 ? "s" : ""}
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Aucune candidature</h2>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas encore reçu de candidature pour cette offre.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-xl font-semibold">
                      {application.candidate.full_name}
                    </h2>
                    <Badge 
                      variant="secondary"
                      className={statusConfig[application.status as keyof typeof statusConfig].color}
                    >
                      {statusConfig[application.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4" />
                      <a 
                        href={`mailto:${application.candidate.email}`}
                        className="hover:text-primary"
                      >
                        {application.candidate.email}
                      </a>
                    </div>
                    {application.candidate.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4" />
                        <a 
                          href={`tel:${application.candidate.phone}`}
                          className="hover:text-primary"
                        >
                          {application.candidate.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Candidature envoyée le {new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {application.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => updateApplicationStatus(application.id, "accepted")}
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => updateApplicationStatus(application.id, "rejected")}
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                  </div>
                )}
              </div>

              {application.cover_letter && (
                <>
                  <Separator className="my-4" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <FileTextIcon className="h-4 w-4 mr-2" />
                        Voir la lettre de motivation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Lettre de motivation</DialogTitle>
                        <DialogDescription>
                          De {application.candidate.full_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 whitespace-pre-wrap">
                        {application.cover_letter}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}