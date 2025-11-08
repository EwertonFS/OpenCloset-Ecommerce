import { KindeNextRequest, handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: KindeNextRequest, { params: initialParams }: any) {
    const params = await initialParams;
    const endpoint = params.kindeAuth;
    return handleAuth(request, endpoint);
}
