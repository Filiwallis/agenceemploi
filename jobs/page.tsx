"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
  BriefcaseIcon,
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  SearchIcon,
  AlertCircleIcon,
  Loader2Icon,
  EyeIcon,
  ClockIcon
} from "lucide-react";
import Link from "next/link";

// ... reste du code inchangé ...