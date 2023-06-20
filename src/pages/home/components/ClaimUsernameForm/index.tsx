import { Button, Text, TextInput } from "@ignite-ui/react";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormAnnotation } from "./styles";
import { useRouter } from "next/router";

const caimUsernameFormSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Mínimo de 3 caracteres" })
		.regex(/^([a-z\\0-9\\-]+)$/i, { message: "Apenas letras e hífens" })
		.transform((username) => username.toLowerCase()),
});

type ClaimUsernameFormData = z.infer<typeof caimUsernameFormSchema>;

export function ClaimUsernameForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ClaimUsernameFormData>({
		resolver: zodResolver(caimUsernameFormSchema),
	});

	const router = useRouter();

	async function handlePreRegister(data: ClaimUsernameFormData) {
		const { username } = data;

		await router.push(`/register?username=${username}`);
	}

	return (
		<>
			<Form as="form" onSubmit={handleSubmit(handlePreRegister)}>
				<TextInput
					size="sm"
					prefix="ignite.com/"
					placeholder="seu-usuario"
					{...register("username")}
				/>
				<Button size="sm" type="submit" disabled={isSubmitting}>
					Reservar
					<ArrowRight />
				</Button>
			</Form>

			<FormAnnotation>
				<Text size="sm">
					{errors.username
						? errors.username.message
						: "Digite o nome do usuário"}
				</Text>
			</FormAnnotation>
		</>
	);
}
