import { RealTimeChat } from "@/components/RealTimeChat";
import { CrystalWelcome } from "@/components/CrystalWelcome";
import { useConversations } from "@/hooks/useConversations";
import { useState } from "react";

const Chat = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { activeConversation, startConversation } = useConversations();

  const handleStartChat = async (crushId?: string, crushName?: string) => {
    setShowWelcome(false);
    
    if (crushId) {
      await startConversation(crushId, 'crush_chat');
    } else {
      await startConversation(undefined, 'crystal_chat');
    }
  };

  const handleGeneralChat = () => {
    setShowWelcome(false);
    startConversation(undefined, 'crystal_chat');
  };

  if (showWelcome) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <CrystalWelcome 
            onStartChat={handleStartChat}
            onGeneralChat={handleGeneralChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <RealTimeChat type="crystal_chat" />
    </div>
  );
};

export default Chat;