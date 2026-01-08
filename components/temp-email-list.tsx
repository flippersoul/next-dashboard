"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Copy,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EditTempEmailDialog } from "@/components/edit-temp-email-dialog"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/utils/formatDate"

interface TempEmail {
  Email: string
  MailAddressCredential: string
  AutoLoginEmailLink: string
  RegistrationDate: string
  Availability: boolean
  Warranty: string
  Service: string
}

const ITEMS_PER_PAGE = 12

const getServiceColor = (serviceName: string): string => {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-green-100 text-green-700 border-green-200",
    "bg-orange-100 text-orange-700 border-orange-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-rose-100 text-rose-700 border-rose-200",
  ]

  let hash = 0
  for (let i = 0; i < serviceName.length; i++) {
    hash = serviceName.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export function TempEmailList() {
  const [emails, setEmails] = useState<TempEmail[]>([])
  const [filteredEmails, setFilteredEmails] = useState<TempEmail[]>([])
  const [displayedEmails, setDisplayedEmails] = useState<TempEmail[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState<TempEmail | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState({
    Email: "",
    MailAddressCredential: "",
    AutoLoginEmailLink: "",
    RegistrationDate: new Date().toISOString().split("T")[0],
    Availability: true,
    Warranty: "",
    Service: "",
  })
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadEmails = () => {
    fetch("/data/CloudflareTempEmail.json")
      .then((res) => res.json())
      .then((data: TempEmail[]) => {
        const sorted = data.sort((a, b) => {
          if (a.Availability === b.Availability) return 0
          return a.Availability ? -1 : 1
        })
        setEmails(sorted)
        setFilteredEmails(sorted)
        setDisplayedEmails(sorted.slice(0, page * ITEMS_PER_PAGE))
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading temp emails:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadEmails()
  }, [])

  useEffect(() => {
    let filtered = emails.filter(
      (email) =>
        email.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.MailAddressCredential.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.AutoLoginEmailLink.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.RegistrationDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.Warranty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (email.Service && email.Service.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    if (selectedService) {
      filtered = filtered.filter((email) => email.Service === selectedService)
    }

    filtered = filtered.sort((a, b) => {
      if (a.Availability === b.Availability) return 0
      return a.Availability ? -1 : 1
    })

    setFilteredEmails(filtered)
    setDisplayedEmails(filtered.slice(0, ITEMS_PER_PAGE))
    setPage(1)
  }, [searchQuery, emails, selectedService])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedEmails.length < filteredEmails.length) {
          const nextPage = page + 1
          const newEmails = filteredEmails.slice(0, nextPage * ITEMS_PER_PAGE)
          setDisplayedEmails(newEmails)
          setPage(nextPage)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [displayedEmails, filteredEmails, page])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDelete = async (index: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту запись?")) return

    try {
      const response = await fetch("/api/temp-emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      })

      if (response.ok) {
        loadEmails()
      }
    } catch (error) {
      console.error("Error deleting email:", error)
    }
  }

  const handleEdit = (email: TempEmail, index: number) => {
    setEditingEmail(email)
    setEditIndex(index)
  }

  const handleSaveEdit = async (updatedEmail: TempEmail) => {
    if (editIndex === null) return

    try {
      const response = await fetch("/api/temp-emails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: editIndex, data: updatedEmail }),
      })

      if (response.ok) {
        loadEmails()
        setEditingEmail(null)
        setEditIndex(null)
      }
    } catch (error) {
      console.error("Error updating email:", error)
    }
  }

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailData = {
      ...newEmail,
      Availability: !newEmail.Warranty || newEmail.Warranty.trim() === "",
    }

    try {
      const response = await fetch("/api/temp-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        loadEmails()
        setNewEmail({
          Email: "",
          MailAddressCredential: "",
          AutoLoginEmailLink: "",
          RegistrationDate: new Date().toISOString().split("T")[0],
          Availability: true,
          Warranty: "",
          Service: "",
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error("Error adding email:", error)
    }
  }

  const serviceStats = emails.reduce(
    (acc, email) => {
      const service = email.Service || "Без сервиса"
      if (!acc[service]) {
        acc[service] = { available: 0, unavailable: 0 }
      }
      if (email.Availability) {
        acc[service].available++
      } else {
        acc[service].unavailable++
      }
      return acc
    },
    {} as Record<string, { available: number; unavailable: number }>,
  )

  const availableServices = Object.keys(serviceStats).sort()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по почтам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-11"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="h-11 gap-2">
          <Plus className="h-4 w-4" />
          Добавить почту
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 border-2 border-primary shadow-lg">
          <form onSubmit={handleAddEmail} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  value={newEmail.Email}
                  onChange={(e) => setNewEmail({ ...newEmail, Email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-credential">Credential</Label>
                <Input
                  id="new-credential"
                  value={newEmail.MailAddressCredential}
                  onChange={(e) => setNewEmail({ ...newEmail, MailAddressCredential: e.target.value })}
                  placeholder="credential"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-link">Auto Login Link</Label>
              <Input
                id="new-link"
                value={newEmail.AutoLoginEmailLink}
                onChange={(e) => setNewEmail({ ...newEmail, AutoLoginEmailLink: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-service">Сервис</Label>
                <Input
                  id="new-service"
                  value={newEmail.Service}
                  onChange={(e) => setNewEmail({ ...newEmail, Service: e.target.value })}
                  placeholder="CloudflareTempEmail"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-reg-date">Дата регистрации</Label>
                <Input
                  id="new-reg-date"
                  type="date"
                  value={newEmail.RegistrationDate}
                  onChange={(e) => setNewEmail({ ...newEmail, RegistrationDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-warranty">Гарантия (Номер клиента)</Label>
              <Input
                id="new-warranty"
                value={newEmail.Warranty}
                onChange={(e) => setNewEmail({ ...newEmail, Warranty: e.target.value })}
                placeholder="Оставьте пустым если доступен"
              />
              <p className="text-xs text-muted-foreground">Если заполнено - аккаунт будет недоступным</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="font-medium">Фильтр по сервисам:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedService === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedService(null)}
            className="h-9 gap-2"
          >
            Все сервисы
            <Badge variant="secondary" className="ml-1">
              {emails.length}
            </Badge>
          </Button>
          {availableServices.map((service) => (
            <Button
              key={service}
              variant={selectedService === service ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedService(service)}
              className={`h-9 gap-2 ${selectedService === service ? "" : getServiceColor(service)}`}
            >
              {service}
              <div className="flex items-center gap-1 ml-1">
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" />
                  {serviceStats[service].available}
                </Badge>
                {serviceStats[service].unavailable > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    <XCircle className="w-3 h-3 mr-0.5" />
                    {serviceStats[service].unavailable}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Показано {displayedEmails.length} из {filteredEmails.length}
        </span>
        <Badge variant="secondary">{emails.length} всего</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedEmails.map((email, index) => {
          const globalIndex = emails.findIndex((e) => e.Email === email.Email)
          return (
            <Card
              key={`${email.Email}-${index}`}
              className="p-6 hover:shadow-xl transition-all duration-200 border-2 hover:border-primary/20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {email.Service && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getServiceColor(email.Service)}`}
                      >
                        {email.Service}
                      </div>
                    )}
                    <Badge
                      variant={email.Availability ? "default" : "secondary"}
                      className={`gap-1.5 px-3 py-1 ${
                        email.Availability
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {email.Availability ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Доступен
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          Недоступен
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      onClick={() => handleEdit(email, globalIndex)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(globalIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Input value={email.Email} readOnly className="flex-1 bg-gray-50" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(email.Email, "Email скопирован")}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Label className="text-sm font-medium text-gray-700">Mail Credential</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Input value={email.MailAddressCredential} readOnly className="flex-1 bg-gray-50" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(email.MailAddressCredential, "Credential скопирован")}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {!email.Availability && email.Warranty && (
                    <div className="relative">
                      <Label className="text-sm font-medium text-gray-700">Гарантия (Номер клиента)</Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Input value={email.Warranty} readOnly className="flex-1 bg-gray-50" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(email.Warranty, "Warranty скопирован")}
                          className="shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Дата регистрации
                    </Label>
                    <div className="text-sm font-medium px-3 py-2 bg-muted/30 rounded-md">
                      {formatDate(email.RegistrationDate)}
                    </div>
                  </div>

                  <Button className="w-full gap-2 h-10 bg-primary hover:bg-primary/90" size="sm" asChild>
                    <a href={email.AutoLoginEmailLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Вход
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {displayedEmails.length < filteredEmails.length && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        </div>
      )}

      {editingEmail && (
        <EditTempEmailDialog
          email={editingEmail}
          open={!!editingEmail}
          onOpenChange={(open) => {
            if (!open) {
              setEditingEmail(null)
              setEditIndex(null)
            }
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}
