import Head from "next/head";
import { Heading, Text } from "@ignite-ui/react";
import { Container, Hero, Preview } from "./styles";

import previewImage from "../../assets/app-preview.png";
import Image from "next/image";
import { ClaimUsernameForm } from "./components/ClaimUsernameForm";

export default function Home() {
	return (
		<>
			<Head>
				<title>Create Next App</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main>
				<Container>
					<Hero>
						<Heading size="4xl">Agendamento descomplicado</Heading>
						<Text size="xl">
							Conecte seu calendário e permita que as pessoas marquem
							agendamentos no seu tempo livre
						</Text>

						<ClaimUsernameForm />
					</Hero>

					<Preview>
						<Image
							src={previewImage}
							alt="Calendário simbolizando aplicação"
							height={400}
							quality={100}
							priority
						/>
					</Preview>
				</Container>
			</main>
		</>
	);
}
