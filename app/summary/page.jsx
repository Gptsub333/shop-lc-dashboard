"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Phone, Clock, CheckCircle2, User, AlertCircle } from "lucide-react"
import { dashboardAPI } from "@/lib/api-client"

export default function SummaryPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [responseData, setResponseData] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFetchSummary = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number")
      return
    }

    setLoading(true)
    setError(null)
    setResponseData(null)
    setSelectedSession(null)

    try {
      // Fetch conversation using mobile number as session ID
      const data = await dashboardAPI.getConversation(phoneNumber)
      console.log("API Response:", data)

      if (data && data.conversations && data.conversations.length > 0) {
        setResponseData(data)
        // Automatically select the first (most recent) conversation
        setSelectedSession(data.conversations[0])
      } else {
        setError("No conversations found for this phone number")
      }
    } catch (err) {
      setError(err.message || "Failed to fetch conversation. Please check the phone number and try again.")
    } finally {
      setLoading(false)
    }
  }

  const parseSummary = (summaryString) => {
    try {
      if (typeof summaryString === "object") return summaryString
      return JSON.parse(summaryString)
    } catch {
      return { summary: summaryString }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Call Lookup" subtitle="Search for call summaries and conversation logs" />

        <main className="flex-1 overflow-y-auto p-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search by Phone Number</CardTitle>
              <CardDescription>Enter a mobile number to retrieve the session summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="tel"
                  placeholder="Enter phone number (e.g., 2182063791)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchSummary()}
                  className="flex-1"
                />
                <Button onClick={handleFetchSummary} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Loading..." : "Fetch Summary"}
                </Button>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Error</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {responseData && responseData.conversations && (
            <div className="space-y-6">
              {/* Conversation List - Show if multiple conversations exist */}
              {responseData.conversations.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conversations ({responseData.total})</CardTitle>
                    <CardDescription>Select a conversation to view details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {responseData.conversations.map((conv, index) => (
                        <button
                          key={conv.session_id}
                          onClick={() => setSelectedSession(conv)}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedSession?.session_id === conv.session_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">
                                Call #{responseData.conversations.length - index}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(conv.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {conv.conversation?.length || 0} messages
                              </p>
                              <p className="text-xs text-success capitalize">{conv.status}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Selected Conversation Details */}
              {selectedSession && (
                <>
                  {/* Session Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Phone Number</p>
                            <p className="text-sm font-semibold">{selectedSession.mobile_number}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-chart-2" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Started At</p>
                            <p className="text-sm font-semibold">{formatDate(selectedSession.created_at)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="text-sm font-semibold capitalize">{selectedSession.status || "completed"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-chart-4" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Session ID</p>
                            <p className="text-xs font-mono">{selectedSession.session_id?.slice(0, 16) || "N/A"}...</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabbed Content */}
                  <Card>
                    <Tabs defaultValue="conversation" className="w-full">
                      <CardHeader className="pb-4">
                        <TabsList className="grid w-full max-w-md grid-cols-3">
                          <TabsTrigger value="conversation">Conversation</TabsTrigger>
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="metadata">Metadata</TabsTrigger>
                        </TabsList>
                      </CardHeader>

                      <CardContent>
                        <TabsContent value="conversation" className="mt-0">
                          <div className="space-y-4">
                            {selectedSession.conversation && selectedSession.conversation.length > 0 ? (
                              selectedSession.conversation.map((msg, index) => {
                                const isAgent = "assistant" in msg
                                const message = isAgent ? msg.assistant : msg.user
                                const role = isAgent ? "agent" : "user"

                                return (
                                  <div key={index} className={`flex ${role === "agent" ? "justify-start" : "justify-end"}`}>
                                    <div
                                      className={`max-w-[70%] rounded-lg p-4 ${role === "agent"
                                        ? "bg-card border border-border"
                                        : "bg-primary text-primary-foreground"
                                        }`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold">
                                          {role === "agent" ? "AI Agent" : "Customer"}
                                        </span>
                                        <span className="text-xs opacity-70">{formatDate(msg.timestamp)}</span>
                                      </div>
                                      <p className="text-sm leading-relaxed">{message}</p>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-8">
                                No conversation data available
                              </p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="summary" className="mt-0">
                          <div className="space-y-4">
                            {selectedSession.summary ? (
                              Object.entries(parseSummary(selectedSession.summary)).map(([key, value]) => (
                                <div key={key} className="border-b border-border pb-4 last:border-0">
                                  <p className="text-sm font-semibold text-foreground mb-2 capitalize">
                                    {key.replace(/_/g, " ")}
                                  </p>
                                  {Array.isArray(value) ? (
                                    <ul className="list-disc list-inside space-y-1">
                                      {value.map((item, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground">
                                          {typeof item === "object" ? JSON.stringify(item) : item}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : typeof value === "object" && value !== null ? (
                                    <div className="pl-4 space-y-2">
                                      {Object.entries(value).map(([subKey, subValue]) => (
                                        <div key={subKey}>
                                          <span className="text-sm font-medium">{subKey}: </span>
                                          <span className="text-sm text-muted-foreground">{String(subValue)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">{String(value)}</p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-8">No summary available</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="metadata" className="mt-0">
                          <div className="space-y-4">
                            {selectedSession.metadata && (
                              <>
                                <div className="border-b border-border pb-4">
                                  <p className="text-sm font-semibold text-foreground mb-2">Call SID</p>
                                  <p className="text-sm text-muted-foreground font-mono">
                                    {selectedSession.metadata.call_sid || "N/A"}
                                  </p>
                                </div>
                                <div className="border-b border-border pb-4">
                                  <p className="text-sm font-semibold text-foreground mb-2">From</p>
                                  <p className="text-sm text-muted-foreground">{selectedSession.metadata.from || "N/A"}</p>
                                </div>
                                <div className="border-b border-border pb-4">
                                  <p className="text-sm font-semibold text-foreground mb-2">To</p>
                                  <p className="text-sm text-muted-foreground">{selectedSession.metadata.to || "N/A"}</p>
                                </div>
                              </>
                            )}
                            {selectedSession.summary_generated_at && (
                              <div className="border-b border-border pb-4">
                                <p className="text-sm font-semibold text-foreground mb-2">Summary Generated At</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(selectedSession.summary_generated_at)}
                                </p>
                              </div>
                            )}
                            {selectedSession.ended_at && (
                              <div className="border-b border-border pb-4">
                                <p className="text-sm font-semibold text-foreground mb-2">Ended At</p>
                                <p className="text-sm text-muted-foreground">{formatDate(selectedSession.ended_at)}</p>
                              </div>
                            )}
                            {selectedSession.last_updated && (
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2">Last Updated</p>
                                <p className="text-sm text-muted-foreground">{formatDate(selectedSession.last_updated)}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </CardContent>
                    </Tabs>
                  </Card>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}