"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Phone, Clock, CheckCircle2, User, AlertCircle, ChevronDown, ChevronUp, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { dashboardAPI } from "@/lib/api-client"

export default function SummaryPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [responseData, setResponseData] = useState(null)
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const sanitizePhoneNumber = (value) => {
    return value.replace(/[^0-9]/g, "")
  }

  const handlePhoneNumberChange = (e) => {
    const sanitized = sanitizePhoneNumber(e.target.value)
    const limited = sanitized.slice(0, 11)
    setPhoneNumber(limited)
  }

  const formatUSPhoneNumber = (sanitized) => {
    let digits = sanitized.replace(/^1/, "")
    if (digits.length > 10) {
      digits = digits.slice(0, 10)
    }
    return digits.length === 10 ? `1${digits}` : null
  }

  const fetchConversations = async (formattedNumber, page) => {
    setLoading(true)
    setError(null)
    setExpandedSessionId(null)

    try {
      const data = await dashboardAPI.getConversation(formattedNumber, page, pageSize)
      console.log("API Response:", data)

      if (data && data.conversations && data.conversations.length > 0) {
        // Sort conversations by created_at in descending order (newest first)
        const sortedConversations = data.conversations.sort((a, b) => {
          const dateA = new Date(a.created_at)
          const dateB = new Date(b.created_at)
          return dateB - dateA // Descending order
        })
        
        const sortedData = { ...data, conversations: sortedConversations }
        setResponseData(sortedData)
        setExpandedSessionId(sortedConversations[0].session_id)
      } else {
        setError("No conversations found for this phone number")
        setResponseData(null)
      }
    } catch (err) {
      setError(err.message || "Failed to fetch conversation. Please check the phone number and try again.")
      setResponseData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchSummary = async () => {
    const sanitized = sanitizePhoneNumber(phoneNumber)
    const formattedNumber = formatUSPhoneNumber(sanitized)

    if (!formattedNumber) {
      setError("Please enter a valid 10-digit US phone number")
      return
    }

    setCurrentPage(1)
    await fetchConversations(formattedNumber, 1)
  }

  const toggleSession = (sessionId) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId)
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
    const date = new Date(dateString)
    // Format in CST without timezone conversion
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Chicago"
    })
  }

  const formatActionItem = (item) => {
    if (typeof item === "string") return item
    if (typeof item === "object" && item.who && item.what) {
      return `${item.who}: ${item.what}`
    }
    return JSON.stringify(item)
  }

  const formatIntent = (intent) => {
    if (!intent) return "N/A"
    const match = intent.match(/\(([^)]+)\)/)
    if (match) {
      return match[1]
    }
    return intent
  }

  const extractSummaryText = (summaryObj) => {
    if (typeof summaryObj === 'string') return summaryObj
    if (summaryObj && summaryObj.summary) return summaryObj.summary
    return "No summary available"
  }

  const extractMetadataFromSummary = (summaryObj) => {
    if (typeof summaryObj === 'string') return {}
    if (!summaryObj) return {}
    const { summary, ...metadata } = summaryObj
    return metadata
  }

  const renderMetadataValue = (key, value) => {
    if (key === "action_items") {
      if (!Array.isArray(value) || value.length === 0) {
        return <p className="text-sm text-muted-foreground">No action items</p>
      }
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="text-sm text-muted-foreground">
              {formatActionItem(item)}
            </li>
          ))}
        </ul>
      )
    }

    if (key === "intent") {
      return <p className="text-sm text-muted-foreground">{formatIntent(value)}</p>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <p className="text-sm text-muted-foreground">None</p>
      }
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="text-sm text-muted-foreground">
              {typeof item === "object" ? JSON.stringify(item) : item}
            </li>
          ))}
        </ul>
      )
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className="pl-4 space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <span className="text-sm font-medium">{subKey}: </span>
              <span className="text-sm text-muted-foreground">{String(subValue)}</span>
            </div>
          ))}
        </div>
      )
    }

    return <p className="text-sm text-muted-foreground">{String(value)}</p>
  }

  const renderSessionDetails = (session) => {
    const parsedSummary = parseSummary(session.summary)
    const summaryText = extractSummaryText(parsedSummary)
    const metadataFromSummary = extractMetadataFromSummary(parsedSummary)

    return (
      <div className="space-y-6 px-4 pb-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-semibold">{session.mobile_number}</p>
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
                  <p className="text-sm font-semibold">{formatDate(session.created_at)}</p>
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
                  <p className="text-sm font-semibold capitalize">{session.status || "completed"}</p>
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
                  <p className="text-xs font-mono">{session.session_id?.slice(0, 13) || "N/A"}...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <Tabs defaultValue="conversation" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="conversation">Conversation & Summary</TabsTrigger>
                <TabsTrigger value="calldata">Call Data</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="conversation" className="mt-0">
                <div className="space-y-6">
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Summary</h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {summaryText}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3">Conversation</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {session.conversation && session.conversation.length > 0 ? (
                        session.conversation.map((msg, index) => {
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
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calldata" className="mt-0">
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {session.metadata && (
                    <>
                      <div className="border-b border-border pb-4">
                        <p className="text-sm font-semibold text-foreground mb-2">Call SID</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {session.metadata.call_sid || "N/A"}
                        </p>
                      </div>
                      <div className="border-b border-border pb-4">
                        <p className="text-sm font-semibold text-foreground mb-2">From</p>
                        <p className="text-sm text-muted-foreground">{session.metadata.from || "N/A"}</p>
                      </div>
                      <div className="border-b border-border pb-4">
                        <p className="text-sm font-semibold text-foreground mb-2">To</p>
                        <p className="text-sm text-muted-foreground">{session.metadata.to || "N/A"}</p>
                      </div>
                    </>
                  )}
                  {session.summary_generated_at && (
                    <div className="border-b border-border pb-4">
                      <p className="text-sm font-semibold text-foreground mb-2">Summary Generated At</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.summary_generated_at)}
                      </p>
                    </div>
                  )}
                  {session.ended_at && (
                    <div className="border-b border-border pb-4">
                      <p className="text-sm font-semibold text-foreground mb-2">Ended At</p>
                      <p className="text-sm text-muted-foreground">{formatDate(session.ended_at)}</p>
                    </div>
                  )}
                  {session.last_updated && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Last Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(session.last_updated)}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    )
  }

  const goToNextPage = async () => {
    if (currentPage < responseData.total_pages) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      const sanitized = sanitizePhoneNumber(phoneNumber)
      const formattedNumber = formatUSPhoneNumber(sanitized)
      await fetchConversations(formattedNumber, nextPage)
    }
  }

  const goToPreviousPage = async () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      const sanitized = sanitizePhoneNumber(phoneNumber)
      const formattedNumber = formatUSPhoneNumber(sanitized)
      await fetchConversations(formattedNumber, prevPage)
    }
  }

  const goToPage = async (page) => {
    setCurrentPage(page)
    const sanitized = sanitizePhoneNumber(phoneNumber)
    const formattedNumber = formatUSPhoneNumber(sanitized)
    await fetchConversations(formattedNumber, page)
  }

  const getPageNumbers = () => {
    if (!responseData) return []

    const totalPages = responseData.total_pages
    const pages = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
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
                  placeholder="Enter phone number (e.g., 2182063791 or (218) 206-3791)"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchSummary()}
                  className="flex-1"
                />
                <Button onClick={handleFetchSummary} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Loading..." : "Fetch Summary"}
                </Button>
              </div>
              {phoneNumber && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Sanitized number: {phoneNumber}
                </p>
              )}
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

          {responseData && responseData.conversations && responseData.conversations.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Call History ({responseData.total})</CardTitle>
                    <CardDescription>
                      Showing page {responseData.page} of {responseData.total_pages} ({responseData.conversations.length} calls on this page)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {responseData.conversations.map((conv, index) => {
                      const isExpanded = expandedSessionId === conv.session_id
                      const callNumber = responseData.total - ((currentPage - 1) * pageSize + index)

                      return (
                        <div key={conv.session_id} className="transition-all duration-200">
                          <button
                            onClick={() => toggleSession(conv.session_id)}
                            className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isExpanded ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                                  }`}>
                                  <MessageSquare className="w-5 h-5" />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="font-semibold text-sm">
                                      Call {callNumber}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(conv.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {conv.conversation?.length || 0} messages
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-4">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-border bg-muted/30 animate-in slide-in-from-top-2 duration-300">
                              {renderSessionDetails(conv)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                {responseData.total_pages > 1 && (
                  <div className="border-t border-border p-4">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-2">
                        {getPageNumbers().map((pageNum, idx) => {
                          if (pageNum === '...') {
                            return (
                              <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            )
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              disabled={loading}
                              className="w-9 h-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === responseData.total_pages || loading}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Page {currentPage} of {responseData.total_pages} • Total: {responseData.total} calls
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}