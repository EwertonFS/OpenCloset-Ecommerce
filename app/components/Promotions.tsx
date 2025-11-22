
import Image from "next/image";

const Promotions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {/* Promo Card 1 */}
          <div className="relative flex-1 rounded-[15px] bg-gradient-to-b from-[#B9BBE2] to-[#EEEFF6] p-4 md:p-6 overflow-hidden min-h-[250px] md:min-h-[300px] lg:min-h-[400px]">
            <div className="absolute top-4 left-4 md:top-6 md:left-6 text-white text-xl md:text-2xl font-medium leading-tight max-w-[70%] z-10">
              Nike Therma FIT Headed
            </div>
            <Image
              src="/promo-1.png"
              alt="Nike Therma FIT Headed"
              fill
              className="absolute bottom-0 right-0 object-cover w-full h-full"
            />
            <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-4 py-3 md:px-5 md:py-4 bg-white rounded-full backdrop-blur-sm text-black text-base md:text-lg font-semibold leading-tight z-10 hover:bg-white/90 transition-colors">
              Comprar
            </button>
          </div>

          {/* Promo Card 2 */}
          <div className="relative flex-1 rounded-[15px] bg-gradient-to-b from-[#B0B1F0] to-[#EAF0FA] p-4 md:p-6 overflow-hidden min-h-[250px] md:min-h-[300px] lg:min-h-[400px]">
            <div className="absolute top-4 left-4 md:top-6 md:left-6 text-white text-xl md:text-2xl font-medium leading-tight max-w-[70%] z-10">
              Nike Therma FIT Headed
            </div>
            <Image
              src="/promo-2.png"
              alt="Nike Therma FIT Headed"
              fill
              className="absolute bottom-0 right-0 object-cover w-full h-full"
            />
            <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-4 py-3 md:px-5 md:py-4 bg-white rounded-full backdrop-blur-sm text-black text-base md:text-lg font-semibold leading-tight z-10 hover:bg-white/90 transition-colors">
              Comprar
            </button>
          </div>
        </div>

        {/* Promo Card 3 */}
        <div className="relative rounded-[15px] bg-gradient-to-b from-[#A0CBE9] to-[#EAF0FA] p-4 md:p-6 overflow-hidden min-h-[400px] md:min-h-[600px] lg:min-h-[800px]">
          <div className="absolute top-4 left-4 md:top-6 md:left-6 text-white text-xl md:text-2xl font-medium leading-tight max-w-[70%] z-10">
            Nike Therma FIT Headed
          </div>
          <Image
            src="/promo-3.png"
            alt="Nike Therma FIT Headed"
            fill
            className="absolute bottom-0 right-0 object-cover w-full h-full"
          />
          <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-4 py-3 md:px-5 md:py-4 bg-white rounded-full backdrop-blur-sm text-black text-base md:text-lg font-semibold leading-tight z-10 hover:bg-white/90 transition-colors">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
