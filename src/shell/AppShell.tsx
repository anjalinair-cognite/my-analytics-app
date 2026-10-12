import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@cognite/aura/components/breadcrumb';
import {
  Topbar,
  TopbarBreadcrumbs,
  TopbarIcon,
  TopbarLeft,
  TopbarMetadata,
  TopbarRight,
  TopbarThemeSwitcher,
} from '@cognite/aura/components/topbar';
import type { ReactNode } from 'react';

import { useThemeMode } from '../hooks/use-theme-mode';

type AppShellProps = {
  selectedName: string | null;
  onGoHome: () => void;
  children: ReactNode;
};

export function AppShell({ selectedName, onGoHome, children }: AppShellProps) {
  const { mode, setTheme } = useThemeMode();

  return (
    <div className="flex min-h-screen flex-col bg-muted/50 text-foreground">
      <Topbar>
        <TopbarLeft>
          <TopbarIcon>MA</TopbarIcon>
          <TopbarBreadcrumbs>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {selectedName ? (
                    <BreadcrumbLink
                      render={
                        <button
                          type="button"
                          onClick={onGoHome}
                        />
                      }
                    >
                      My Analytics App
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>My Analytics App</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {selectedName ? (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{selectedName}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : null}
              </BreadcrumbList>
            </Breadcrumb>
          </TopbarBreadcrumbs>
          <TopbarMetadata>Read-only</TopbarMetadata>
        </TopbarLeft>
        <TopbarRight>
          <TopbarThemeSwitcher theme={mode} onThemeChange={setTheme} />
        </TopbarRight>
      </Topbar>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
