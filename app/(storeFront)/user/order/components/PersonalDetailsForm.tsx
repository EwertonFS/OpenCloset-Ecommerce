'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserPersonalDetails } from '@/lib/action';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User } from '@prisma/client';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

interface PersonalDetailsFormProps {
  user: User;
}

export function PersonalDetailsForm({ user }: PersonalDetailsFormProps) {
  const [state, formAction] = useActionState(updateUserPersonalDetails, {
    success: false,
    error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  useEffect(() => {
    if (state.success) {
      toast.success('Your details have been updated.');
    }
    if (state.error) {
      const errorMessages = Object.values(state.error).flat();
      errorMessages.forEach(message => {
        toast.error(String(message));
      });
    }
  }, [state]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">My Details</h1>
      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user.firstName ?? ''}
            />
            {state.error?.firstName && (
              <p className="text-red-500 text-sm">{state.error.firstName[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user.lastName ?? ''}
            />
            {state.error?.lastName && (
              <p className="text-red-500 text-sm">{state.error.lastName[0]}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email ?? ''}
            disabled
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" defaultValue={user.cpf ?? ''} />
            {state.error?.cpf && (
              <p className="text-red-500 text-sm">{state.error.cpf[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={user.phone ?? ''} />
            {state.error?.phone && (
              <p className="text-red-500 text-sm">{state.error.phone[0]}</p>
            )}
          </div>
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}    