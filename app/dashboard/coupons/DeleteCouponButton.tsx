"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCoupon } from "@/lib/action";
import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

interface DeleteCouponButtonProps {
    couponId: string;
}

export function DeleteCouponButton({ couponId }: DeleteCouponButtonProps) {
    const [state, formAction] = useActionState(deleteCoupon, null);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success(state.success);
        }
    }, [state]);

    return (
        <form action={formAction}>
            <input type="hidden" name="couponId" value={couponId} />
            <Button size="icon" variant="ghost" type="submit">
                <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
        </form>
    );
}
