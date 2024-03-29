import { Calendar } from "@/Components/Calendar";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";
import {
	Container,
	TimePicker,
	TimePickerHeader,
	TimePickerItem,
	TimePickerList,
} from "./styles";

interface Availability {
	possibleTimes: number[];
	availableTimes: number[];
}

export function CalendarStep() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	//const [availability, setAvailability] = useState<Availability | null>(null);

	const router = useRouter();
	const username = String(router.query.username);

	const isDateSelected = !!selectedDate;
	const weekDay = selectedDate ? dayjs(selectedDate).format("dddd") : null;

	const dateDescribe = selectedDate
		? dayjs(selectedDate).format("DD[ de ]MMMM")
		: null;

	const selectedDateWithoutTime = selectedDate
		? dayjs(selectedDate).format("YYYY-MM-DD")
		: null;

	const { data: availability } = useQuery<Availability>(
		["availability", selectedDateWithoutTime],
		async () => {
			const response = await api.get(`users/${username}/availability`, {
				params: {
					date: selectedDateWithoutTime,
				},
			});

			return response.data;
		},
		{
			enabled: !!selectedDate,
		}
	);

	return (
		<Container isTimePickerOpen={isDateSelected}>
			<Calendar selectedDate={selectedDate} onSelectedDate={setSelectedDate} />
			{isDateSelected && (
				<TimePicker>
					<TimePickerHeader>
						{weekDay}
						<span> {dateDescribe}</span>
					</TimePickerHeader>
					<TimePickerList>
						{availability?.possibleTimes.map((hour) => {
							return (
								<TimePickerItem
									key={hour}
									disabled={!availability.availableTimes}
								>
									{String(hour).padStart(2, "0")}
								</TimePickerItem>
							);
						})}
					</TimePickerList>
				</TimePicker>
			)}
		</Container>
	);
}
