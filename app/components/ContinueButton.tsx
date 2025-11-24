"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/app/components/SubmitButton";

interface ContinueButtonProps {
    href: string;
}

export function ContinueButton({ href }: ContinueButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = () => {
        setIsLoading(true);
        router.push(href);
    };

    return (
        <SubmitButton
            onClick={handleClick}
            isLoading={isLoading}
            loadingText="Processando..."
            className="w-full mt-6  text-white bg-[#5131E8] hover:bg-[#5131E8]/90 text-lg py-6"
            type="button"
        >
            Continuar
        </SubmitButton>
    );
}
