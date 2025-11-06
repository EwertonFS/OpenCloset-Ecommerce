import { SubmitButton } from '@/app/dashboard/components/SubmitButtons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { deleteBanner } from '@/lib/action';

import Link from 'next/link';

const DeleteBannerRoute = ({ params }: { params: { id: string } }) => {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Delete Banner</CardTitle>
          <CardDescription>
            Are you sure you want to delete this Banner? This action cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex w-full justify-between">
          <Button variant={'secondary'} asChild>
            <Link href={'/dashboard/banner'}>Cancel</Link>
          </Button>
          <form action={deleteBanner}>
            <input type="hidden" name="bannerId" value={params.id} />
            <SubmitButton
              variant={'destructive'}
              type="submit"
              pendingText="Deleting..."
            >
              Deletar
            </SubmitButton>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeleteBannerRoute;
