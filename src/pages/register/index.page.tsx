import { Button, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react";
import { Container, Form, FormError, Header } from "./styles";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "@/lib/axios";
import { AxiosError } from "axios";

const RegisterFormSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Mínimo de 3 caracteres" })
		.regex(/^([a-z\\0-9\\-]+)$/i, { message: "Apenas letras e hífens" })
		.transform((username) => username.toLowerCase()),
	name: z.string().min(3, { message: "Mínimo de 3 caracteres" }),
});

type RegisterFormData = z.infer<typeof RegisterFormSchema>;

export default function Register() {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(RegisterFormSchema),
	});

	const router = useRouter();

	async function handlePreRegister(data: RegisterFormData) {
		try {
			await api.post("/users", {
				name: data.name,
				username: data.username,
			});

			await router.push("/register/connect-calendar");
		} catch (err) {
			if (err instanceof AxiosError && err.response?.data?.message) {
				alert(err.response.data.message);
			} else {
				console.log(err);
			}
		}
	}

	useEffect(() => {
		setValue("username", String(router.query.username));
	}, [router.query?.username, setValue]);

	return (
		<Container>
			<Header>
				<Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
				<Text>
					Precisamos de algumas informações para criar seu perfil! Ah, você pode
					editar essas informações depois.
				</Text>

				<MultiStep size={4} currentStep={1} />
			</Header>

			<Form as="form" onSubmit={handleSubmit(handlePreRegister)}>
				<label>
					<Text size="sm">Nome de usuário</Text>
					<TextInput
						prefix="ignite.com/"
						placeholder="seu-usuario"
						{...register("username")}
					/>
					{errors.username && (
						<FormError size="sm">{errors.username.message}</FormError>
					)}
				</label>
				<label>
					<Text size="sm">Nome completo</Text>
					<TextInput placeholder="Seu nome" {...register("name")} />
					{errors.name && (
						<FormError size="sm">{errors.name.message}</FormError>
					)}
				</label>

				<Button type="submit">
					Próximo passo
					<ArrowRight weight="bold" />
				</Button>
			</Form>
		</Container>
	);
}
