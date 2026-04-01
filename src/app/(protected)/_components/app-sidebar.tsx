"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agendamentos", url: "/appointments", icon: CalendarDays },
  { title: "Médicos", url: "/doctors", icon: Stethoscope },
  { title: "Pacientes", url: "/patients", icon: UsersRound },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();

  type UserWithClinic = {
    email: string;
    clinic?: {
      name: string;
    };
  };

  const user = session.data?.user as UserWithClinic;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  if (session.isPending) return null;

  return (
    <Sidebar>
      <SidebarHeader className="border-b bg-gray-200 p-4">
        <Image src="/logo.svg" alt="Doutor Agenda" width={136} height={28} />
      </SidebarHeader>

      <SidebarContent className="bg-gray-50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Menu Principal
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback>
                      {user?.clinic?.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm">{user?.clinic?.name ?? "Clínica"}</p>
                    <p className="text-muted-foreground text-sm">
                      {user?.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
