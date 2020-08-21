import React, { useEffect, useRef, useState } from "react";

import "./index.css";

const Index = () => {
  const userVideo = useRef();
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        console.log(stream);
      });
  }, []);
  return (
    <div className="videosContainer">
      <video className="userVideo" muted ref={userVideo} autoPlay playsInline />
    </div>
  );
};

export default Index;
