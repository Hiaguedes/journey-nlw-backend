import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import "dayjs/locale/pt-br"
import dayjs from "dayjs";
import { ClientError } from "../errors/client-error";

dayjs.locale('pt-br')

export const updateTrip = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(), // uma data que de pra converter pra Date
                ends_at: z.coerce.date(),
            })
        }
    }, async (request) => {
        const { destination, ends_at, starts_at } = request.body;
        const { tripId } = request.params;

        if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
            throw new Error('Invalid trip start date - end date is before start date');
        }

        if (dayjs(starts_at).isBefore(dayjs())) {
            throw new Error('Invalid trip start date - start is before today');
        }

        const trip = await prisma.trip.findUnique({
            where: { id: tripId }
        })

        if (!trip) throw new ClientError('Trip not found on update trip route')

        await prisma.trip.update({
            where: { id: tripId },
            data: {
                destination,
                starts_at,
                ends_at,
            }
        })

        return {
            message: `trip with id ${trip.id} updated`,
        }
    })
}