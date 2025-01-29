"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  KeyIcon,
  BellIcon,
  ShieldIcon,
  TrashIcon,
  Loader2Icon
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    applicationUpdates: true,
    marketingEmails: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    try {
      const newValue = !notifications[key];
      
      // Mise à jour de l'état local
      setNotifications(prev => ({
        ...prev,
        [key]: newValue,
      }));

      // Mise à jour dans la base de données
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          notification_settings: {
            ...notifications,
            [key]: newValue,
          },
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences de notification ont été enregistrées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les préférences.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

      {/* Sécurité */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <KeyIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Sécurité</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Modifier le mot de passe
          </Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <BellIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertes email</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des emails pour les nouvelles offres correspondant à votre profil
              </p>
            </div>
            <Switch
              checked={notifications.emailAlerts}
              onCheckedChange={() => handleNotificationChange("emailAlerts")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mises à jour des candidatures</Label>
              <p className="text-sm text-muted-foreground">
                Être notifié quand le statut de vos candidatures change
              </p>
            </div>
            <Switch
              checked={notifications.applicationUpdates}
              onCheckedChange={() => handleNotificationChange("applicationUpdates")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emails marketing</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des informations sur nos services et événements
              </p>
            </div>
            <Switch
              checked={notifications.marketingEmails}
              onCheckedChange={() => handleNotificationChange("marketingEmails")}
            />
          </div>
        </div>
      </Card>

      {/* Suppression du compte */}
      <Card className="p-6 border-destructive">
        <div className="flex items-center gap-2 mb-6">
          <ShieldIcon className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive">Zone de danger</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon className="mr-2 h-4 w-4" />
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Elle supprimera définitivement votre compte
                  et toutes les données associées de nos serveurs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrashIcon className="mr-2 h-4 w-4" />
                  )}
                  Supprimer mon compte
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}