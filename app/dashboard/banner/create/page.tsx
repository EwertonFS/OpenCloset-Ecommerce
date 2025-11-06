'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { UploadButton } from '@/lib/uploadthing';
import { bannerSchema } from '@/lib/zodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Loader2, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
import { createBanner } from '@/lib/action';
import Router from 'next/router';

type BannerForm = z.infer<typeof bannerSchema>;

const BannerCreateRoute = () => {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BannerForm>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      imageString: undefined,
    },
  });

  useEffect(() => {
    if (image) {
      setValue('imageString', image);
    }
  }, [image, setValue]);

  const onSubmit = (data: BannerForm) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('imageString', data.imageString);

      try {
        await createBanner(formData);
        toast.success('Banner created successfully!');
        Router.push('/dashboard/banner');
      } catch (error) {
        toast.error('Something went wrong');
      }
    });
  };

  const handleDeleteImage = () => {
    setImage(undefined);
    setValue('imageString', '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-4">
        <Button variant={'outline'} size={'icon'} asChild>
          <Link href={'/dashboard/banner'}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New Banner</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Banner Details</CardTitle>
          <CardDescription>Create a new banner for your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label>Name</Label>
              <Input
                type="text"
                className="w-full"
                placeholder="Banner Name"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label>Image</Label>
              {image ? (
                <div className="relative w-[200px] h-[200px]">
                  <Image
                    src={image}
                    alt="Uploaded banner image"
                    className="w-full h-full object-cover rounded-md"
                    fill
                    unoptimized={process.env.NODE_ENV === 'development'}
                  />
                  <button
                    onClick={handleDeleteImage}
                    type="button"
                    className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg text-white"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <UploadButton
                  className="h-52 w-full rounded-md bg-border"
                  endpoint="bannerImageRoute"
                  onClientUploadComplete={(res) => {
                    if (res) {
                      setImage(res[0].url);
                      toast.success('Image uploaded');
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`ERROR! ${error.message}`);
                  }}
                />
              )}
              {errors.imageString && (
                <p className="text-red-500">{errors.imageString.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Banner'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default BannerCreateRoute;
