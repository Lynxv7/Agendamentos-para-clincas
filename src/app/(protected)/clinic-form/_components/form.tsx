"use client";

// libs externas
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// internos
import { createClinic } from "@/actions/create-clinic";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

//
// SCHEMA
//
const clinicFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
});

type ClinicFormValues = z.infer<typeof clinicFormSchema>;

//
// COMPONENT
//
const ClinicForm = () => {
  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: "",
    },
  });

  //
  // CREATE CLINIC
  //
  const handleSubmit = async (values: ClinicFormValues) => {
    try {
      await createClinic(values.name);

      toast.success("Clínica criada com sucesso!");
      form.reset();
    } catch (error) {
      if (isRedirectError(error)) return;

      console.error(error);
      toast.error("Erro ao criar clínica.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* NAME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da clínica</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Clínica Saúde+" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar clínica"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ClinicForm;
