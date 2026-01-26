import * as React from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading,
      isSuccess,
      isError,
      loadingText,
      successText,
      errorText,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const getContent = () => {
      if (isLoading) {
        return (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || "Carregando..."}
          </span>
        );
      }
      
      if (isSuccess) {
        return (
          <span className="flex items-center gap-2 animate-success-pop">
            <Check className="h-4 w-4" />
            {successText || "Sucesso!"}
          </span>
        );
      }
      
      if (isError) {
        return (
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {errorText || "Erro"}
          </span>
        );
      }
      
      return children;
    };

    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          isSuccess && "bg-success hover:bg-success/90",
          isError && "bg-destructive hover:bg-destructive/90",
          className
        )}
        {...props}
      >
        {getContent()}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
