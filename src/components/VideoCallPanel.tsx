
import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoCallPanel() {
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShared, setScreenShared] = useState(false);
  const [callActive, setCallActive] = useState(true);

  const handleMute = () => setMuted((v) => !v);
  const handleCam = () => setCameraOn((v) => !v);
  const handleScreenShare = () => setScreenShared((v) => !v);
  const handleEndCall = () => setCallActive(false);

  if (!callActive)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="font-semibold text-2xl text-muted-foreground mb-2">Call Ended</div>
        <Button onClick={() => setCallActive(true)} size="sm" className="mt-2">Rejoin</Button>
      </div>
    );

  return (
    <div className="relative bg-black/95 rounded-lg flex flex-col justify-between h-[340px] w-full items-center overflow-hidden ring-2 ring-primary/10 shadow-inner">
      <div className="flex-1 flex items-center justify-center">
        {/* Video stream placeholder */}
        {cameraOn ? (
          <div className="w-[180px] h-[130px] bg-gray-900 rounded-lg border-2 border-primary flex items-center justify-center text-6xl text-primary">
            {muted ? <MicOff size={48}/> : <Mic size={48}/>}
          </div>
        ) : (
          <div className="w-[180px] h-[130px] bg-muted rounded-lg flex flex-col items-center justify-center text-3xl text-muted-foreground">Camera Off</div>
        )}
        {screenShared && (
          <div className="absolute z-20 bottom-24 left-1/2 -translate-x-1/2 bg-yellow-400 text-black rounded-md px-3 py-1 text-sm shadow">
            <span>Screen Sharing</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-6 px-4 py-3 bg-black/40 w-full shadow-inner">
        <Button
          variant={muted ? "destructive" : "ghost"}
          size="icon"
          className="rounded-full border"
          onClick={handleMute}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff /> : <Mic />}
        </Button>
        <Button
          variant={cameraOn ? "ghost" : "secondary"}
          size="icon"
          className="rounded-full border"
          onClick={handleCam}
          aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </Button>
        <Button
          variant={screenShared ? "secondary" : "ghost"}
          size="icon"
          className="rounded-full border"
          onClick={handleScreenShare}
          aria-label={screenShared ? "Stop screen share" : "Share screen"}
        >
          🖥️
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full border ml-4"
          onClick={handleEndCall}
          aria-label="End call"
        >
          &#x2716;
        </Button>
      </div>
    </div>
  );
}
