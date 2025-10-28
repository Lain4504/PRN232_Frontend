import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const pageLayoutVariants = cva(
  "min-h-screen bg-background",
  {
    variants: {
      variant: {
        default: "",
        centered: "flex items-center justify-center",
        sidebar: "grid grid-cols-[250px_1fr]",
        fullscreen: "h-screen overflow-hidden",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface PageLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageLayoutVariants> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string; isCurrentPage?: boolean }[];
  actions?: React.ReactNode;
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ className, variant, padding, children, title, description, breadcrumbs, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageLayoutVariants({ variant, padding, className }))}
        {...props}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {(title || description || breadcrumbs || actions) && (
            <div className="space-y-4">
              {breadcrumbs && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          {crumb.isCurrentPage ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                  {description && <p className="text-muted-foreground text-lg">{description}</p>}
                </div>
                {actions && <div>{actions}</div>}
              </div>
            </div>
          )}
          <div>{children}</div>
        </div>
      </div>
    );
  }
);

PageLayout.displayName = "PageLayout";

// Page Header Component
interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-lg">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center justify-between">
            {children}
          </div>
        )}
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";

// Page Content Component
interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-6", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PageContent.displayName = "PageContent";

// Page Section Component
interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const PageSection = React.forwardRef<HTMLDivElement, PageSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);

PageSection.displayName = "PageSection";

export { 
  PageLayout, 
  PageHeader, 
  PageContent, 
  PageSection, 
  pageLayoutVariants 
};
