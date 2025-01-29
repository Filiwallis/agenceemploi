"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  BriefcaseIcon,
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  MailIcon,
  ArrowLeft,
  Share2Icon,
  ClockIcon,
  TimerIcon,
  AlertCircleIcon,
  Loader2Icon,
  EyeIcon,
  UserIcon
} from "lucide-react";
import Link from "next/link";

// ... reste du code inchangé ...