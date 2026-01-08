"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

interface ServiceAccount {
  Email: string
  Password: string
  Availability: boolean
  RegistrationDate: string
  ActiveUntil: string
  Warranty: string
  Service?: string
}

interface EditServiceAccountDialogProps {
  account: ServiceAccount
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (account: ServiceAccount) => void
  availableServices: string[]
}

export function EditServiceAccountDialog({
  account,
  open,
  onOpenChange,
  onSave,
  availableServices,
}: EditServiceAccountDialogProps) {
  const [formData, setFormData] = useState(account)

  useEffect(() => {
    setFormData(account)
  }, [account])

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
          <DialogTitle className="text-xl font-bold">Редактировать аккаунт</DialogTitle>
          <DialogDescription>Измените данные аккаунта и сохраните изменения</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-acc-email">Email</Label>
            <Input
              id="edit-acc-email"
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">Пароль</Label>
            <Input
              id="edit-password"
              type="text"
              value={formData.Password}
              onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-service">Сервис</Label>
            <Input
              id="edit-service"
              type="text"
              value={formData.Service || ""}
              onChange={(e) => setFormData({ ...formData, Service: e.target.value })}
              className="h-11"
              placeholder="Введите название сервиса"
              list="services-list"
              required
            />
            <datalist id="services-list">
              {availableServices.map((service) => (
                <option key={service} value={service} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="edit-active-until">Активен до</Label>
              <Input
                id="edit-active-until"
                type="date"
                value={formData.ActiveUntil.split("T")[0]}
                onChange={(e) => setFormData({ ...formData, ActiveUntil: e.target.value })}
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Warranty: e.target.value,
                })
              }
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
