'use client';

import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import * as React from 'react';

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
} & React.ComponentProps<typeof Button>;

export function SubmitButton({
  children,
  pendingText,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending && pendingText ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function ShoppingBagButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <Button
        disabled={pending}
        size="lg"
        className="mt-5 w-full"
        type="submit"
      >
        {pending ? (
          <>
            <Loader2 className="mr-4 h-5 w-5 animate-spin" />
            Please Wait
          </>
        ) : (
          <>
            <ShoppingBag className="mr-4 h-5 w-5" />
            Add To Cart
          </>
        )}
      </Button>
    </>
  );
}

// refatorado
// interface ButtonProps {
//   text: string;
//   variant?:
//     | 'link'
//     | 'default'
//     | 'destructive'
//     | 'outline'
//     | 'secondary'
//     | 'ghost'
//     | null
//     | undefined;
// }

// export function SubmitButton({ text, variant }: ButtonProps) {
//   const { pending } = useFormStatus();

//   return (
//     <>
//       {pending ? (
//         <Button disabled size="lg">
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           Please Wait
//         </Button>
//       ) : (
//         <Button type="submit" variant={variant ?? 'default'} size="lg">
//           {text}
//         </Button>
//       )}
//     </>
//   );
// }
