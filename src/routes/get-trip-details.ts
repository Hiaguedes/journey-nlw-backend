import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import "dayjs/locale/pt-br"
import dayjs from "dayjs";
import { ClientError } from "../errors/client-error";

dayjs.locale('pt-br')

export const getTripDetails = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),

        }
    }, async (request) => {
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: {
                id: true,
                destination: true,
                starts_at: true,
                ends_at: true,
                is_confirmed: true,
            }
        })

        if (!trip) throw new ClientError('Trip not found on get trip details route')

        return {
            trip,
        }
    })
}