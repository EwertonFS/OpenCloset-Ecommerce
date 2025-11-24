'use client';

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckoutSteps } from "@/app/components/CheckoutSteps";
import { Separator } from "@/components/ui/separator";
import FormAddress from "@/app/(storeFront)/order-review/identification/component/FormAddress";
import { getCart, getUserAddresses, getDbUser } from "@/lib/action";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { type User, type Address } from "@prisma/client";

export interface ShippingOption {
    id: number;
    name: string;
    price: string;
    delivery_time: number;
}

export interface CartItem {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    lineTotal: number;
    weight?: number;
    width?: number;
    height?: number;
    length?: number;
}

const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) {
        return "0,00";
    }
    return numericPrice.toFixed(2).replace(".", ",");
};


export default function IdentificationPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userAddress, setUserAddress] = useState<Address | null>(null);
    const [dbUser, setDbUser] = useState<User | null>(null);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
    const [shippingCost, setShippingCost] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const router = useRouter();

    const subtotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);

    const calculateShipping = useCallback(async (address: Address, cart: CartItem[]) => {
        if (!address || cart.length === 0) return;

        setIsCalculatingShipping(true);
        try {


            //             const products = cart.map(item => ({
            //     id: item.sku, // Usando o SKU como ID único
            //     weight: item.weight || 0.1,
            //     width: item.width || 15,
            //     height: item.height || 15,
            //     length: item.length || 15,
            //     quantity: item.quantity,
            // }));


            const response = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to_postal_code: address.zipCode,
                    products: cart,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setShippingOptions(data);
                if (data.length > 0) {
                    // Seleciona a primeira opção de frete como padrão
                    setSelectedShipping(data[0]);
                    setShippingCost(parseFloat(data[0].price));
                }
            } else {
                console.error("Failed to calculate shipping");
                setShippingOptions([]);
            }
        } catch (error) {
            console.error("Error calculating shipping:", error);
            setShippingOptions([]);
        } finally {
            setIsCalculatingShipping(false);
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [cartData, addresses, userData] = await Promise.all([getCart(), getUserAddresses(), getDbUser()]);

                if (!userData) {
                    router.push('/api/auth/login?post_login_redirect_url=/order-review/identification');
                    return;
                }

                setCartItems(cartData);
                setDbUser(userData);

                if (addresses.length > 0) {
                    const defaultAddress = addresses[0];
                    setUserAddress(defaultAddress);
                    if (cartData.length > 0) {
                        await calculateShipping(defaultAddress, cartData);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [router, calculateShipping]);

    const isAracaju = userAddress?.city?.trim().toLowerCase() === 'aracaju';

    useEffect(() => {
        // Se for Aracaju, o frete não é cobrado no checkout online
        const shippingToAdd = isAracaju ? 0 : shippingCost;
        const newTotal = subtotal + shippingToAdd;
        setTotal(newTotal);
    }, [subtotal, shippingCost, isAracaju]);

    const handleShippingChange = (value: string) => {
        const selected = shippingOptions.find(option => option.id.toString() === value);
        if (selected) {
            setSelectedShipping(selected);
            setShippingCost(parseFloat(selected.price));
        }
    };

    const handleAddressChange = (newAddress: Partial<Address>) => {
        const updatedAddress = { ...(userAddress || {}), ...newAddress } as Address;
        setUserAddress(updatedAddress);

        // Recalcula frete apenas se não for Aracaju e tiver CEP válido
        const cityIsAracaju = updatedAddress.city?.trim().toLowerCase() === 'aracaju';

        if (newAddress.zipCode && newAddress.zipCode.length === 8 && newAddress.zipCode !== userAddress?.zipCode) {
            if (updatedAddress.zipCode && !cityIsAracaju) {
                calculateShipping(updatedAddress, cartItems);
            } else if (cityIsAracaju) {
                // Limpa opções de frete se mudou para Aracaju
                setShippingOptions([]);
                setSelectedShipping(null);
                setShippingCost(0);
            }
        }
    };

    const handleCheckout = async (address: Partial<Address>) => {
        const fullAddress = { ...userAddress, ...address } as Address;

        if (!fullAddress.street || !fullAddress.number || !fullAddress.district || !fullAddress.city || !fullAddress.state || !fullAddress.zipCode) {
            alert("Por favor, preencha o endereço completo antes de prosseguir.");
            return;
        }

        if (!dbUser?.cpf || !dbUser?.phone) {
            alert("Para continuar com o pagamento, por favor, vá até a sua área de usuário e cadastre seu CPF e Telefone.");
            return;
        }

        // Validação de frete apenas se NÃO for Aracaju
        const currentIsAracaju = fullAddress.city?.trim().toLowerCase() === 'aracaju';
        if (!selectedShipping && !currentIsAracaju) {
            alert("Por favor, selecione uma opção de frete.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: fullAddress,
                    cart: cartItems,
                    total,
                    shipping: currentIsAracaju ? { price: "0" } : selectedShipping
                }),
            });

            const data = await response.json();
            if (response.ok && data.checkoutUrl) {
                router.push(data.checkoutUrl);
            } else {
                console.error('Failed to create checkout session:', data.error);
            }
        } catch (error) {
            console.error('An error occurred during checkout:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <CheckoutSteps currentStep="identification" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 mt-10">
                <div className="lg:col-span-1 space-y-8">
                    {isLoading ? <p>Carregando dados...</p> : (
                        <FormAddress
                            address={userAddress}
                            onCheckout={handleCheckout}
                            isSubmitting={isSubmitting}
                            onAddressChange={handleAddressChange}
                        />
                    )}
                </div>

                <div className="lg:col-span-1 mt-10 lg:mt-0">
                    <div className="bg-gray-50 rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold mb-6">Resumo do pedido</h2>
                        {isLoading ? <p>Carregando carrinho...</p> : (
                            <>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.sku} className="flex items-center gap-x-4">
                                            <div className="relative w-20 h-20 bg-gray-200 rounded-lg">
                                                <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">{formatPrice(item.price)}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-6" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal = total de items</span>
                                        <span className="font-medium">{formatPrice(subtotal)}</span>
                                    </div>

                                    <div className="text-sm">
                                        <span className="text-gray-600">Frete</span>
                                        {isAracaju ? (
                                            <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                                <p className="font-medium mb-1">Entrega em Aracaju</p>
                                                <p>
                                                    A taxa de entrega será cobrada de acordo com o valor da empresa de envio.
                                                    Entraremos em contato via WhatsApp para definir o horário de entrega.
                                                    <strong> Este valor não será cobrado agora mas deverá ser pago no ato da entrega pelo cliente.</strong>
                                                </p>
                                            </div>
                                        ) : (
                                            isCalculatingShipping ? <p className="font-medium">Calculando...</p> : (
                                                shippingOptions.length > 0 ? (
                                                    <RadioGroup value={selectedShipping?.id.toString()} onValueChange={handleShippingChange} className="mt-2">
                                                        {shippingOptions.map((option) => (
                                                            <div key={option.id} className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                                                                    <Label htmlFor={option.id.toString()} className="font-normal">
                                                                        {option.name} - até {option.delivery_time} dias úteis
                                                                    </Label>
                                                                </div>
                                                                <span className="font-medium">R$ {formatPrice(option.price)}</span>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                ) : <p className="font-medium">Nenhuma opção de frete disponível.</p>
                                            )
                                        )}
                                    </div>

                                    <div className="flex justify-between font-bold text-lg mt-2">
                                        <span>Total</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}