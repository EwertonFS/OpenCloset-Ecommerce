import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AddressForm from '../components/AddressForm';
import { updateAddress } from '@/lib/action';

async function getAddress(id: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/user/address-book');
  }

  const address = await prisma.address.findUnique({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!address) {
    redirect('/user/address-book');
  }

  return address;
}

export default async function EditAddressPage({ params }: { params: { id: string } }) {
  const address = await getAddress(params.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Editar Endereço</h1>
      <AddressForm
        address={address}
        onSaveAction={updateAddress}
        redirectUrl="/user/address-book"
      />
    </div>
  );
}
