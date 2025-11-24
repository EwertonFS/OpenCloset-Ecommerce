"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
    children: ReactNode;
    loadingText?: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    type?: "submit" | "button" | "reset";
}

export function SubmitButton({
    children,
    loadingText = "Aguarde...",
    className,
    variant = "default",
    size = "default",
    disabled,
    isLoading = false,
    onClick,
    type = "submit",
}: SubmitButtonProps) {
    const { pending } = useFormStatus();
    const isSubmitting = pending || isLoading;

    return (
        <Button
            type={type}
            disabled={isSubmitting || disabled}
            variant={variant}
            size={size}
            className={className}
            onClick={onClick}
        >
            {isSubmitting ? (
                <>
                    <Loader2 className={cn("h-4 w-4 animate-spin", loadingText ? "mr-2" : "")} />
                    {loadingText}
                </>
            ) : (
                children
            )}
        </Button>
    );
}
