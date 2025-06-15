
import InAppChat from "@/components/InAppChat";
import VideoCallPanel from "@/components/VideoCallPanel";

const Chat = () => {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 py-2">
      <h1 className="text-2xl font-semibold mb-1">Team Chat & Video</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Chat area */}
        <div className="md:col-span-2 h-[460px] bg-card rounded-lg shadow-inner flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/20">Chat ({/* Add room name or controls here in future */})</div>
          <div className="flex-1 min-h-0">
            <InAppChat />
          </div>
        </div>
        {/* Video section */}
        <div className="h-[460px] bg-card rounded-lg shadow-inner flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/20">Video Call</div>
          <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-4">
            <VideoCallPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
