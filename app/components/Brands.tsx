
import Image from "next/image";

const Brands = () => {
  return (
    <div className="flex flex-col gap-9 px-4 md:px-11 pb-16">
      <div className="flex items-center gap-2.5">
        <h2 className="font-semibold text-2xl leading-9">Marcas parceiras</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full h-32 md:h-full border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-md">
            <Image
              src="/icons/nike.svg"
              alt="Nike"
              width={50}
              height={18}
              className="w-auto h-auto max-h-8 md:max-h-full"
            />
          </div>
          <p className="font-medium text-base leading-5">Nike</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full h-32 md:h-full border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-md">
            <Image
              src="/icons/adidas.svg"
              alt="Adidas"
              width={50}
              height={31}
              className="w-auto h-auto max-h-8 md:max-h-full"
            />
          </div>
          <p className="font-medium text-base leading-5">Adidas</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full h-32 md:h-full border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-md">
            <Image
              src="/icons/puma.svg"
              alt="Puma"
              width={50}
              height={39}
              className="w-auto h-auto max-h-8 md:max-h-full"
            />
          </div>
          <p className="font-medium text-base leading-5">Puma</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full h-32 md:h-full border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-md">
            <Image
              src="/icons/new-balance.svg"
              alt="New Balance"
              width={50}
              height={24}
              className="w-auto h-auto max-h-8 md:max-h-full"
            />
          </div>
          <p className="font-medium text-base leading-5">New Balance</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full h-32 md:h-full border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-md">
            <Image
              src="/icons/converse.svg"
              alt="Converse"
              width={50}
              height={43}
              className="w-auto h-auto max-h-8 md:max-h-full"
            />
          </div>
          <p className="font-medium text-base leading-5">Converse</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full h-32 md:h-full border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-md">
            <Image
              src="/icons/polo.png"
              alt="Polo"
              width={27}
              height={60}
              className="w-auto h-auto max-h-12 md:max-h-full"
            />
          </div>
          <p className="font-medium text-base leading-5">Polo</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full h-32 md:h-full border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-md">
            <Image
              src="/icons/zara.svg"
              alt="Zara"
              width={60}
              height={25}
              className="w-auto h-auto max-h-8 md:max-h-full"
            />
          </div>
          <p className="font-medium text-base leading-5">Zara</p>
        </div>
      </div>
    </div>
  );
};

export default Brands;
