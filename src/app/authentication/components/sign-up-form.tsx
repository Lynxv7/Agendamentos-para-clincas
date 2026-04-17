"use client";

// libs externas
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// internos
import { signUpUser } from "@/actions/sign-up-user";
import {
  passwordRequirementMessage,
  signUpUserSchema,
  type SignUpUserInput,
} from "@/actions/sign-up-user/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

//
// COMPONENT
//
const SignUpForm = () => {
  const router = useRouter();
  const signUpUserAction = useAction(signUpUser, {
    onSuccess: async ({ input }) => {
      await authClient.signIn.email(
        {
          email: input.email,
          password: input.password,
        },
        {
          onSuccess: () => {
            router.push("/subscription-required");
          },
          onError: () => {
            toast.error("Conta criada, mas não foi possível iniciar a sessão.");
          },
        },
      );
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao criar conta.");
    },
  });

  const form = useForm<SignUpUserInput>({
    resolver: zodResolver(signUpUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  //
  // REGISTER
  //
  const handleSubmit = async (values: SignUpUserInput) => {
    signUpUserAction.execute(values);
  };

  return (
    <Card className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Crie uma conta para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <p className="text-xs leading-5 text-slate-500">
                    {passwordRequirementMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={signUpUserAction.isPending}
            >
              {signUpUserAction.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Criar conta"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;
