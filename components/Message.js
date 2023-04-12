import React from "react";
import {
  CodeBracketSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

function Message({ chat }) {
  return (
    <>
      <div
        className={`flex text-left p-2 ${
          chat.user === "user" ? "bg-slate-200" : "bg-slate-50"
        }`}
      >
        {chat.user === "user" ? (
          <UserCircleIcon className="h-7 w-7 mx-1" />
        ) : (
          <CodeBracketSquareIcon className="h-7 w-7 mx-1" />
        )}
        <p className="text-lg w-full">{chat.message}</p>
      </div>
    </>
  );
}

export default Message;
