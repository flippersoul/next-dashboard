"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

interface TempEmail {
  Email: string
  MailAddressCredential: string
  AutoLoginEmailLink: string
  RegistrationDate: string
  Availability: boolean
  Warranty: string
  Service: string
}

interface EditTempEmailDialogProps {
  email: TempEmail
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (email: TempEmail) => void
}

export function EditTempEmailDialog({ email, open, onOpenChange, onSave }: EditTempEmailDialogProps) {
  const [formData, setFormData] = useState(email)

  useEffect(() => {
    setFormData(email)
  }, [email])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedData = {
      ...formData,
      Availability: !formData.Warranty || formData.Warranty.trim() === "",
    }
    onSave(updatedData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Редактировать почту</DialogTitle>
          <DialogDescription>Измените данные почты и сохраните изменения</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-credential">Credential</Label>
            <Input
              id="edit-credential"
              type="text"
              value={formData.MailAddressCredential}
              onChange={(e) => setFormData({ ...formData, MailAddressCredential: e.target.value })}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-link">Auto Login Link</Label>
            <Input
              id="edit-link"
              type="url"
              value={formData.AutoLoginEmailLink}
              onChange={(e) => setFormData({ ...formData, AutoLoginEmailLink: e.target.value })}
              className="h-11"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-service">Сервис</Label>
              <Input
                id="edit-service"
                type="text"
                value={formData.Service}
                onChange={(e) => setFormData({ ...formData, Service: e.target.value })}
                className="h-11"
                placeholder="CloudflareTempEmail"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-reg-date">Дата регистрации</Label>
              <Input
                id="edit-reg-date"
                type="date"
                value={formData.RegistrationDate.split("T")[0]}
                onChange={(e) => setFormData({ ...formData, RegistrationDate: e.target.value })}
                className="h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-warranty">Гарантия (Номер клиента)</Label>
            <Input
              id="edit-warranty"
              type="text"
              value={formData.Warranty}
              onChange={(e) => setFormData({ ...formData, Warranty: e.target.value })}
              className="h-11"
              placeholder="Оставьте пустым если доступен"
            />
            <p className="text-xs text-muted-foreground">
              {formData.Warranty && formData.Warranty.trim() !== ""
                ? "Аккаунт недоступен (гарантия заполнена)"
                : "Аккаунт доступен"}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" className="flex-1 h-11">
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
