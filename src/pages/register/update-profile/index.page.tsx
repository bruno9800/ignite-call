import {
	Avatar,
	Button,
	Heading,
	MultiStep,
	Text,
	TextArea,
} from "@ignite-ui/react";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Header } from "../styles";
import { FormAnnotation, ProfileBox } from "./styles";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { buildNextAuthOptions } from "@/pages/api/auth/[...nextauth].api";
import { useSession } from "next-auth/react";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";
const updateFormSchema = z.object({
	bio: z.string(),
});

type UpdateFormData = z.infer<typeof updateFormSchema>;

export default function UpdateProfile() {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<UpdateFormData>({
		resolver: zodResolver(updateFormSchema),
	});
	const session = useSession();
	const router = useRouter();

	console.log(session);

	async function handleUpdateProfile(data: UpdateFormData) {
		await api.put("/users/profile", {
			bio: data.bio,
		});

		await router.push(`/schedule/${session.data?.user.username}`);
	}

	return (
		<Container>
			<Header>
				<Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
				<Text>
					Precisamos de algumas informações para criar seu perfil! Ah, você pode
					editar essas informações depois.
				</Text>

				<MultiStep size={4} currentStep={4} />
			</Header>

			<ProfileBox as="form" onSubmit={handleSubmit(handleUpdateProfile)}>
				<label>
					<Text size="sm">Foto de perfil</Text>
					<Avatar
						src={session?.data?.user.avatar_url}
						alt={session?.data?.user.name}
					/>
				</label>
				<label>
					<Text size="sm">Sobre você</Text>
					<TextArea {...register("bio")} />
					<FormAnnotation size="sm">
						Fale um pouco sobre você. Isto será exibido em sua página pessoal.
					</FormAnnotation>
				</label>

				<Button type="submit">
					Finalizar
					<ArrowRight weight="bold" />
				</Button>
			</ProfileBox>
		</Container>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getServerSession(
		req,
		res,
		buildNextAuthOptions(req, res)
	);
	return {
		props: {
			session,
		},
	};
};
