"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  BookOpenIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  ClockIcon,
  Loader2Icon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  created_at: string;
  author: {
    full_name: string;
  };
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        let query = supabase
          .from("articles")
          .select(`
            *,
            author:profiles(full_name)
          `)
          .order("created_at", { ascending: false });

        if (selectedCategory) {
          query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;

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
  }, [supabase, selectedCategory]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Actualités et conseils</h1>
          <p className="text-muted-foreground">
            Restez informé sur le marché de l&apos;emploi et développez vos compétences
          </p>
        </div>

        {/* Filtres */}
        <Card className="p-4 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                <SelectItem value="Marché de l'emploi">Marché de l&apos;emploi</SelectItem>
                <SelectItem value="Conseils">Conseils</SelectItem>
                <SelectItem value="Formation">Formation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Liste des articles */}
        {filteredArticles.length === 0 ? (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Aucun article trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all">
                <div className="relative h-48">
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">
                      {article.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {article.read_time} de lecture
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <CalendarIcon className="inline-block h-4 w-4 mr-1" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                    <Button variant="link" className="p-0" asChild>
                      <Link href={`/articles/${article.id}`}>
                        Lire la suite
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}