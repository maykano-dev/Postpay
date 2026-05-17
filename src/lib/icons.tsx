import * as React from "react"
import { MessageCircle, Camera, Ghost, Music, Globe } from "lucide-react"
import type { AdPlatform } from "@/types"

export const PLATFORM_ICONS: Record<AdPlatform, React.ReactNode> = {
  whatsapp: <MessageCircle className="text-green-buzz" />,
  instagram: <Camera className="text-pink-500" />,
  snapchat: <Ghost className="text-yellow-400" />,
  tiktok: <Music className="text-white" />,
  facebook: <Globe className="text-blue-500" />,
}
