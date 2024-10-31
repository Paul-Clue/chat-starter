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

export function NewDirectMessage() {
  return (
    <Dialog>
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
        <form className='contents'>
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
