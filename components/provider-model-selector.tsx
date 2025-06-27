'use client';

import { startTransition, useOptimistic, useState } from 'react';

import { saveChatProviderModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { providers } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { cn } from '@/lib/utils';
import type { Session } from 'next-auth';

import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  LogoAnthropic,
  LogoXAI,
  LogoGoogle,
  LogoOllama,
  LogoWebLLM,
} from './icons';

// Provider icon mapping
const providerIcons = {
  anthropic: LogoAnthropic,
  xai: LogoXAI,
  google: LogoGoogle,
  ollama: LogoOllama,
  webllm: LogoWebLLM,
};

export function ProviderModelSelector({
  selectedModelId,
  session,
  className,
}: {
  selectedModelId: string;
  session: Session;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const userType = session.user.type;
  const { availableProviderIds } = entitlementsByUserType[userType ?? 'guest'];

  const SelectedIcon = selectedModelId
    ? providerIcons[selectedModelId as keyof typeof providerIcons]
    : null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="provider-model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px] gap-2"
        >
          {SelectedIcon && <SelectedIcon size={16} />}
          {providers[selectedModelId as keyof typeof providers]?.name ||
            'Unknown Model'}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[320px]">
        {Object.keys(providers)
          .filter((providerId) => availableProviderIds.includes(providerId))
          .map((providerId, index) => {
          const ProviderIcon =
            providerIcons[providerId as keyof typeof providerIcons];
          const providerName =
            providers[providerId as keyof typeof providers].name;
          const providerDescription =
            providers[providerId as keyof typeof providers].description;

          return (
            <div key={providerId}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                data-testid={`provider-model-selector-item-${providerId}`}
                key={providerId}
                onSelect={() => {
                  setOpen(false);

                  startTransition(() => {
                    setOptimisticModelId(providerId);
                    saveChatProviderModelAsCookie(providerId);
                  });
                }}
                data-active={providerId === optimisticModelId}
                asChild
              >
                <button
                  type="button"
                  className="gap-4 group/item flex flex-row justify-between items-center w-full p-2"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-1">
                      {ProviderIcon && <ProviderIcon size={14} />}
                      <span className="font-medium">{providerName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {providerDescription}
                    </div>
                  </div>

                  <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
