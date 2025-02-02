import React from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ChatHistoryItem } from './ChatHistoryItem';
import UserAccountNav from './userAccountNav';
import SignInButton from './SignInButton';

interface Chat {
  id: string;
  title: string;
  input: string;
  response: string;
  createdAt: Date;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
}) => {
  const { data: session } = useSession();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900/95 border-b border-gray-800 z-50 flex items-center">
        <div className="flex items-center px-6">
          <Link href="/" className="flex items-center gap-3">
            {/* <Image
              src="/f2.webp"
              alt="logo"
              width={32}
              height={32}
              className="rounded-lg"
            /> */}
            <span className="text-2xl bg:backdrop-blur font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              fixly.ai
            </span>
          </Link>
        </div>
      </div>

      {/* Collapsible Sidebar */}
      <div className="group fixed left-0 top-16 bottom-0 w-16 hover:w-64 bg-gray-900/95 border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-all hover:scale-105 flex items-center justify-center gap-2 group-hover:justify-start"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden group-hover:inline truncate">New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                title={chat.title}
                timestamp={chat.createdAt}
                isActive={activeChat === chat.id}
                onClick={() => onSelectChat(chat)}
                className="truncate group-hover:whitespace-normal px-4 py-2 mx-2 rounded-md"
              />
            ))}
          </div>
        </div>

        {/* User Account Section */}
        <div className="mt-auto p-3 border-t border-gray-800">
          {session?.user ? (
            <div className="px-1">
              <UserAccountNav user={session.user} />
            </div>
          ) : (
            <div className="flex items-center justify-center group-hover:justify-start px-1">
              <div className="w-8 group-hover:w-full">
                <SignInButton text="Sign in" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;