'use client';
import { use, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVerticalIcon, SendIcon, TrashIcon } from 'lucide-react';
import { Id } from '../../../../../convex/_generated/dataModel';
import { FunctionReturnType } from 'convex/server';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: Id<'directMessages'> }>;
}) {
  const { id } = use(params);

  const directMessage = useQuery(api.functions.dm.get, { id });

  const messages = useQuery(api.functions.message.list, {
    directMessage: id,
  });

  if (!directMessage) return null;

  return (
    <div className='flex flex-1 flex-col divide-y max-h-screen'>
      <header className='flex items-center gap-2 p-4'>
        <Avatar className='size-8 border'>
          <AvatarImage src={directMessage.user?.image} />
          <AvatarFallback />
        </Avatar>
        <h1 className='font-semibold'>{directMessage.user?.username}</h1>
      </header>
      <ScrollArea className='h-full py-4'>
        {messages?.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </ScrollArea>
      <MessageInput directMessage={id} />
    </div>
  );
}

type Message = FunctionReturnType<typeof api.functions.message.list>[number];

function MessageItem({ message }: { message: Message }) {
  return (
    <div className='flex items-center gap-2 px-4 py-2'>
      <Avatar className='size-8 border'>
        {message.sender && <AvatarImage src={message.sender.image} />}
        <AvatarFallback />
      </Avatar>
      <div className='flex flex-col mr-auto'>
        <p className='text-xs text-muted-foreground'>
          {message.sender?.username ?? 'Deleted User'}
        </p>
        <p className='text-sm'>{message.content}</p>
      </div>
      <MessageActions message={message} />
    </div>
  );
}

function MessageActions({ message }: { message: Message }) {
  const user = useQuery(api.functions.user.get);
  const removeMutation = useMutation(api.functions.message.remove);

  if (!user || message.sender?._id !== user._id) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <MoreVerticalIcon className='size-4 text-muted-foreground' />
          <span className='sr-only'>More Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className='text-destructive'
          onClick={() => removeMutation({ id: message._id })}
        >
          <TrashIcon className='size-4 mr-2' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageInput({
  directMessage,
}: {
  directMessage: Id<'directMessages'>;
}) {
  const [content, setContent] = useState('');

  const sendMessage = useMutation(api.functions.message.create);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({ directMessage, content });
      setContent('');
    } catch (error) {
      toast.error('Failed to send message', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };
  return (
    <form className='flex items-center p-4 gap-2' onSubmit={handleSubmit}>
      <Input
        placeholder='Message'
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button size='icon' type='submit'>
        <SendIcon />
        <span className='sr-only'>Send</span>
      </Button>
    </form>
  );
}
