'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RedirectToSignIn, SignOutButton } from '@clerk/nextjs';
import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { User2Icon } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../../convex/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NewDirectMessage } from './new-direct-message';
import { usePathname } from 'next/navigation';

const useTestDirectMessages = () => {
  const user = useQuery(api.functions.user.get);
  if (!user) return [];
  return [user, user, user, user, user, user, user, user];
};

export function DashboardLayout() {
  return (
    <>
      <Authenticated>
        <SidebarProvider>
          <DashboardSidebar />
          {/* <div>{children}</div> */}
        </SidebarProvider>
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}

export function DashboardSidebar() {
  const user = useQuery(api.functions.user.get);
  const directMessages = useTestDirectMessages();
  const pathname = usePathname();

  if (!user) return null;
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <Link href='/friends'>
                    <User2Icon />
                    Friends
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroup>
            <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            <NewDirectMessage />
            <SidebarMenu>
              <SidebarGroupContent>
                {directMessages.map((directMessage) => (
                  <SidebarMenuItem key={directMessage._id}>
                    <SidebarMenuButton asChild isActive={pathname === `/dms/${directMessage._id}`}>
                      <Link href={`/dms/${directMessage._id}`}>
                        <Avatar className='size-6'>
                          <AvatarImage src={directMessage.image} />
                        <AvatarFallback>
                          {directMessage.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className='font-medium'>{directMessage.username}</p>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroupContent>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className='flex items-center gap-2'>
                      <Avatar className='size-6'>
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      <p className='font-medium'>{user.username}</p>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
