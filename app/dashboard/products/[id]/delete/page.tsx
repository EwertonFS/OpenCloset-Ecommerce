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

export default async function deleteRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Deletar Produto</CardTitle>
          <CardDescription>
            Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.
            {' '}(Se o produto tiver pedidos associados, ele será arquivado ao invés de deletado)
          </CardDescription>
        </CardHeader>
        <CardFooter className="w-full flex justify-between">
          <Button variant={'secondary'} asChild>
            <Link href={'/dashboard/products'}>Cancelar</Link>
          </Button>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={id} />
            <SubmitButton
              variant={'destructive'}
              type="submit"
              pendingText="Deletando..."
            >
              Deletar
            </SubmitButton>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
