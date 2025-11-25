import Brands from "../components/Brands";
import BestSellers from "../components/BestSellers";
import Promotions from "../components/Promotions";
import Hero from "../components/hero";
import Footer from "../components/Footer";


const Home = () => {
    return (
        <>
            <main className="flex flex-col gap-y-8 md:gap-y-12 w-full" >
                <div className="mx-4 md:mx-6 lg:mx-10 ">
                    <Hero />
                </div>

                <Brands />
                <BestSellers />
                <Promotions />
            </main>
            <Footer />
        </>
    );
}

export default Home;