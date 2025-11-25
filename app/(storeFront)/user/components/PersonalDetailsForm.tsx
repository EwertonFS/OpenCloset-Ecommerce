'use client';

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserPersonalDetails } from '@/lib/action';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User } from '@prisma/client';
import { personalDetailsSchema } from '@/lib/zodSchema';
import { z } from 'zod';
import { IMaskInput } from 'react-imask';
import { cn } from '@/lib/utils';

interface PersonalDetailsFormProps {
  user: User;
}

type FormData = z.infer<typeof personalDetailsSchema>;

export function PersonalDetailsForm({ user }: PersonalDetailsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      cpf: user.cpf ?? '',
      phone: user.phone ?? '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  async function onSubmit(data: FormData) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('cpf', data.cpf || '');
      formData.append('phone', data.phone || '');

      const result = await updateUserPersonalDetails(null, formData);

      if (result?.error) {
        if (typeof result.error === 'string') {
          toast.error(result.error);
        } else {
          // Handle object errors if any
          Object.values(result.error).flat().forEach((msg) => toast.error(String(msg)));
        }
      } else if (result?.success) {
        toast.success(result.success as string);
      }
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Meus Detalhes</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Digite seu nome"
              className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Digite seu sobrenome"
              className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue={user.email ?? ''}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  mask="000.000.000-00"
                  value={field.value || ''}
                  onAccept={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  placeholder="000.000.000-00"
                  className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    errors.cpf && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              )}
            />
            {errors.cpf && (
              <p className="text-red-500 text-sm">{errors.cpf.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={field.value || ''}
                  onAccept={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  placeholder="(00) 00000-0000"
                  className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    errors.phone && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </div>
  );
}