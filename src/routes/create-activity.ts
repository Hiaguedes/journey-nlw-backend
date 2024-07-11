import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayJsHelper } from "../lib/dayJsHelper";
import { ClientError } from "../errors/client-error";

export const createActivity = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                title: z.string(),
                occurs_at: z.coerce.date(),
            })
        }
    }, async (request, reply) => {
        const { occurs_at, title } = request.body;
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })

        if(!trip) throw new ClientError('trip not founded on create activity route');
        if(dayJsHelper(occurs_at).isBefore(trip.starts_at)) throw new ClientError('activity should not occur before trip starts!');
        if(dayJsHelper(occurs_at).isAfter(trip.ends_at)) throw new ClientError('activity should not occur before trip starts!');

        const activity = await prisma.activity.create({
            data: {
                occurs_at,
                title,
                trip_id: tripId
            }
        })

        return {
            message: `activity created with id ${activity.id}`,
        }
    })
}