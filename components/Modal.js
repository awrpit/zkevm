import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import Message from "./Message";
import { useScrollDirection } from "./useScrollDirection";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const [pending, setPending] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollDirection = useScrollDirection();
  const [response, setResponse] = useState({
    history: [],
    question: "",
    pending: "",
    pendingSourceDocs: [],
  });

  useEffect(() => {
    if (scrollDirection === "down") {
      setIsPromptVisible(false);
    } else if (scrollDirection === "up") {
      setIsPromptVisible(true);
    }
  }, [scrollDirection]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // function getResponse(chat, prompt) {
  //   const API_URL = process.env.API_URL;

  //   fetchEventSource("https://zk-gpt-production.up.railway.app/api/v1/chat", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       question: prompt,
  //       history: chat,
  //     }),
  //     onmessage: (event) => {
  //       if (event.data === "[DONE]") {
  //         // parsing is complete, no more chunks to come
  //         console.log("Parsing complete!");
  //       } else {
  //         // append the new chunk to the chat log
  //         setPending((prevPending) => prevPending + event.data);
  //         console.log(pending);
  //         setChatLog((prevChatLog) => [
  //           ...prevChatLog,
  //           {
  //             user: "gpt",
  //             message: event.data,
  //           },
  //         ]);
  //       }
  //     },
  //   });
  // }

  async function handleSubmit() {
    // const ctrl = new AbortController();
    const chats = chatLog;
    const question = search;
    setChatLog([
      ...chatLog,
      {
        user: "user",
        message: search,
      },
    ]);
    setSearch("");

    const body = JSON.stringify({
      question: prompt,
      history: chats,
    });

    try {
      let responseData = "";
      await fetchEventSource(
        "https://zk-gpt-production.up.railway.app/api/v1/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: prompt,
            history: chats,
          }),
          // signal: ctrl.signal,
          onmessage: (event) => {
            if (event.data === "[DONE]") {
              setResponse((prevState) => ({
                ...prevState,
                history: [
                  ...prevState.history,
                  [question, prevState.pending ?? ""],
                ],
              }));
              console.log("done");
              console.log(response);
              setLoading(false);
              // ctrl.abort();
            } else {
              const data = JSON.parse(event.data);
              if (data.sourceDocs) {
                setResponse((prevState) => ({
                  ...prevState,
                  pendingSourceDocs: data.sourceDocs,
                }));
              } else {
                setResponse((prevState) => ({
                  ...prevState,
                  pending: (prevState.pending ?? "") + data.data,
                }));
              }
            }
          },
        }
      );
      // onmessage: (event) => {
      //   if (event.data === "[DONE]") {
      // parsing is complete, no more chunks to come
      //     console.log("Parsing complete!");
      //     console.log(pending);
      //     setChatLog((prevChatLog) => [
      //       ...prevChatLog,
      //       {
      //         user: "gpt",
      //         message: pending,
      //       },
      //     ]);
      //     setIsLoading(false);
      //     setPending("");
      //   } else {
      //     const data = JSON.parse(event.data);
      //     if (data.sourceDocs) {
      // do something
      //     } else {
      //       console.log(data.data);
      //       setPending((prevPending) => prevPending + data.data);
      //       console.log(pending);
      //     }
      //   }
      // },
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {isPromptVisible && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 px-6 py-3 bg-cyan-400 text-white rounded-md shadow-lg cursor-pointer transition duration-300 ease-in-out hover:bg-cyan-600 w-4/5 inset-x-0 mx-auto"
        >
          Chat with the docs
        </button>
      )}
      {/* Rest of the Modal code */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 overflow-y-auto p-4 pt-[15vh]"
      >
        <Dialog.Overlay className="fixed inset-0 bg-gray-500/75" />
        <div className="relative mx-auto max-w-full rounded-xl bg-white shadow-2xl ring-1 p-2 border-cyan-600 border-t-8">
          <div className="w-full h-[65vh] bg-cyan-50 overflow-y-auto smooth-scroll">
            <h1 className="text-4xl p-4 text-center"> Welcome to the Docs </h1>
            <div className="">
              {chatLog.map((chat, index) => {
                return <Message key={index} chat={chat} />;
              })}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <input
              className="h-9 w-full border-0 bg-transparent text-xl text-gray-800 placeholder-gray-500 focus:outline-none px-2"
              placeholder="Search for your question"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => handleSubmit()}
              className="text-cyan-600 hover:text-cyan-800"
            >
              <PaperAirplaneIcon className="h-6 w-6 mx-4" />
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Modal;
