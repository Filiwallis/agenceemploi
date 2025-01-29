"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  SearchIcon,
  Send,
  Loader2Icon,
  UserIcon,
  Clock,
} from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  other_user: {
    id: string;
    full_name: string;
    type: string;
  };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("conversations")
          .select(`
            id,
            last_message,
            last_message_at,
            unread_count,
            other_user:profiles!other_user_id (
              id,
              full_name,
              type
            )
          `)
          .eq("user_id", user.id)
          .order("last_message_at", { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les conversations.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [supabase]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", selectedConversation)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Marquer les messages comme lus
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", selectedConversation)
          .eq("receiver_id", user.id)
          .eq("read", false);

        // Mettre à jour le compteur de messages non lus
        setConversations(conversations.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, unread_count: 0 }
            : conv
        ));
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages.",
          variant: "destructive",
        });
      }
    };

    fetchMessages();

    // Abonnement aux nouveaux messages
    const channel = supabase
      .channel(`conversation:${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedConversation, conversations]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;

      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          receiver_id: conversation.other_user.id,
          content: newMessage,
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <Card className="grid md:grid-cols-[300px_1fr] h-full">
        {/* Liste des conversations */}
        <div className="border-r">
          <div className="p-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-16rem)]">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Aucune conversation
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-accent/5 ${
                      selectedConversation === conversation.id ? "bg-accent/10" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {conversation.other_user.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {conversation.other_user.type === "employer" ? "Recruteur" : "Candidat"}
                          </p>
                        </div>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {conversation.last_message}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(conversation.last_message_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Zone de messages */}
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const { data: { user } } = await supabase.auth.getUser();
                  const isOwnMessage = message.sender_id === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent/10"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={isSending}
                />
                <Button type="submit" disabled={isSending}>
                  {isSending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-muted-foreground">
                Choisissez une conversation dans la liste pour afficher les messages
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}