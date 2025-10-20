// File: TraffiXpert-frontend/src/app/(main)/layout.tsx
import { AppShell } from '@/components/layout/app-shell';

export default function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}