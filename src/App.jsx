import { useState, useEffect } from "react";
import "./App.css";

const ws = new WebSocket(`ws://${import.meta.env.VITE_URL_SOCKET}/cable`);

function App() {
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const messagesContainer = document.getElementById("messages");

  ws.onopen = () => {
    console.log("Connected to websocket server");
    setUserName(Math.random().toString(36).substring(2, 15));

    ws.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          id: userName,
          channel: "MessagesChannel",
        }),
      })
    );
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "ping") return;
    if (data.type === "welcome") return;
    if (data.type === "confirm_subscription") return;

    const message = data.message;
    setMessagesAndScrollDown([...messages, message]);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    resetScroll();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value;
    e.target.message.value = "";

    await fetch(`http://${import.meta.env.VITE_URL_SOCKET}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
      }),
    });
  };

  const fetchMessages = async () => {
    const response = await fetch(`http://${import.meta.env.VITE_URL_SOCKET}/messages`);
    const data = await response.json();
    setMessages(data);
    setMessagesAndScrollDown(data);
  };

  const setMessagesAndScrollDown = (data) => {
    setMessages(data);
    resetScroll();
  };

  const resetScroll = () => {
    if (!messagesContainer) return;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  return (
    <div className="App" >
      <div className="messageHeader">
        <h1>Chat App</h1>
        <p>Username : {userName}</p>
      </div>
      <div className="messages" id="messages">
        {messages.map((message) => (
          <div className="message" key={message.id}>
            <p className="dataMessage">{message.body}</p>
          </div>
        ))}
      </div>
      <div className="messageForm">
        <form className="formSubmit" onSubmit={handleSubmit}>
          <input className="messageInput" type="text" name="message" />
          <button className="messageButton" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
