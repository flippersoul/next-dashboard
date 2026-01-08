"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Check } from "lucide-react"

export function AddServiceAccountForm() {
  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
    Availability: true,
    RegistrationDate: new Date().toISOString().split("T")[0],
    ActiveUntil: "",
    Warranty: false,
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/service-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({
          Email: "",
          Password: "",
          Availability: true,
          RegistrationDate: new Date().toISOString().split("T")[0],
          ActiveUntil: "",
          Warranty: false,
        })
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error adding account:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="acc-email">Email</Label>
        <Input
          id="acc-email"
          type="email"
          placeholder="example@email.com"
          value={formData.Email}
          onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
          className="h-11 border-2"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="text"
          placeholder="••••••••"
          value={formData.Password}
          onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
          className="h-11 border-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-date">Дата регистрации</Label>
          <Input
            id="reg-date"
            type="date"
            value={formData.RegistrationDate}
            onChange={(e) => setFormData({ ...formData, RegistrationDate: e.target.value })}
            className="h-11 border-2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="active-until">Активен до</Label>
          <Input
            id="active-until"
            type="date"
            value={formData.ActiveUntil}
            onChange={(e) => setFormData({ ...formData, ActiveUntil: e.target.value })}
            className="h-11 border-2"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="availability"
            checked={formData.Availability}
            onCheckedChange={(checked) => setFormData({ ...formData, Availability: checked as boolean })}
          />
          <Label htmlFor="availability" className="cursor-pointer">
            Доступен
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="warranty"
            checked={formData.Warranty}
            onCheckedChange={(checked) => setFormData({ ...formData, Warranty: checked as boolean })}
          />
          <Label htmlFor="warranty" className="cursor-pointer">
            Гарантия
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold shadow-lg"
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
            {loading ? "Добавление..." : "Добавить аккаунт"}
          </>
        )}
      </Button>
    </form>
  )
}
