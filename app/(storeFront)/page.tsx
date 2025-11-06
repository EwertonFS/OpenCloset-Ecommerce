import Brands from "../components/Brands";
import BestSellers from "../components/BestSellers";
import Promotions from "../components/Promotions";
import Hero from "../components/hero";


const Home = () => {
    return ( 
    <main className="gap-y-4 px-11" >
        <Hero/>
        <Brands />
        <BestSellers />
        <Promotions />
     </main> 
    );
}
 
export default Home;