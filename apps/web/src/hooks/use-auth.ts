import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type { User } from "better-auth/types";

export function useAuth(redirectTo?: string) {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const session = await authClient.getSession();
			if (session && "data" in session && session.data?.user) {
				setUser(session.data.user);
			} else if (redirectTo) {
				router.push(redirectTo as any);
			}
		} catch (err) {
			if (redirectTo) {
				router.push(redirectTo as any);
			}
		} finally {
			setLoading(false);
		}
	};

	const signOut = async () => {
		await authClient.signOut();
		setUser(null);
		router.push("/login");
	};

	return { user, loading, signOut, refetch: checkAuth };
}
