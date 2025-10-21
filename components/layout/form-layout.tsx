import * as React from "react";
import { cn } from "@/lib/utils";

interface FormLayoutProps extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const spacingClasses = {
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-8",
};

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg", 
  xl: "max-w-xl",
  full: "max-w-full",
};

const FormLayout = React.forwardRef<HTMLFormElement, FormLayoutProps>(
  ({ 
    className, 
    children, 
    spacing = "md",
    maxWidth = "full",
    ...props 
  }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(
          "w-full",
          spacingClasses[spacing],
          maxWidthClasses[maxWidth],
          className
        )}
        {...props}
      >
        {children}
      </form>
    );
  }
);

FormLayout.displayName = "FormLayout";

// Form Field Component
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    className, 
    children, 
    label, 
    description, 
    error,
    required = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        {children}
        
        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// Form Group Component
interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ 
    className, 
    children, 
    columns = 1,
    gap = "md",
    ...props 
  }, ref) => {
    const columnClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };

    const gapClasses = {
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          columnClasses[columns],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormGroup.displayName = "FormGroup";

// Form Actions Component
interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: "left" | "center" | "right" | "between";
  spacing?: "sm" | "md" | "lg";
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ 
    className, 
    children, 
    align = "right",
    spacing = "md",
    ...props 
  }, ref) => {
    const alignClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      between: "justify-between",
    };

    const spacingClasses = {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          alignClasses[align],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = "FormActions";

export { FormLayout, FormField, FormGroup, FormActions };
