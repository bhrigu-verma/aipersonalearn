"use client";

import { Companion, Message } from "@prisma/client";
import ChatHeader from "./chat-header";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import ChatForm from "./chat-form";
import ChatMessages from "./chat-messages";
import { ChatMessageProps } from "./chat-message";
import { useChat } from "@ai-sdk/react";
import axios from "axios";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
  };
}

const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [Frontmessages, setFrontMessages] = useState<ChatMessageProps[]>(
    companion.messages
  );
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  // const {
  //   messages,
  //   isLoading,
  //   input,
  //   setInput,
  //   handleInputChange,
  //   handleSubmit,
  // } = useChat({
  //   api: `/api/chat/${companion.id}`,
  //   onResponse(response: Response) {
  //     const func = async (response: Response) => {
  //       const data = await response.json();
  //       console.log(data);
  //       if (data.message) {
  //         const systemMessage: ChatMessageProps = {
  //           role: "system",
  //           content: data.message,
  //         };
  //         setFrontMessages((current) => [...current, systemMessage]);
  //       }
  //       setInput("");
  //       router.refresh();
  //     };
  //     func(response);
  //   },
  // });
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(e.currentTarget.value);
  };
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
    };
    setFrontMessages((current) => [...current, userMessage]);
    const res = await axios.post(`/api/chat/${companion.id}`, { userMessage });
    setFrontMessages((current) => [...current, res.data.message]);
    setInput("");
    setIsLoading(false);
  };
  return (
    <div className="flex flex-col h-full p-4 space-y-2 w-full relative">
      <ChatHeader companion={companion} />
      <ChatMessages
        companion={companion}
        isLoading={isLoading}
        messages={Frontmessages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handelInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default ChatClient;
