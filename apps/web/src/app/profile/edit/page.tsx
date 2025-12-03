"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Upload, ArrowLeft } from "lucide-react"
import { useState, useRef } from "react"
import Link from "next/link"

export default function EditProfilePage() {
  const [name, setName] = useState("Your Name")
  const [bio, setBio] = useState(
    "Full-stack developer passionate about creating beautiful and functional web experiences.",
  )
  const [avatar, setAvatar] = useState("/abstract-self-reflection.png")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Link href="/profile/me">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-xl p-8"
        >
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Edit Profile
          </h1>

          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border-4 border-border/50">
                  <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
                  <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">Recommended: Square image, at least 400x400px</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="glass border-border/50"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="glass border-border/50 resize-none"
              />
              <p className="text-xs text-muted-foreground">{bio.length}/200 characters</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-gradient-to-br from-primary to-accent">Save Changes</Button>
              <Link href="/profile/me" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
