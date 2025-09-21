import { RealTimeChat } from "@/components/RealTimeChat";

const Chat = () => {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <RealTimeChat type="crystal_chat" />
      </div>
    </div>
  );
};

export default Chat;