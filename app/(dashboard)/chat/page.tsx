import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Chat</h2>
        <p className="text-muted-foreground">
          Talk to your wellness AI assistant
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          AI Chat — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
