"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  BriefcaseIcon, 
  PlusCircleIcon, 
  SearchIcon,
  MapPinIcon,
  BuildingIcon,
  CalendarIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  Loader2Icon
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  created_at: string;
  status: string;
  applications_count: number;
  views_count: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("employer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos offres d'emploi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [supabase]);

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobId));
      
      toast({
        title: "Offre supprimée",
        description: "L'offre d'emploi a été supprimée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'offre d'emploi.",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement de vos offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes offres d&apos;emploi</h1>
        <Button asChild>
          <Link href="/dashboard/jobs/create">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Publier une offre
          </Link>
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Rechercher dans mes offres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {filteredJobs.length === 0 ? (
        <Card className="p-6 text-center">
          {searchTerm ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Aucune offre trouvée</h2>
              <p className="text-muted-foreground mb-4">
                Aucune offre ne correspond à votre recherche
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
              >
                Réinitialiser la recherche
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Aucune offre publiée</h2>
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas encore publié d&apos;offre d&apos;emploi
              </p>
              <Button asChild>
                <Link href="/dashboard/jobs/create">
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  Publier ma première offre
                </Link>
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <div className="flex gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <BuildingIcon className="h-4 w-4 mr-1" />
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/jobs/${job.id}/edit`}>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Modifier
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l&apos;offre ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L&apos;offre et toutes les candidatures associées seront définitivement supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteJob(job.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span className="font-semibold">{job.applications_count}</span> candidature{job.applications_count !== 1 && "s"}
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    <span className="font-semibold">{job.views_count}</span> vue{job.views_count !== 1 && "s"}
                  </div>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/dashboard/jobs/${job.id}/applications`}>
                    Voir les candidatures
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}