import { api } from "@/lib/axios";
import { getWeekDays } from "@/utils/get-week-days";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useMemo, useState } from "react";
import {
	CalendarActions,
	CalendarBody,
	CalendarContainer,
	CalendarDay,
	CalendarHeader,
	CalendarTitle,
} from "./styles";

interface CalendarWeek {
	week: number;
	days: Array<{
		date: dayjs.Dayjs;
		disabled: boolean;
	}>;
}

interface BlockedDates {
	blockedWeekDays: number[];
}

interface CalendarProps {
	selectedDate?: Date | null;
	onSelectedDate: (date: Date) => void;
}

export function Calendar({ selectedDate, onSelectedDate }: CalendarProps) {
	const [currentDate, setCurrentDate] = useState(() => {
		return dayjs().set("date", 1);
	});

	const router = useRouter();

	function handlePreviousMonth() {
		const previousMonthDate = currentDate.subtract(1, "month");
		setCurrentDate(previousMonthDate);
	}

	function handleNextMonth() {
		const nextMonthDate = currentDate.add(1, "month");
		setCurrentDate(nextMonthDate);
	}

	const { data: BlockedDates } = useQuery<BlockedDates>(
		["blocked-dates", currentDate.get("year"), currentDate.get("month")],
		async () => {
			const response = await api.get(`users/${username}/blocked-dates`, {
				params: {
					year: currentDate.get("year"),
					month: currentDate.get("month"),
				},
			});

			return response.data;
		}
	);

	const calendarWeeks = useMemo(() => {
		if (!BlockedDates) {
			return [];
		}

		const daysInMonthArray = Array.from({
			length: currentDate.daysInMonth(),
		}).map((_, index) => {
			return currentDate.set("date", index + 1);
		});

		const firstWeekDay = daysInMonthArray[0].get("day");

		const previousMonthFillArray = Array.from({ length: firstWeekDay })
			.map((_, i) => {
				return currentDate.subtract(i + 1, "day");
			})
			.reverse();

		const lastWeekDay =
			6 - daysInMonthArray[daysInMonthArray.length - 1].get("day");

		const NextMonthFillArray = Array.from({ length: lastWeekDay }).map(
			(_, i) => {
				return currentDate.add(i, "day");
			}
		);

		const calendarDays = [
			...previousMonthFillArray.map((date) => {
				return {
					date,
					disabled: true,
				};
			}),
			...daysInMonthArray.map((date) => {
				return {
					date,
					disabled:
						date.endOf("day").isBefore(new Date()) ||
						BlockedDates.blockedWeekDays.includes(date.get("day")),
				};
			}),
			...NextMonthFillArray.map((date) => {
				return {
					date,
					disabled: true,
				};
			}),
		];

		const calendarWeeks = calendarDays.reduce<CalendarWeek[]>(
			(weeks, _, i, original) => {
				const weekHasEnded = i % 7 === 0;

				if (weekHasEnded) {
					weeks.push({
						week: i / 7 + 1,
						days: original.slice(i, i + 7),
					});
				}
				return weeks;
			},
			[]
		);

		return calendarWeeks;
	}, [currentDate, BlockedDates]);

	const weekDays = getWeekDays({ short: true });

	const username = String(router.query.username);

	const currentMonth = currentDate.format("MMMM");
	const currentYear = currentDate.format("YYYY");

	return (
		<CalendarContainer>
			<CalendarHeader>
				<CalendarTitle>
					{currentMonth} <span>{currentYear}</span>
				</CalendarTitle>
				<CalendarActions>
					<button onClick={handlePreviousMonth} title="Previous Month">
						<CaretLeft />
					</button>
					<button onClick={handleNextMonth} title="Next Month">
						<CaretRight />
					</button>
				</CalendarActions>
			</CalendarHeader>

			<CalendarBody>
				<thead>
					<tr>
						{weekDays.map((weekDay) => (
							<th key={weekDay}>{weekDay}.</th>
						))}
					</tr>
				</thead>
				<tbody>
					{calendarWeeks.map(({ week, days }) => {
						return (
							<tr key={week}>
								{days.map(({ date, disabled }) => (
									<td key={date.toString()}>
										<CalendarDay
											onClick={() => onSelectedDate(date.toDate())}
											disabled={disabled}
										>
											{date.get("date")}
										</CalendarDay>
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</CalendarBody>
		</CalendarContainer>
	);
}
