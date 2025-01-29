"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  Share2Icon,
  Loader2Icon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  created_at: string;
  author: {
    full_name: string;
  };
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select(`
            *,
            author:profiles(full_name)
          `)
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'article.",
          variant: "destructive",
        });
        router.push("/articles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [supabase, params.id, router]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Chargement de l&apos;article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            L&apos;article que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link href="/articles">Voir tous les articles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link 
          href="/articles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux articles
        </Link>
      </div>

      <article className="max-w-3xl mx-auto">
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            {article.category}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {article.author.full_name}
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {new Date(article.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {article.read_time} de lecture
            </div>
          </div>
        </div>

        <Card className="p-8">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Card>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              navigator.share({
                title: article.title,
                text: article.title,
                url: window.location.href,
              });
            }}
          >
            <Share2Icon className="mr-2 h-4 w-4" />
            Partager l&apos;article
          </Button>
        </div>
      </article>
    </div>
  );
}