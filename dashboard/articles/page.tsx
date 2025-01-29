"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { toast } from "@/components/ui/use-toast";
import {
  PlusCircleIcon,
  SearchIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  Loader2Icon
} from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  category: string;
  read_time: string;
  created_at: string;
  views_count: number;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les articles.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [supabase, router]);

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) throw error;

      setArticles(articles.filter(article => article.id !== articleId));
      
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article.",
        variant: "destructive",
      });
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button asChild>
          <Link href="/dashboard/articles/create">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Créer un article
          </Link>
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {filteredArticles.length === 0 ? (
        <Card className="p-6 text-center">
          {searchTerm ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Aucun article trouvé</h2>
              <p className="text-muted-foreground mb-4">
                Aucun article ne correspond à votre recherche
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
              <h2 className="text-xl font-semibold mb-2">Aucun article publié</h2>
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas encore publié d&apos;article
              </p>
              <Button asChild>
                <Link href="/dashboard/articles/create">
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  Créer mon premier article
                </Link>
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{article.title}</h3>
                    <Badge variant="secondary">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {article.read_time} de lecture
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {article.views_count} vue{article.views_count !== 1 && "s"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/articles/${article.id}/edit`}>
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
                        <AlertDialogTitle>Supprimer l&apos;article ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L&apos;article sera définitivement supprimé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteArticle(article.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}