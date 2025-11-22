import Brands from "../components/Brands";
import BestSellers from "../components/BestSellers";
import Promotions from "../components/Promotions";
import Hero from "../components/hero";


const Home = () => {
    return (
        <main className="flex flex-col gap-y-8 md:gap-y-12 w-full" >
            <Hero />
            <Brands />
            <BestSellers />
            <Promotions />
        </main>
    );
}

export default Home;