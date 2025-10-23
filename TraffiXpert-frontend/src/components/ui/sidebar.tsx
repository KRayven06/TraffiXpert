
"use client"

import * as React from "react"
import { MoreVertical, ChevronFirst, ChevronLast } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarContextProps {
  isExpanded: boolean
  isCollapsible?: "icon" | "button"
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextProps>(
  {} as SidebarContextProps
)

interface SidebarProviderProps extends React.PropsWithChildren {
  isExpanded?: boolean
  collapsible?: "icon" | "button"
}

function SidebarProvider({
  children,
  collapsible,
  isExpanded: isExpandedProp,
}: SidebarProviderProps) {
  const [isExpanded, setIsExpanded] = React.useState(isExpandedProp ?? true)
  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        setIsExpanded,
        isCollapsible: collapsible,
      }}
    >
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { isExpanded, setIsExpanded } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={() => {
        setIsExpanded(!isExpanded)
      }}
      className={cn("size-10", className)}
      {...props}
    >
      <MoreVertical />
      <span className="sr-only">{isExpanded ? "Close" : "Open"} sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"aside"> & {
    collapsible?: "icon" | "button"
  }
>(({ className, children, collapsible, ...props }, ref) => {
  const { isExpanded, setIsExpanded, isCollapsible } = useSidebar()
  const isButtonCollapsible = isCollapsible === "button"
  const isIconCollapsible = isCollapsible === "icon"

  return (
    <aside
      ref={ref}
      data-collapsible={isCollapsible ? (isExpanded ? "false" : "true") : "none"}
      data-collapsed={isExpanded ? "false" : "true"}
      className={cn(
        "group/sidebar fixed z-50 flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16",
        className
      )}
      {...props}
    >
      {children}
      {isIconCollapsible ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-5 top-8 hidden rounded-full bg-background text-foreground ring-1 ring-border group-hover/sidebar:block"
          onClick={() => {
            setIsExpanded(!isExpanded)
          }}
        >
          {isExpanded ? <ChevronFirst /> : <ChevronLast />}
        </Button>
      ) : null}
      {isButtonCollapsible ? (
        <Button
          className={cn(
            "mt-auto w-fit",
            isExpanded ? "mx-4" : "mx-auto size-10"
          )}
          onClick={() => {
            setIsExpanded(!isExpanded)
          }}
        >
          <ChevronFirst
            className={cn("transition-transform", isExpanded ? "" : "rotate-180")}
          />
          {isExpanded ? (
            <span className="ml-2">Collapse sidebar</span>
          ) : (
            <span className="sr-only">Expand sidebar</span>
          )}
        </Button>
      ) : null}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { isExpanded } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-screen flex-col transition-all duration-300 ease-in-out",
        isExpanded ? "pl-64" : "pl-16",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-14 items-center gap-2 p-4", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1 overflow-auto", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "mt-auto flex items-center gap-2 border-t p-4",
        className
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  return (
    <ul ref={ref} className={cn("flex flex-col gap-2 p-4", className)} {...props} />
  )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn("", className)} {...props} />
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    isActive?: boolean
    tooltip?: Pick<
      React.ComponentProps<typeof TooltipContent>,
      "children" | "side" | "sideOffset" | "align" | "alignOffset"
    >
  }
>(
  (
    {
      className,
      children,
      tooltip,
      isActive = false,
      asChild,
      ...props
    },
    ref
  ) => {
    const { isExpanded } = useSidebar()
    const isTooltipEnabled = !!tooltip && !isExpanded

    return (
      <Tooltip open={isTooltipEnabled ? undefined : false}>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            data-active={isActive ? "true" : "false"}
            variant="ghost"
            className={cn(
              "h-12 w-full justify-start text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground group-data-[collapsed=true]:h-12 group-data-[collapsed=true]:w-12 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0",
              className
            )}
            asChild={asChild}
            {...props}
          >
            {children}
          </Button>
        </TooltipTrigger>
        {isTooltipEnabled ? (
          <TooltipContent {...tooltip}>{tooltip.children}</TooltipContent>
        ) : null}
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
}
