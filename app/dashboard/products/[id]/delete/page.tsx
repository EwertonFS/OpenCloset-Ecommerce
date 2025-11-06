import { SubmitButton } from '@/app/dashboard/components/SubmitButtons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { deleteProduct } from '@/lib/action';
import Link from 'next/link';

export default function deleteRoute({ params }: { params: { id: string } }) {
  return (
    <div className="h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Delete Product</CardTitle>
          <CardDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardFooter className="w-full flex justify-between">
          <Button variant={'secondary'} asChild>
            <Link href={'/dashboard/products'}>Cancel</Link>
          </Button>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={params.id} />
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
}
