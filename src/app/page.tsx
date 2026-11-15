"use client";

import { useState } from "react";

import { AIGuide } from "@/components/ai-guide";
import { FeaturedDishes } from "@/components/featured-dishes";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { MenuSection } from "@/components/menu-section";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { RoomSection } from "@/components/room-section";
import { SignInPanel } from "@/components/sign-in-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TableSection } from "@/components/table-section";
import { ToastProvider } from "@/components/toast";
import { TrayDrawer } from "@/components/tray-drawer";
import { OrderTrayProvider } from "@/context/OrderTrayContext";
import { UserRoleProvider } from "@/context/UserContext";

function Experience() {
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <>
      <SiteHeader onSignIn={() => setSignInOpen(true)} />
      <main>
        <Hero />
        <Marquee />
        <FeaturedDishes />
        <MenuSection />
        <TableSection onSignIn={() => setSignInOpen(true)} />
        <AIGuide />
        <RoomSection />
      </main>
      <SiteFooter onSignIn={() => setSignInOpen(true)} />
      <MobileTabBar onSignIn={() => setSignInOpen(true)} />
      <SignInPanel open={signInOpen} onClose={() => setSignInOpen(false)} />
      <TrayDrawer />
    </>
  );
}

export default function Home() {
  return (
    <UserRoleProvider>
      <OrderTrayProvider>
        <ToastProvider>
          <Experience />
        </ToastProvider>
      </OrderTrayProvider>
    </UserRoleProvider>
  );
}
