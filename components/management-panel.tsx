"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTempEmailForm } from "@/components/add-temp-email-form"
import { AddServiceAccountForm } from "@/components/add-service-account-form"
import { Mail, Users } from "lucide-react"

export function ManagementPanel() {
  const [activeTab, setActiveTab] = useState("temp-email")

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Добавление данных
          </CardTitle>
          <CardDescription className="text-base">Добавьте новые почты или аккаунты в систему</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1.5 bg-muted/50">
              <TabsTrigger
                value="temp-email"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Mail className="w-4 h-4" />
                Почты
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                <Users className="w-4 h-4" />
                Аккаунты
              </TabsTrigger>
            </TabsList>

            <TabsContent value="temp-email">
              <AddTempEmailForm />
            </TabsContent>

            <TabsContent value="accounts">
              <AddServiceAccountForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
