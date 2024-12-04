'use server'
import {auth, signIn} from "@/auth";

export async function SignInWithGoogle() {
    return await signIn('google');
}

export async function getSession(){
    return await auth();
}