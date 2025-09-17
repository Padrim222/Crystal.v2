import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { useConversations } from "@/hooks/useConversations";
import * as React from "react";

const Chat = () => {
  const { startConversation } = useConversations();

  // Auto-start conversation when chat loads
  React.useEffect(() => {
    startConversation(undefined, 'crystal_chat');
  }, []);

  return (
    <div className="h-full w-full">
      <AnimatedAIChat />
    </div>
  );
};

export default Chat;