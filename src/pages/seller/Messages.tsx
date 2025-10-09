import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Phone, Info, Paperclip, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  type?: "text" | "file" | "image";
  fileInfo?: {
    name: string;
    size: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState("alice");
  const [messageText, setMessageText] = useState("");

  const [conversations] = useState<Conversation[]>([
    {
      id: "alice",
      name: "Alice Johnson",
      lastMessage:
        "Thank you for the quick response! I'll place the order now.",
      timestamp: "11:30 AM",
      unreadCount: 2,
    },
    {
      id: "bob",
      name: "Bob Williams",
      lastMessage: "When will the product be back in stock?",
      timestamp: "Yesterday",
      unreadCount: 0,
    },
    {
      id: "catherine",
      name: "Catherine Lee",
      lastMessage: "The quality looks amazing! Do you have other colors?",
      timestamp: "Mar 28",
      unreadCount: 1,
    },
  ]);

  const [messages] = useState<{ [key: string]: Message[] }>({
    alice: [
      {
        id: "1",
        text: "Hello! I am interested in your custom-made jewelry. Can I get more details on the materials used?",
        timestamp: "10:05 AM",
        isFromUser: false,
      },
      {
        id: "2",
        text: "Absolutely, Alice! We primarily use ethically sourced 14k gold and sterling silver, with conflict-free gemstones. Would you like a detailed catalog?",
        timestamp: "10:15 AM",
        isFromUser: true,
      },
      {
        id: "3",
        text: "Yes, that would be perfect! Can you also tell me about your customization options?",
        timestamp: "10:25 AM",
        isFromUser: false,
      },
      {
        id: "4",
        text: "I've attached our jewelry catalog with all the customization options available. We offer engraving, stone selection, and metal variations.",
        timestamp: "11:20 AM",
        isFromUser: true,
        type: "file",
        fileInfo: {
          name: "Jewelry_Catalog_2024.pdf",
          size: "5.2 MB",
        },
      },
      {
        id: "5",
        text: "Here's an example of our recent custom work - a gold ring with diamond accent.",
        timestamp: "11:25 AM",
        isFromUser: true,
        type: "image",
      },
      {
        id: "6",
        text: "Thank you for the quick response! I'll place the order now.",
        timestamp: "11:30 AM",
        isFromUser: false,
      },
    ],
  });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
      // Implement message sending logic
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedMessages = messages[selectedConversation] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation === conversation.id
                        ? "bg-gray-100"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>
                          {conversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conversation.timestamp}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation && (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {conversations
                          .find((c) => c.id === selectedConversation)
                          ?.name.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.name
                        }
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

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {selectedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.isFromUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromUser
                              ? "bg-amber-100 text-gray-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {message.type === "file" && message.fileInfo && (
                            <div className="mb-2 p-2 bg-white rounded border">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="h-4 w-4" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {message.fileInfo.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {message.fileInfo.size}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {message.type === "image" && (
                            <div className="mb-2">
                              <div className="h-32 w-32 bg-gray-200 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  Image Preview
                                </span>
                              </div>
                            </div>
                          )}
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

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
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
                    disabled={!messageText.trim()}
                    className="bg-amber-700 hover:bg-amber-800 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
