
import Image from "next/image";

const Promotions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Promo Card 1 */}
          <div className="relative flex-1 rounded-[15px] bg-gradient-to-b from-[#B9BBE2] to-[#EEEFF6] p-6 overflow-hidden min-h-[300px] lg:min-h-[400px]">
            <div className="absolute top-6 left-6 text-white text-2xl font-medium leading-tight max-w-[70%]">
              Nike Therma FIT Headed
            </div>
            <Image
              src="/promo-1.png"
              alt="Nike Therma FIT Headed"
              fill
              className="absolute bottom-0 right-0 object-cover w-full h-full"
            />
            <button className="absolute bottom-6 right-6 px-5 py-4 bg-white rounded-full backdrop-blur-sm text-black text-lg font-semibold leading-tight">
              Comprar
            </button>
          </div>

          {/* Promo Card 2 */}
          <div className="relative flex-1 rounded-[15px] bg-gradient-to-b from-[#B0B1F0] to-[#EAF0FA] p-6 overflow-hidden min-h-[300px] lg:min-h-[400px]">
            <div className="absolute top-6 left-6 text-white text-2xl font-medium leading-tight max-w-[70%]">
              Nike Therma FIT Headed
            </div>
            <Image
              src="/promo-2.png"
              alt="Nike Therma FIT Headed"
              fill
              className="absolute bottom-0 right-0 object-cover w-full h-full"
            />
            <button className="absolute bottom-6 right-6 px-5 py-4 bg-white rounded-full backdrop-blur-sm text-black text-lg font-semibold leading-tight">
              Comprar
            </button>
          </div>
        </div>

        {/* Promo Card 3 */}
        <div className="relative rounded-[15px] bg-gradient-to-b from-[#A0CBE9] to-[#EAF0FA] p-6 overflow-hidden min-h-[600px] lg:min-h-[800px]">
          <div className="absolute top-6 left-6 text-white text-2xl font-medium leading-tight max-w-[70%]">
            Nike Therma FIT Headed
          </div>
          <Image
            src="/promo-3.png"
            alt="Nike Therma FIT Headed"
            fill
            className="absolute bottom-0 right-0 object-cover w-full h-full"
          />
          <button className="absolute bottom-6 right-6 px-5 py-4 bg-white rounded-full backdrop-blur-sm text-black text-lg font-semibold leading-tight">
              Comprar
            </button>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
