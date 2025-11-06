import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { prisma } from '@/lib/prisma';

const getData = async () => {
  const data = await prisma.banner.findMany({
    orderBy:{
      createdAt:'desc'
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
            <div className="relative h-[60vh] lg:h-[80vh]">
              <Image
                alt="Banner Image"
                src={item.imageString}
                fill
                className="h-full w-full rounded-xl object-cover"
              />
              <div className="absolute top-6 left-6 transform rounded-xl bg-black/75 p-6 text-white shadow-lg transition-transform hover:scale-105">
                <h1 className="text-xl font-bold lg:text-4xl">{item.title}</h1>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-16" />
      <CarouselNext className="mr-16" />
    </Carousel>
  );
}

export default Hero;
