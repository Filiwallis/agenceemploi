"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/ssr";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2Icon, SmileIcon } from "lucide-react";
import Link from "next/link";

const articleFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  excerpt: z.string().min(50, "Le résumé doit contenir au moins 50 caractères"),
  content: z.string().min(100, "Le contenu doit contenir au moins 100 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  image_url: z.string().url("L'URL de l'image est invalide"),
  read_time: z.string().min(1, "Le temps de lecture est requis"),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(true);
  const [currentField, setCurrentField] = useState<keyof ArticleFormValues | null>(null);
  const supabase = createClientComponentClient();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
  });

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const { data: article, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (!article) throw new Error("Article non trouvé");

        form.reset(article);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'article.",
          variant: "destructive",
        });
        router.push("/dashboard/articles");
      } finally {
        setIsLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [supabase, params.id, form, router]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (!currentField) return;
    
    const currentValue = form.getValues(currentField);
    form.setValue(currentField, currentValue + emojiData.emoji);
  };

  async function onSubmit(values: ArticleFormValues) {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("articles")
        .update(values)
        .eq("id", params.id);

      if (error) throw error;

      toast({
        title: "Article mis à jour",
        description: "Votre article a été mis à jour avec succès.",
      });

      router.push("/dashboard/articles");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'article.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderEmojiPicker = (fieldName: keyof ArticleFormValues) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={() => setCurrentField(fieldName)}
        >
          <SmileIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <EmojiPicker onEmojiClick={onEmojiClick} />
      </PopoverContent>
    </Popover>
  );

  if (isLoadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement de l&apos;article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/articles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux articles
        </Link>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Modifier l&apos;article</h1>
          <p className="text-muted-foreground">
            Modifiez les informations de votre article.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Le titre de votre article" {...field} />
                    </FormControl>
                    {renderEmojiPicker("title")}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="Un bref résumé de votre article..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    {renderEmojiPicker("excerpt")}
                  </div>
                  <FormDescription>
                    Ce résumé apparaîtra dans la liste des articles
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="Le contenu de votre article..." 
                        className="min-h-[300px]"
                        {...field} 
                      />
                    </FormControl>
                    {renderEmojiPicker("content")}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Marché de l'emploi">Marché de l&apos;emploi</SelectItem>
                        <SelectItem value="Conseils">Conseils</SelectItem>
                        <SelectItem value="Formation">Formation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="read_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temps de lecture</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 5 min" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l&apos;image</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    L&apos;image principale de l&apos;article
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/articles")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Mettre à jour l&apos;article
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );