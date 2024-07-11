import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export const getParticipants = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
        }
    }, async (request, reply) => {
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        is_confirmed: true,
                        email: true,
                    }
                }
        }})

        if(!trip) throw new ClientError('trip not founded on create activity route');

        
        return {
            participants: trip.participants
        }
    })
}