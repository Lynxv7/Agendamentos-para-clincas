import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import SignOutButton from "./_components/sign-out-button";

// Tipagem da clínica
type Clinic = {
  id: number;
  name: string;
};

// Tipagem do usuário
type User = {
  id: string;
  name: string;
  email: string;
  clinic?: Clinic;
};

const DashboardPage = async () => {
  // Pega sessão
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 🔐 NÃO LOGADO
  if (!session?.user) {
    redirect("/authentication");
  }

  // Cria variável user para o TypeScript entender melhor
  const user: User = session.user;

  // 🏥 SEM CLÍNICA
  if (!user.clinic) {
    redirect("/clinic-form");
  }

  // Como já garantimos que clinic existe, podemos usar `!`
  return (
    <div className="bg-gray-100">
      <h1>Dashboard</h1>

      <h2>Nome: {user.name}</h2>
      <h2>Email: {user.email}</h2>

      <h2>Clínica ID: {user.clinic!.id}</h2>
      <h2>Clínica Nome: {user.clinic!.name}</h2>

      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
