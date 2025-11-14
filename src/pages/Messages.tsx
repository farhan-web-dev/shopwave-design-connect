import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Phone, Info, Paperclip, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BASE_URL } from "@/lib/url";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/router";

interface BackendParticipant {
  _id: string;
  id: string;
  name: string;
  email: string;
}

interface BackendConversation {
  _id: string;
  participants: BackendParticipant[]; // [sender, receiver]
  productId?: { _id: string; title: string; price: number } | null;
  orderId?: string | null;
  messages?: BackendMessage[];
  createdAt?: string;
  updatedAt?: string;
}

interface BackendMessage {
  _id: string;
  sender: string | { _id: string };
  receiver?: string | { _id: string };
  content: string;
  attachments?: Array<
    | string
    | {
        url?: string;
        name?: string;
        type?: string;
      }
  >;
  isRead?: boolean;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UnreadCountRow {
  conversationId: string;
  count: number;
}

type UnreadCountsResponse =
  | { counts?: UnreadCountRow[] }
  | { unreadCounts?: Record<string, number> }
  | Record<string, number>;

const Messages = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const sellerIdFromUrl = searchParams.get("sellerId");
  const navigate = useNavigate();

  const currentUserId = user?.id;
  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const [messageText, setMessageText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);

  // Fetch seller details when sellerId is provided
  const { data: sellerData } = useQuery({
    queryKey: ["seller", sellerIdFromUrl],
    enabled: !!sellerIdFromUrl && !!token,
    queryFn: async () => {
      if (!sellerIdFromUrl) return null;
      try {
        const res = await fetch(`${BASE_URL}/api/v1/users/${sellerIdFromUrl}`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        });
        if (res.ok) {
          const json = await res.json();
          return json.data || json;
        }
        return null;
      } catch (error) {
        console.warn("Failed to fetch seller details:", error);
        return null;
      }
    },
  });

  // Conversations list
  const { data: conversationsData, isLoading: isConversationsLoading } =
    useQuery<{ conversations: BackendConversation[] | undefined }>({
      queryKey: ["conversations"],
      enabled: !!token,
      queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/v1/conversations`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        });
        const json = await res.json();
        return json.data || json;
      },
    });

  // Unread counts for the current user across conversations
  const { data: unreadCountsData } = useQuery<UnreadCountsResponse>({
    queryKey: ["unread-counts", currentUserId],
    enabled: !!token && !!currentUserId,
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/api/v1/conversations/unread-counts?userId=${currentUserId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        }
      );
      const json = await res.json();
      return (json.data || json) as UnreadCountsResponse;
    },
  });

  const unreadByConversationId = useMemo(() => {
    const output: Record<string, number> = {};
    const data = unreadCountsData as UnreadCountsResponse | undefined;
    if (!data) return output;
    if (Array.isArray((data as { counts?: UnreadCountRow[] }).counts)) {
      for (const row of (data as { counts?: UnreadCountRow[] })
        .counts as UnreadCountRow[]) {
        if (row?.conversationId)
          output[row.conversationId] = Number(row.count || 0);
      }
    } else if (typeof data === "object") {
      const maybeMap = (data as { unreadCounts?: Record<string, number> })
        .unreadCounts;
      if (maybeMap && typeof maybeMap === "object") {
        for (const key of Object.keys(maybeMap)) {
          const val = maybeMap[key];
          if (typeof val === "number") output[key] = val;
        }
      } else {
        for (const key of Object.keys(data as Record<string, number>)) {
          const val = (data as Record<string, number>)[key];
          if (typeof val === "number") output[key] = val;
        }
      }
    }
    return output;
  }, [unreadCountsData]);

  // Sidebar users: show the other participant (not the current user)
  const sidebarSenders = useMemo(() => {
    const list = conversationsData?.conversations || [];
    const entries = list
      .map((c) => {
        const participants = c.participants || [];
        const currentId = currentUserId;
        const normalizeId = (p?: BackendParticipant | null) =>
          p ? p.id || p._id : undefined;
        const otherParticipant = participants.find(
          (p) => normalizeId(p) && normalizeId(p) !== currentId
        );
        const selfParticipant = participants.find(
          (p) => normalizeId(p) === currentId
        );
        return {
          conversationId: c._id,
          sender: otherParticipant as unknown as BackendParticipant,
          receiver: selfParticipant as unknown as BackendParticipant,
          lastMessage:
            c.messages && c.messages.length > 0
              ? c.messages[c.messages.length - 1]
              : undefined,
          updatedAt: c.updatedAt,
        };
      })
      .filter((x) => x.sender && x.receiver);

    // Deduplicate by other participant id (sender)
    const bySenderId = new Map<string, (typeof entries)[number]>();
    for (const item of entries) {
      const sid =
        (item.sender as unknown as { id?: string; _id?: string }).id ||
        (item.sender as unknown as { id?: string; _id?: string })._id;
      if (!sid) continue;
      const existing = bySenderId.get(sid);
      if (!existing) {
        bySenderId.set(sid, item);
      } else {
        const a = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
        const b = existing.updatedAt
          ? new Date(existing.updatedAt).getTime()
          : 0;
        if (a > b) bySenderId.set(sid, item);
      }
    }

    const deduped = Array.from(bySenderId.values()).sort((a, b) => {
      const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bt - at;
    });

    // If sellerId is provided in URL and not found in conversations, add a placeholder
    if (
      sellerIdFromUrl &&
      !deduped.find(
        (item) => (item.sender.id || item.sender._id) === sellerIdFromUrl
      )
    ) {
      const sellerPlaceholder = {
        conversationId: `placeholder-${sellerIdFromUrl}`,
        sender: {
          _id: sellerIdFromUrl,
          id: sellerIdFromUrl,
          name: sellerData?.name || sellerData?.username || "Seller",
          email: sellerData?.email || "seller@example.com",
        } as BackendParticipant,
        receiver: {
          _id: currentUserId || "",
          id: currentUserId || "",
          name: user?.name || "You",
          email: user?.email || "",
        } as BackendParticipant,
        lastMessage: undefined,
        updatedAt: new Date().toISOString(),
      };
      deduped.unshift(sellerPlaceholder);
    }

    return deduped;
  }, [conversationsData, currentUserId, sellerIdFromUrl, user, sellerData]);

  // Currently selected conversation id (based on selected other participant)
  const selectedConversationId = useMemo(() => {
    if (!selectedSenderId) return undefined;
    const entry = sidebarSenders?.find(
      (x) => (x.sender.id || x.sender._id) === selectedSenderId
    );
    return entry?.conversationId;
  }, [sidebarSenders, selectedSenderId]);

  // Messages for selected pair
  const {
    data: threadMessages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useQuery<BackendMessage[]>({
    queryKey: [
      "messages",
      selectedConversationId,
      selectedSenderId,
      currentUserId,
    ],
    enabled:
      !!token &&
      (!!selectedConversationId || (!!selectedSenderId && !!currentUserId)),
    queryFn: async () => {
      // Try by conversation id first
      if (selectedConversationId) {
        try {
          const byIdRes = await fetch(
            `${BASE_URL}/api/v1/conversations/${selectedConversationId}/messages`,
            {
              headers: {
                "Content-Type": "application/json",
                ...authHeader,
              },
            }
          );
          if (byIdRes.ok) {
            const byIdJson = await byIdRes.json();
            const byIdMsgs =
              (byIdJson.data &&
                (byIdJson.data.messages ||
                  byIdJson.data.conversation?.messages)) ||
              byIdJson.messages ||
              byIdJson.conversation?.messages ||
              [];
            if (Array.isArray(byIdMsgs) && byIdMsgs.length >= 0) {
              return byIdMsgs as BackendMessage[];
            }
          }
        } catch (e) {
          console.warn(
            "Failed fetching messages by conversation id, will try sender/receiver",
            e
          );
        }
      }

      // Fallback by sender/receiver pair
      if (selectedSenderId && currentUserId) {
        const sender = selectedSenderId as string;
        const receiver = currentUserId as string;
        const res = await fetch(
          `${BASE_URL}/api/v1/conversations/${sender}/${receiver}/messages`,
          {
            headers: {
              "Content-Type": "application/json",
              ...authHeader,
            },
          }
        );
        const json = await res.json();
        const msgs = (json.data && json.data.messages) || json.messages || [];
        return msgs as BackendMessage[];
      }

      return [];
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (vars: { content: string; attachments: File[] }) => {
      if (!selectedSenderId || !currentUserId) return;
      const form = new FormData();
      form.append("receiverId", selectedSenderId);
      form.append("content", vars.content);
      (vars.attachments || []).forEach((file) => {
        form.append("attachments", file);
      });

      await fetch(`${BASE_URL}/api/v1/conversations`, {
        method: "POST",
        headers: {
          ...authHeader,
        },
        body: form,
      });
    },
    onSuccess: () => {
      setMessageText("");
      setPendingAttachments([]);
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Send message function
  const handleSendMessage = useCallback(() => {
    if (!messageText.trim() && pendingAttachments.length === 0) return;
    sendMessageMutation.mutate({
      content: messageText.trim(),
      attachments: pendingAttachments,
    });
  }, [messageText, pendingAttachments, sendMessageMutation]);

  // Mark selected conversation as read
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversationId) return;
      await fetch(
        `${BASE_URL}/api/v1/conversations/${selectedConversationId}/mark-read`,
        {
          method: "PATCH",
          headers: {
            ...authHeader,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: ["unread-counts", currentUserId],
        });
      }
    },
  });

  // Selected sender
  useEffect(() => {
    if (!selectedSenderId && sidebarSenders && sidebarSenders.length > 0) {
      // If sellerId is provided in URL, try to find that seller first
      if (sellerIdFromUrl) {
        const sellerConversation = sidebarSenders.find(
          (sender) =>
            (sender.sender.id || sender.sender._id) === sellerIdFromUrl
        );
        if (sellerConversation) {
          setSelectedSenderId(
            sellerConversation.sender.id || sellerConversation.sender._id
          );
          return;
        }
      }
      // // Fallback to first conversation
      // setSelectedSenderId(
      //   sidebarSenders[0].sender.id || sidebarSenders[0].sender._id
      // );
    }
  }, [sidebarSenders, selectedSenderId, sellerIdFromUrl]);

  // Send initial message when starting a new conversation with seller from URL
  useEffect(() => {
    if (
      sellerIdFromUrl &&
      selectedSenderId === sellerIdFromUrl &&
      !hasSentInitialMessage &&
      (!threadMessages || threadMessages.length === 0)
    ) {
      const initialMessage =
        "Hi! I'm interested in your product. Can you tell me more about it?";
      setMessageText(initialMessage);
      setHasSentInitialMessage(true);

      // Auto-send the initial message after a short delay
      setTimeout(() => {
        if (messageText === initialMessage) {
          handleSendMessage();
        }
      }, 1000);
    }
  }, [
    sellerIdFromUrl,
    selectedSenderId,
    hasSentInitialMessage,
    threadMessages,
    messageText,
    handleSendMessage,
  ]);

  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingAttachments((prev) => [...prev, ...files]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedSender = useMemo(() => {
    if (!selectedSenderId) return null;
    return sidebarSenders?.find(
      (x) =>
        x.sender.id === selectedSenderId || x.sender._id === selectedSenderId
    );
  }, [sidebarSenders, selectedSenderId]);

  const displayMessages = useMemo(() => {
    const msgs = threadMessages || [];
    return msgs.map((m) => {
      const senderId = typeof m.sender === "string" ? m.sender : m.sender?._id;
      const ts = m.timestamp || m.createdAt || m.updatedAt;
      return {
        id: m._id,
        isFromUser: senderId === currentUserId,
        text: m.content,
        timestamp: ts
          ? new Date(ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        attachments: m.attachments || [],
      } as {
        id: string;
        isFromUser: boolean;
        text: string;
        timestamp: string;
        attachments: BackendMessage["attachments"];
      };
    });
  }, [threadMessages, currentUserId]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          </div>

          {/* ✅ Mobile View: show conversations or chat conditionally */}
          <div className="lg:hidden">
            {!selectedSender ? (
              // 📱 Show conversation list on mobile
              <Card>
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">
                      {(sidebarSenders || []).map((item) => {
                        const senderId = item.sender.id || item.sender._id;
                        const name = item.conversationId?.startsWith(
                          "placeholder-"
                        )
                          ? item.receiver.name || "Unknown"
                          : item.sender.name || "Unknown";
                        const lastText = item.lastMessage?.content || "";
                        const time = item.updatedAt
                          ? new Date(item.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";
                        const unreadCount =
                          unreadByConversationId[item.conversationId] ||
                          unreadByConversationId[senderId] ||
                          0;
                        return (
                          <div
                            key={item.conversationId || senderId}
                            className="p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                            onClick={() => setSelectedSenderId(senderId)}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={undefined as unknown as string}
                                />
                                <AvatarFallback>
                                  {name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {time}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-sm text-gray-600 truncate flex-1 min-w-0">
                                    {lastText.split("").slice(0, 30).join("")}
                                    ...
                                  </p>
                                  {unreadCount > 0 && (
                                    <Badge className="bg-blue-600 text-white text-xs">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              // 📱 Show chat view
              <Card className="flex flex-col">
                <CardHeader className="border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSenderId(null)}
                      className="mr-2"
                    >
                      ←
                    </Button>
                    <Avatar
                      className="h-10 w-10 cursor-pointer"
                      onClick={() =>
                        navigate(`/seller/${selectedSender.receiver.id}`)
                      }
                    >
                      <AvatarImage src={undefined as unknown as string} />
                      <AvatarFallback>
                        {(selectedSender.conversationId?.startsWith(
                          "placeholder-"
                        )
                          ? selectedSender.receiver.name
                          : selectedSender.sender.name
                        )
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">
                        {selectedSender.conversationId?.startsWith(
                          "placeholder-"
                        )
                          ? selectedSender.receiver.name
                          : selectedSender.sender.name}
                      </h3>
                      <p className="text-xs text-green-600">Online</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {displayMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.isFromUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-lg ${
                              message.isFromUser
                                ? "bg-blue-100 text-gray-900"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                <div className="border-t border-gray-200 p-3">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFilesSelected}
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePickFiles}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        !messageText.trim() && pendingAttachments.length === 0
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* ✅ Desktop View */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-[600px]">
            {/* Sidebar */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-1">
                    {(sidebarSenders || []).map((item) => {
                      const senderId = item.sender.id || item.sender._id;
                      const name = item.conversationId?.startsWith(
                        "placeholder-"
                      )
                        ? item.receiver.name || "Unknown"
                        : item.sender.name || "Unknown";
                      const lastText = item.lastMessage?.content || "";
                      const time = item.updatedAt
                        ? new Date(item.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";
                      const unreadCount =
                        unreadByConversationId[item.conversationId] ||
                        unreadByConversationId[senderId] ||
                        0;
                      const isActive = selectedSenderId === senderId;

                      return (
                        <div
                          key={item.conversationId || senderId}
                          className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                            isActive ? "bg-gray-100" : ""
                          }`}
                          onClick={() => setSelectedSenderId(senderId)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={undefined as unknown as string}
                              />
                              <AvatarFallback>
                                {name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              {/* Top row: name + time */}
                              <div className="flex items-center justify-between space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[70%]">
                                  {name}
                                </p>
                                <p className="text-xs text-gray-500 flex-shrink-0">
                                  {time}
                                </p>
                              </div>

                              {/* Bottom row: last message + badge */}
                              <div className="flex items-center justify-between mt-1 space-x-2">
                                <p className="text-sm text-gray-600 truncate flex-1 min-w-0">
                                  {lastText.split("").slice(0, 40).join("")}...
                                </p>
                                {unreadCount > 0 && (
                                  <Badge className="bg-blue-600 text-white text-xs flex-shrink-0">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="col-span-2 flex flex-col">
              {selectedSender ? (
                <>
                  <CardHeader className="border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          className="h-10 w-10 cursor-pointer"
                          onClick={() =>
                            navigate(`/seller/${selectedSender.receiver.id}`)
                          }
                        >
                          <AvatarImage src={undefined as unknown as string} />
                          <AvatarFallback>
                            {(selectedSender.conversationId?.startsWith(
                              "placeholder-"
                            )
                              ? selectedSender.receiver.name
                              : selectedSender.sender.name
                            )
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {selectedSender.conversationId?.startsWith(
                              "placeholder-"
                            )
                              ? selectedSender.receiver.name
                              : selectedSender.sender.name}
                          </h3>
                          <p className="text-sm text-green-600">Online</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {displayMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.isFromUser
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.isFromUser
                                  ? "bg-blue-100 text-gray-900"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFilesSelected}
                        className="hidden"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePickFiles}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type your message here..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !messageText.trim() && pendingAttachments.length === 0
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
