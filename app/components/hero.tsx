import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { prisma } from '@/lib/prisma';

const getData = async () => {
  const data = await prisma.banner.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
  return data;
}

const Hero = async () => {
  const data = await getData();
  // const data = [
  //   {
  //     id: "1",
  //     title: "Promoção de Inverno",
  //     imageString: "/banner-01.png",
  //   },
  //   {
  //     id: "2",
  //     title: "Nova Coleção",
  //     imageString: "/banner.desktop.png",
  //   },
  // ];

  if (!Array.isArray(data)) {
    // Retorna null ou um componente de fallback se não houver dados, evitando o erro.
    return null;
  }

  return (
    <Carousel>
      <CarouselContent>
        {data.map((item) => (
          <CarouselItem key={item.id}>
            <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[80vh] w-full overflow-hidden rounded-xl">
              <Image
                alt={item.title}
                src={item.imageString}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                className="object-cover object-center"
                priority
              />
              <div className="absolute bottom-6 left-4 md:top-10 md:left-10 md:bottom-auto max-w-[80%] md:max-w-lg rounded-xl bg-black/60 backdrop-blur-sm p-4 md:p-6 text-white shadow-lg transition-all hover:bg-black/70">
                <h1 className="text-lg font-bold sm:text-2xl lg:text-4xl leading-tight">{item.title}</h1>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 md:left-12" />
      <CarouselNext className="right-2 md:right-12" />
    </Carousel>
  );
}

export default Hero;
