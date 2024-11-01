'use client';
import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useQuery(api.functions.user.get);
  if (!user) return null;
  return (
    <div className='flex flex-1 flex-col divide-y max-h-screen'>
      <header className='flex items-center gap-2 p-4'>
        <Avatar className='size-8 border'>
          <AvatarImage src={user.image} />
          <AvatarFallback />
        </Avatar>
        <h1 className='font-semibold'>{user.username}</h1>
      </header>
      <MessageItem />
    </div>
  );
}

function MessageItem() {
  const user = useQuery(api.functions.user.get);

  return (
    <div className='flex items-center gap-2 px-4'>
      <Avatar className='size-8 border'>
        <AvatarImage src={user!.image} />
        <AvatarFallback />
      </Avatar>
      <div className='flex flex-col'>
        <p className='text-xs text-muted-foreground'>{user!.username}</p>
        <p className='text-sm'>Hello world!</p>
      </div>
    </div>
  );
}
