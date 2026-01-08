"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Check } from "lucide-react"

export function AddTempEmailForm() {
  const [formData, setFormData] = useState({
    Email: "",
    MailAddressCredential: "",
    AutoLoginEmailLink: "",
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/temp-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ Email: "", MailAddressCredential: "", AutoLoginEmailLink: "" })
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error adding email:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={formData.Email}
          onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
          className="h-11 border-2"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="credential">Mail Address Credential</Label>
        <Input
          id="credential"
          type="text"
          placeholder="credential123"
          value={formData.MailAddressCredential}
          onChange={(e) => setFormData({ ...formData, MailAddressCredential: e.target.value })}
          className="h-11 border-2"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Auto Login Email Link</Label>
        <Input
          id="link"
          type="url"
          placeholder="https://..."
          value={formData.AutoLoginEmailLink}
          onChange={(e) => setFormData({ ...formData, AutoLoginEmailLink: e.target.value })}
          className="h-11 border-2"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg"
        disabled={loading}
      >
        {success ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Добавлено успешно!
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 mr-2" />
            {loading ? "Добавление..." : "Добавить почту"}
          </>
        )}
      </Button>
    </form>
  )
}
