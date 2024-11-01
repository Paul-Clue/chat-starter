import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SidebarGroupAction } from '@/components/ui/sidebar';
import { PlusIcon } from '@radix-ui/react-icons';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';

export function NewDirectMessage() {
  const [open, setOpen] = useState(false);
  const createDirectMessage = useMutation(api.functions.dm.create);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = e.currentTarget.username.value;
    const id = await createDirectMessage({ username });

    if (id === 'No') {
      toast.error('You cannot create a direct message to yourself');
      return;
    }

    try {
      // const username = e.currentTarget.username.value;
      // const id = await createDirectMessage({ username });
      router.push(`/dashboard/dm/${id}`);
      setOpen(false);
      router.push(`/dms/${id}`);
    } catch (error) {
      toast.error('Failed to create direct message', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
          <span className='sr-only'>New Direct Message</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
          <DialogDescription>
            Enter a username to start a direct message.
          </DialogDescription>
        </DialogHeader>
        <form className='contents' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='username'>Username</Label>
            <Input id='username' type='text' />
          </div>
          <DialogFooter>
            <Button>Start Direct Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
