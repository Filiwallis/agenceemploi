"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const jobFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  company: z.string().min(1, "L'entreprise est requise"),
  location: z.string().min(1, "Le lieu est requis"),
  type: z.string().min(1, "Le type de contrat est requis"),
  salary_range: z.string().optional(),
  description: z.string().min(50, "La description doit contenir au moins 50 caractères"),
  requirements: z.string().min(50, "Les prérequis doivent contenir au moins 50 caractères"),
  benefits: z.string().optional(),
  contact_email: z.string().email("Email invalide").optional(),
  deadline: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const supabase = createClientComponentClient();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const { data: job, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (!job) throw new Error("Offre non trouvée");

        // Vérifier que l'utilisateur est bien le propriétaire de l'offre
        if (job.employer_id !== user.id) {
          throw new Error("Non autorisé");
        }

        form.reset(job);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'offre d'emploi.",
          variant: "destructive",
        });
        router.push("/dashboard/jobs");
      } finally {
        setIsLoadingJob(false);
      }
    };

    fetchJob();
  }, [supabase, params.id, form, router]);

  async function onSubmit(values: JobFormValues) {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("jobs")
        .update(values)
        .eq("id", params.id);

      if (error) throw error;

      toast({
        title: "Offre mise à jour",
        description: "Votre offre d'emploi a été mise à jour avec succès.",
      });

      router.push("/dashboard/jobs");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'offre.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingJob) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement de l&apos;offre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/jobs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux offres
        </Link>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Modifier l&apos;offre d&apos;emploi</h1>
          <p className="text-muted-foreground">
            Modifiez les informations de votre offre d&apos;emploi.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Mêmes champs que dans le formulaire de création */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du poste</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Développeur Full Stack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entreprise</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un lieu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Wallis">Wallis</SelectItem>
                        <SelectItem value="Futuna">Futuna</SelectItem>
                        <SelectItem value="Wallis et Futuna">Wallis et Futuna</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de contrat</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="Stage">Stage</SelectItem>
                        <SelectItem value="Alternance">Alternance</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fourchette de salaire (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 250 000 - 300 000 XPF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du poste</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez le poste, les missions et responsabilités..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prérequis et compétences</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Listez les compétences et qualifications requises..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avantages (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez les avantages proposés..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact (optionnel)</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Si différent de l&apos;email du compte
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date limite de candidature (optionnel)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/jobs")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Mise à jour..." : "Mettre à jour l'offre"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}