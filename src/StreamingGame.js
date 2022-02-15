import React, { useState, useEffect } from "react";
import { StreamingController } from "streaming-view-sdk";
import StreamingView from "./appland/StreamingView";
import LauncherEdgeNode from "./LauncherEdgeNode";

const STREAM_ENDPOINT = "https://streaming-api.appland-stream.com";

const StreamingGame = () => {
  const [edgeNodeId, setEdgeNodeId] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  const gameSessionId = "75c1954d-e4d3-4558-b9ce-5d47cfdc8441";
  const appId = "152144";
  const gameMomentId = "5e8d52f1-707a-497f-8388-f26da8850f78";

  const onStreamEvent = async (event, payload) => {
    if (event === StreamingController.EVENT_STREAM_READY) {
      console.log("stream ready");
      resumeStream();
    } else if (event === "stream-video-can-play") {
      resumeStream();
    } else if (event === "moment-detector-event") {
      const payloadParsed = JSON.parse(payload.payload);
      let currentScore;
      switch (payloadParsed?.event_type) {
        case "score":
          currentScore = Math.floor(payloadParsed?.data?.score);
          if (currentScore) {
            console.log(currentScore);
          }
          break;
        case "calculate":
          console.log("calculating score");
          break;
        case "final_score":
          break;
        default:
          break;
      }
    }
  };

  const resumeStream = async () => {
    const streamController = await StreamingController({
      apiEndpoint: STREAM_ENDPOINT,
      edgeNodeId: edgeNodeId,
    });
    await streamController.resume();
  };

  const pauseStream = async () => {
    const streamController = await StreamingController({
      apiEndpoint: STREAM_ENDPOINT,
      edgeNodeId: edgeNodeId,
    });
    await streamController.pause();
  };

  const RSA_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;

  const createStream = async () => {
    const edgeNodeId = await LauncherEdgeNode.launch({
      user: "ff083666-0adb-4011-bb13-353aef87695f",
      gameSessionSource: "moment-creation-admin-ui",
      region: "us-east-1",
      continueGame: "false",
      store: "STEALTH01",
      issuer: "rob0",
      key: RSA_PRIVATE_KEY,
      host: STREAM_ENDPOINT,
      appId: appId,
      gameSessionId: gameSessionId,
      gameMomentId: gameMomentId,
    });
    setEdgeNodeId(edgeNodeId);
  };

  useEffect(() => {
    isStarted && createStream();
  }, [isStarted]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        height: "100vh",
        background: "#000",
      }}
    >
      {!isStarted && (
        <button
          style={{
            height: 40,
            width: 120,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => setIsStarted(true)}
        >
          Start Stream
        </button>
      )}
      {edgeNodeId && isStarted && (
        <StreamingView
          key={gameSessionId}
          userClickedPlayAt={new Date().getTime()}
          apiEndpoint={STREAM_ENDPOINT}
          edgeNodeId={edgeNodeId}
          enableControl={true}
          enableDebug={false}
          enableFullScreen={false}
          muted={false}
          volume={0.5}
          onEvent={(evt, payload) => onStreamEvent(evt, payload)}
        ></StreamingView>
      )}
    </div>
  );
};

export default StreamingGame;
