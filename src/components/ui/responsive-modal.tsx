"use client";

import * as React from "react";
import { useIsMobile } from "@/components/ui/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResponsiveModal({ children, ...props }: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Drawer {...props}>{children}</Drawer>;
  }

  return <Dialog {...props}>{children}</Dialog>;
}

export function ResponsiveModalTrigger({ children, ...props }: React.ComponentProps<typeof DialogTrigger>) {
  const isMobile = useIsMobile();
  const Trigger = isMobile ? DrawerTrigger : DialogTrigger;
  return <Trigger {...props}>{children}</Trigger>;
}

export function ResponsiveModalContent({ children, className, showCloseButton = true, ...props }: React.ComponentProps<typeof DialogContent> & { showCloseButton?: boolean }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerContent className={className} {...props}>{children}</DrawerContent>;
  }

  return <DialogContent className={className} showCloseButton={showCloseButton} {...props}>{children}</DialogContent>;
}

export function ResponsiveModalHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  const Header = isMobile ? DrawerHeader : DialogHeader;
  return <Header className={className} {...props}>{children}</Header>;
}

export function ResponsiveModalTitle({ children, className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  const isMobile = useIsMobile();
  const Title = isMobile ? DrawerTitle : DialogTitle;
  return <Title className={className} {...props}>{children}</Title>;
}

export function ResponsiveModalDescription({ children, className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  const isMobile = useIsMobile();
  const Description = isMobile ? DrawerDescription : DialogDescription;
  return <Description className={className} {...props}>{children}</Description>;
}

export function ResponsiveModalFooter({ children, className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  const Footer = isMobile ? DrawerFooter : DialogFooter;
  return <Footer className={className} {...props}>{children}</Footer>;
}

export function ResponsiveModalClose({ children, ...props }: React.ComponentProps<typeof DialogClose>) {
  const isMobile = useIsMobile();
  const Close = isMobile ? DrawerClose : DialogClose;
  return <Close {...props}>{children}</Close>;
}
