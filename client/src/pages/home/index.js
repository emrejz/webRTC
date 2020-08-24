import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import CustomVideo from "./CustomVideo";

import "./index.css";

const Index = () => {
  const [peers, setPeers] = useState([]);
  const [error, setError] = useState("");
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        socketRef.current = io.connect("http://localhost:3001/");

        userVideo.current.srcObject = stream;

        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            userID != socketRef.current.id && peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          const item = peersRef.current.find(
            (p) => p.peerID === payload.callerID
          );

          if (!item) {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
            });

            setPeers((users) => [...users, peer]);
          }
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      })
      .catch((err) => {
        setError(err);
        console.log(err);
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on("error", (err) => {
      console.log(err);
      setError(err);
    });
    peer.on("close", () => {
      setPeers(peers.filter((item) => item.peer != peer));
    });
    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("error", (err) => {
      console.log(err);
      setError(err);
    });
    peer.on("close", () => {
      setPeers(peers.filter((item) => item.peer != peer));
    });
    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);
    return peer;
  }
  return (
    <div className="homeContainer">
      <div className="videosContainer">
        <video muted autoPlay playsInline ref={userVideo}></video>
        {peers.map((peer, index) => {
          return <CustomVideo key={index} peer={peer} />;
        })}
      </div>
      {peers.length == 0 && (
        <h1>At least 1 more person should come to the conference</h1>
      )}
      {error && error.message && <h1>{error.message}</h1>}
    </div>
  );
};

export default Index;
