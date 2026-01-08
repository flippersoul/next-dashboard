"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
  Calendar,
  Copy,
  Check,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  FileText,
  Shield,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EditServiceAccountDialog } from "@/components/edit-service-account-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/utils/formatDate"

interface ServiceAccount {
  Email: string
  Password: string
  Availability: boolean
  RegistrationDate: string
  ActiveUntil: string
  Warranty: string
  Service?: string
}

const ITEMS_PER_PAGE = 12

const getServiceColor = (serviceName: string): string => {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-orange-100 text-orange-700 border-orange-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  ]

  let hash = 0
  for (let i = 0; i < serviceName.length; i++) {
    hash = serviceName.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export function ServiceAccountsList() {
  const [accounts, setAccounts] = useState<ServiceAccount[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<ServiceAccount[]>([])
  const [displayedAccounts, setDisplayedAccounts] = useState<ServiceAccount[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<ServiceAccount | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [newAccount, setNewAccount] = useState({
    Email: "",
    Password: "",
    Availability: true,
    RegistrationDate: new Date().toISOString().split("T")[0],
    ActiveUntil: "",
    Warranty: "",
    Service: "ServiceAccounts",
  })
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false)
  const [newServiceName, setNewServiceName] = useState("")
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setAvailableServices(data.services || []))
      .catch((error) => console.error("Error loading services:", error))
  }, [])

  const loadAccounts = () => {
    fetch("/data/ServiceAccounts.json")
      .then((res) => res.json())
      .then((data: ServiceAccount[]) => {
        setAccounts(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading service accounts:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    let filtered = accounts.filter(
      (account) =>
        account.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.Password.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.RegistrationDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.ActiveUntil.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.Warranty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (account.Service && account.Service.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    if (selectedService) {
      filtered = filtered.filter((account) => (account.Service || "Без сервиса") === selectedService)
    }

    filtered = filtered.sort((a, b) => {
      if (a.Availability === b.Availability) return 0
      return a.Availability ? -1 : 1
    })

    setFilteredAccounts(filtered)
    setDisplayedAccounts(filtered.slice(0, ITEMS_PER_PAGE))
    setPage(1)
  }, [searchQuery, accounts, selectedService])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedAccounts.length < filteredAccounts.length) {
          const nextPage = page + 1
          const newAccounts = filteredAccounts.slice(0, nextPage * ITEMS_PER_PAGE)
          setDisplayedAccounts(newAccounts)
          setPage(nextPage)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [displayedAccounts, filteredAccounts, page])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDelete = async (index: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту запись?")) return

    try {
      const response = await fetch("/api/service-accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      })

      if (response.ok) {
        loadAccounts()
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const handleEdit = (account: ServiceAccount, index: number) => {
    setEditingAccount(account)
    setEditIndex(index)
  }

  const handleSaveEdit = async (updatedAccount: ServiceAccount) => {
    if (editIndex === null) return

    try {
      const response = await fetch("/api/service-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: editIndex, data: updatedAccount }),
      })

      if (response.ok) {
        loadAccounts()
        setEditingAccount(null)
        setEditIndex(null)
      }
    } catch (error) {
      console.error("Error updating account:", error)
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    const accountData = {
      ...newAccount,
      Service: newAccount.Service.replace(".json", ""),
      Availability: !newAccount.Warranty || newAccount.Warranty.trim() === "",
    }

    try {
      const response = await fetch("/api/service-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      })

      if (response.ok) {
        loadAccounts()
        fetch("/api/services")
          .then((res) => res.json())
          .then((data) => setAvailableServices(data.services || []))

        setNewAccount({
          Email: "",
          Password: "",
          Availability: true,
          RegistrationDate: new Date().toISOString().split("T")[0],
          ActiveUntil: "",
          Warranty: "",
          Service: "ServiceAccounts",
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error("Error adding account:", error)
    }
  }

  const handleCreateService = async () => {
    if (!newServiceName) return

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: newServiceName }),
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableServices([...availableServices, data.serviceName])
        setNewAccount({ ...newAccount, Service: data.serviceName })
        setShowNewServiceDialog(false)
        setNewServiceName("")
      }
    } catch (error) {
      console.error("Error creating service:", error)
    }
  }

  const serviceStats = accounts.reduce(
    (stats, account) => {
      const service = account.Service || "Без сервиса"
      if (!stats[service]) {
        stats[service] = { total: 0, available: 0, unavailable: 0 }
      }
      stats[service].total++
      if (account.Availability) {
        stats[service].available++
      } else {
        stats[service].unavailable++
      }
      return stats
    },
    {} as Record<string, { total: number; available: number; unavailable: number }>,
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAccount({ ...newAccount, [name]: value })
  }

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
              <Skeleton className="h-20 w-full" />
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
            placeholder="Поиск по аккаунтам..."
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
          Добавить аккаунт
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 border-2 border-primary shadow-lg">
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-service">Сервис</Label>
              <Input
                id="new-service"
                name="Service"
                value={newAccount.Service}
                onChange={(e) => setNewAccount({ ...newAccount, Service: e.target.value })}
                placeholder="Название сервиса"
                list="services-datalist"
                required
              />
              <datalist id="services-datalist">
                {availableServices.map((service) => (
                  <option key={service} value={service} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-acc-email">Email</Label>
                <Input
                  id="new-acc-email"
                  value={newAccount.Email}
                  onChange={(e) => setNewAccount({ ...newAccount, Email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newAccount.Password}
                  onChange={(e) => setNewAccount({ ...newAccount, Password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-reg-date">Дата регистрации</Label>
                <Input
                  id="new-reg-date"
                  type="date"
                  value={newAccount.RegistrationDate}
                  onChange={(e) => setNewAccount({ ...newAccount, RegistrationDate: e.target.value })}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-active-until">Активен до</Label>
                <Input
                  id="new-active-until"
                  type="date"
                  value={newAccount.ActiveUntil}
                  onChange={(e) => setNewAccount({ ...newAccount, ActiveUntil: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-warranty">Гарантия (Номер клиента)</Label>
              <Input
                id="new-warranty"
                value={newAccount.Warranty}
                onChange={(e) => setNewAccount({ ...newAccount, Warranty: e.target.value })}
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
              {accounts.length}
            </Badge>
          </Button>
          {Object.keys(serviceStats)
            .sort()
            .map((service) => {
              const isSelected = selectedService === service
              const colorClass = getServiceColor(service)

              return (
                <Button
                  key={service}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedService(service)}
                  className={`h-9 gap-2 ${!isSelected ? colorClass : ""}`}
                >
                  {service}
                  <div className="flex items-center gap-1 ml-1">
                    <Badge
                      variant={isSelected ? "outline" : "secondary"}
                      className={`h-5 px-1.5 text-xs ${isSelected ? "bg-background/20" : ""}`}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-0.5" />
                      {serviceStats[service].available}
                    </Badge>
                    {serviceStats[service].unavailable > 0 && (
                      <Badge
                        variant={isSelected ? "outline" : "secondary"}
                        className={`h-5 px-1.5 text-xs ${isSelected ? "bg-background/20" : ""}`}
                      >
                        <XCircle className="w-3 h-3 mr-0.5" />
                        {serviceStats[service].unavailable}
                      </Badge>
                    )}
                  </div>
                </Button>
              )
            })}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Показано {displayedAccounts.length} из {filteredAccounts.length}
        </span>
        <div className="flex gap-2">
          <Badge variant="secondary">Доступно: {filteredAccounts.filter((a) => a.Availability).length}</Badge>
          <Badge variant="secondary">{filteredAccounts.length} всего</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedAccounts.map((account, index) => {
          const globalIndex = accounts.findIndex((a) => a.Email === account.Email)
          return (
            <Card
              key={`${account.Email}-${index}`}
              className="p-6 hover:shadow-xl transition-all duration-200 border-2 hover:border-primary/20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={account.Availability ? "default" : "secondary"}
                      className={`gap-1.5 px-3 py-1 ${
                        account.Availability
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {account.Availability ? (
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
                    {account.Service && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium`}
                      >
                        {account.Service}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      onClick={() => handleEdit(account, globalIndex)}
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </Label>
                    <div className="relative">
                      <Input value={account.Email} readOnly className="pr-10 font-mono text-sm h-9 bg-muted/30" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent/20"
                        onClick={() => copyToClipboard(account.Email, `acc-email-${globalIndex}`)}
                      >
                        {copiedField === `acc-email-${globalIndex}` ? (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Пароль
                    </Label>
                    <div className="relative">
                      <Input
                        type="password"
                        value={account.Password}
                        readOnly
                        className="pr-10 font-mono text-sm h-9 bg-muted/30"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent/20"
                        onClick={() => copyToClipboard(account.Password, `password-${index}`)}
                      >
                        {copiedField === `password-${index}` ? (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Регистрация
                      </Label>
                      <div className="text-sm font-medium bg-muted/30 px-3 py-2 rounded-md">
                        {formatDate(account.RegistrationDate)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Активен до
                      </Label>
                      <div className="text-sm font-medium bg-muted/30 px-3 py-2 rounded-md">
                        {formatDate(account.ActiveUntil)}
                      </div>
                    </div>
                  </div>

                  {!account.Availability && account.Warranty && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Гарантия (Номер клиента)
                      </Label>
                      <div className="relative">
                        <Input value={account.Warranty} readOnly className="pr-10 font-mono text-sm h-9 bg-muted/30" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent/20"
                          onClick={() => copyToClipboard(account.Warranty, `warranty-${index}`)}
                        >
                          {copiedField === `warranty-${index}` ? (
                            <Check className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div ref={observerTarget} className="h-4" />

      {editingAccount && (
        <EditServiceAccountDialog
          account={editingAccount}
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          onSave={handleSaveEdit}
          availableServices={availableServices}
        />
      )}

      <Dialog open={showNewServiceDialog} onOpenChange={setShowNewServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый сервис</DialogTitle>
            <DialogDescription>Введите название нового сервиса для создания JSON файла</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Название сервиса</Label>
              <Input
                id="service-name"
                placeholder="Например: Netflix"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewServiceDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateService}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
