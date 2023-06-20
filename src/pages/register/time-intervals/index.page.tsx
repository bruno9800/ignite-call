import {
	Button,
	Checkbox,
	Heading,
	MultiStep,
	Text,
	TextInput,
} from "@ignite-ui/react";
import { Container, Header } from "../styles";
import {
	FormError,
	IntervalBox,
	IntervalDay,
	IntervalInput,
	IntervalItem,
	IntervalsContainer,
} from "./styles";
import { ArrowRight } from "phosphor-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getWeekDays } from "@/utils/get-week-days";
import { convertTimeStringToMinutes } from "@/utils/convert-time-string-to-minutes";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";

const timeIntervalsFormSchema = z.object({
	intervals: z
		.array(
			z.object({
				weekDay: z.number().min(0).max(6),
				enabled: z.boolean(),
				startTime: z.string(),
				endTime: z.string(),
			})
		)
		.length(7)
		.transform((intervals) => intervals.filter((interval) => interval.enabled))
		.refine((intervals) => intervals.length > 0, {
			message: "Você precisa selecionar pelo menos 1 dia da semana",
		})
		.transform((intervals) => {
			return intervals.map((interval) => {
				return {
					weekDay: interval.weekDay,
					startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
					endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
				};
			});
		})
		.refine(
			(intervals) => {
				return intervals.every(
					(interval) =>
						interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes
				);
			},
			{
				message: "Você precisa disponibilizar pelo menos 1h do seu dia.",
			}
		),
});

type timeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>;
type timeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>;

export default function TimeIntervals() {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		watch,
	} = useForm<timeIntervalsFormInput>({
		resolver: zodResolver(timeIntervalsFormSchema),
		defaultValues: {
			intervals: [
				{ weekDay: 0, enabled: false, startTime: "08:00", endTime: "18:00" },
				{ weekDay: 1, enabled: true, startTime: "08:00", endTime: "18:00" },
				{ weekDay: 2, enabled: true, startTime: "08:00", endTime: "18:00" },
				{ weekDay: 3, enabled: true, startTime: "08:00", endTime: "18:00" },
				{ weekDay: 4, enabled: true, startTime: "08:00", endTime: "18:00" },
				{ weekDay: 5, enabled: true, startTime: "08:00", endTime: "18:00" },
				{ weekDay: 6, enabled: false, startTime: "08:00", endTime: "18:00" },
			],
		},
	});

	const router = useRouter();

	const weekDays = getWeekDays({});

	const { fields } = useFieldArray({
		control: control,
		name: "intervals",
	});

	const intervals = watch("intervals");

	async function handleSetTimeIntervals(values: unknown) {
		const data = values as timeIntervalsFormOutput;
		const { intervals } = data;

		await api.post("/users/time-intervals", {
			intervals,
		});

		await router.push("/register/update-profile");
	}

	return (
		<Container>
			<Header>
				<Heading as="strong">Quase lá!</Heading>
				<Text>
					Defina o intervalo de horários que você está disponível em cada dia da
					semana.
				</Text>

				<MultiStep size={4} currentStep={3} />
			</Header>

			<IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
				<IntervalsContainer>
					{fields.map((field, index) => {
						return (
							<IntervalItem key={field.id}>
								<IntervalDay>
									<Controller
										name={`intervals.${index}.enabled`}
										control={control}
										render={({ field }) => {
											return (
												<Checkbox
													onCheckedChange={(checked) => {
														field.onChange(checked === true);
													}}
													checked={field.value}
												/>
											);
										}}
									/>
									<Text>{weekDays[field.weekDay]}</Text>
								</IntervalDay>
								<IntervalInput>
									<TextInput
										size="sm"
										type="time"
										step={60}
										{...register(`intervals.${index}.startTime`)}
										disabled={intervals[index].enabled === false}
									/>
									<TextInput
										size="sm"
										type="time"
										step={60}
										{...register(`intervals.${index}.endTime`)}
										disabled={intervals[index].enabled === false}
									/>
								</IntervalInput>
							</IntervalItem>
						);
					})}
				</IntervalsContainer>
				{errors.intervals && (
					<FormError size="sm">{errors.intervals.message}</FormError>
				)}
				<Button type="submit" disabled={isSubmitting}>
					Próximo passo
					<ArrowRight weight="bold" />
				</Button>
			</IntervalBox>
		</Container>
	);
}
