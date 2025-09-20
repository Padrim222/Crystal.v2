import { RealTimeChat } from "@/components/RealTimeChat";

const Chat = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Chat com Crystal</h1>
          <p className="text-muted-foreground">
            Converse com sua consultora pessoal de relacionamentos
          </p>
        </div>
        
        <RealTimeChat type="crystal_chat" />
      </div>
    </div>
  );
};

export default Chat;