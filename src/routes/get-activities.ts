import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayJsHelper } from "../lib/dayJsHelper";

export const getActivities = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
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
                activities: {
                    orderBy: {
                        occurs_at: 'asc' // se cadastrar desordenado ele ja ajuda
                    }
                }
            }
        })

        if(!trip) throw new Error('trip not founded on create activity route');

        const diffBetweenStartDayAndEndDay = dayJsHelper(trip.ends_at).diff(trip.starts_at, 'days');
        
        const activitiesArray = Array.from({ length: diffBetweenStartDayAndEndDay + 1 }); // add +1 pq vc tira o primeiro dia se nao o fizer

        const activities = activitiesArray.map((_, index) => {
            // [null, null, null], 0,1,2
            const date = dayJsHelper(trip.starts_at).add(index);

            return {
                date: date.toDate(),
                activities: trip.activities.filter(activity => {
                    return dayJsHelper(activity.occurs_at).isSame(date, 'day')
                })
            }
        })

        return {
            activities: activities
        }
    })
}