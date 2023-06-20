import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(req.method !== 'GET') {
    return res.status(405).end();
  }


  // https://localhost:3333/api/users/bruno9800/availability?date=2023-05-06
  const username = String(req.query.username);

  const { date } = req.query;

  if(!date) {
    return res.status(400).json({message: 'Date not provided'});
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    }
  })

  if(!user) {
    return res.status(400).json({message: 'User does not exists.'});
  }

  const referenceDate = dayjs(String(date));
  const isPastDate = referenceDate.endOf('day').isBefore(new Date()); // se data estiver no passado

  if (isPastDate) {
    return res.json({ availableTimes: [], possibleTimes: []});
  }

  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    }
  })

  if(!userAvailability) {
    return res.json({ availableTimes: [], possibleTimes: []})
  }

  const { time_start_in_minutes, time_end_in_minutes } = userAvailability;

  const startHour = time_start_in_minutes / 60; // 10
  const endHour = time_end_in_minutes / 60; // 15

  const possibleHours = Array.from({
    length: endHour - startHour //15 - 10 = 5
  }).map( (_, i) => {
    return startHour + i; // 10, 11, 12, 13, 14;
  }) 

  const blockedTimes = await prisma.scheduling.findMany({
    where: {
      user_id: user.id,
      date: {
        //greater than or equal
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      }
    }
  })

  const availableHours = possibleHours.filter(time => {
    return !blockedTimes.some(blockedTime => blockedTime.date.getHours() === time)
  })

  return res.json({ availableTimes: availableHours, possibleTimes: possibleHours});
}
