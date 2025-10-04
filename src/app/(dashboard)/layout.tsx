"use client"

import React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Generate breadcrumb based on current path
  const getBreadcrumbItems = () => {
    const pathSegments = pathname.split('/').filter(Boolean)

    // Always start with PHPinancia > Dashboard
    const items = [
      { label: 'PHPinancia', href: '/dashboard', isCurrent: false },
      { label: 'Dashboard', href: '/dashboard', isCurrent: false }
    ]

    // Add current page based on the last segment
    if (pathSegments.length >= 1 && pathname !== '/dashboard') {
      const currentPage = pathSegments[pathSegments.length - 1]
      const pageName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
      items.push({ label: pageName, href: '', isCurrent: true }) // Current page has no href
    }

    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
          role="banner"
          aria-label="Page header"
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
            <Separator orientation="vertical" className="mr-2 h-4" aria-hidden="true" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.label}>
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {item.isCurrent ? (
                        <BreadcrumbPage aria-current="page">{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" aria-hidden="true" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main
          id="main-content"
          className="flex flex-1 flex-col gap-4 p-4 pt-0"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}