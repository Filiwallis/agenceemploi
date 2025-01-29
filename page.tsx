import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BriefcaseIcon, BuildingIcon, UserIcon, MapPinIcon, CalendarIcon, BookOpenIcon, TrendingUpIcon as TrendUpIcon, GraduationCapIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const recentJobs = [
  {
    id: "1",
    title: "Magasinier H/F",
    company: "Garage Auto Pacific",
    location: "Wallis",
    type: "CDI",
    created_at: new Date().toISOString(),
    description: "Gestion du stock de pièces automobiles, service client et maintenance du magasin de pièces auto",
  },
  {
    id: "2",
    title: "Commercial Automobile H/F",
    company: "Auto WF",
    location: "Wallis",
    type: "CDI",
    created_at: new Date().toISOString(),
    description: "Vente de véhicules neufs et d'occasion, conseil client et suivi commercial",
  },
  {
    id: "3",
    title: "Gestionnaire de Paie H/F",
    company: "Cabinet Pacific",
    location: "Futuna",
    type: "Intérim",
    created_at: new Date().toISOString(),
    description: "Gestion de la paie et administration du personnel pour plusieurs entreprises",
  },
  {
    id: "4",
    title: "Chef de Projet Digital H/F",
    company: "Agence Web WF",
    location: "Wallis",
    type: "CDD",
    created_at: new Date().toISOString(),
    description: "Pilotage de projets web et digitaux, coordination des équipes et relation client",
  }
];

const articles = [
  {
    id: "1",
    title: "Les secteurs qui recrutent à Wallis et Futuna en 2024",
    excerpt: "Découvrez les tendances du marché de l'emploi local et les opportunités à saisir dans les secteurs porteurs.",
    category: "Marché de l'emploi",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    date: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Comment réussir son entretien d'embauche ?",
    excerpt: "Nos conseils pratiques pour vous démarquer lors de vos entretiens et mettre toutes les chances de votre côté.",
    category: "Conseils",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
    date: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Les formations professionnelles disponibles sur le territoire",
    excerpt: "Tour d'horizon des formations pour développer vos compétences et booster votre carrière.",
    category: "Formation",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
    date: new Date().toISOString(),
  }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-aewf.png"
                alt="Logo AEWF"
                width={60}
                height={60}
                className="rounded-full"
              />
              <span className="font-bold text-lg text-primary hidden md:inline">
                Agence de l&apos;Emploi WF
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Inscription</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section avec offres d'emploi */}
      <section className="bg-gradient-to-b from-primary to-primary/90 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Offres d&apos;emploi à Wallis et Futuna
            </h1>
            <p className="text-xl opacity-90">
              Découvrez nos dernières opportunités professionnelles
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
            {recentJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <Badge variant="secondary">{job.type}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <BuildingIcon className="h-4 w-4 mr-2" />
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2 mb-4">{job.description}</p>
                  <Button className="w-full" asChild>
                    <Link href={`/jobs/${job.id}`}>Voir l&apos;offre</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/jobs">Voir toutes les offres</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section des profils */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Accès rapide selon votre profil
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Candidats</h3>
                <p className="mb-6 text-muted-foreground">
                  Trouvez votre prochain emploi et gérez vos candidatures
                </p>
                <Link href="/auth/register?type=candidate">
                  <Button className="w-full">
                    Espace Candidat
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-center">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingIcon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Employeurs</h3>
                <p className="mb-6 text-muted-foreground">
                  Publiez vos offres et trouvez les meilleurs talents
                </p>
                <Link href="/auth/register?type=employer">
                  <Button className="w-full" variant="secondary">
                    Espace Recruteur
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Actualités et conseils
              </h2>
              <p className="text-muted-foreground">
                Restez informé sur le marché de l&apos;emploi et développez vos compétences
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/articles">
                <BookOpenIcon className="mr-2 h-4 w-4" />
                Tous les articles
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all">
                <div className="relative h-48">
                  <Image
                    src={article.image}
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
                      {article.readTime} de lecture
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <Button variant="link" className="p-0" asChild>
                    <Link href={`/articles/${article.id}`}>
                      Lire la suite
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Catégories d'articles */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <TrendUpIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Marché de l&apos;emploi</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyses et tendances du marché local
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <UserIcon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Conseils carrière</h3>
                  <p className="text-sm text-muted-foreground">
                    Guides pratiques et recommandations
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <GraduationCapIcon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Formation</h3>
                  <p className="text-sm text-muted-foreground">
                    Développez vos compétences
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">À propos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Qui sommes-nous</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Nos missions</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Candidats</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Rechercher un emploi</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Créer un CV</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Conseils carrière</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Employeurs</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Publier une offre</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Rechercher des CV</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Mentions légales</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Politique de confidentialité</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Agence de l&apos;Emploi de Wallis et Futuna. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}