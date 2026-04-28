// // import { PrismaClient } from '@prisma/client';
// // import { PrismaPg } from '@prisma/adapter-pg';

// // const adapter = new PrismaPg({
// //     connectionString: process.env.DATABASE_URL!,
// // });

// // let prisma: PrismaClient;

// // if (process.env.NODE_ENV === 'production') {
// //     prisma = new PrismaClient({ adapter });
// // } else {
// //     prisma = new PrismaClient({
// //         adapter
// //     });
// // }

// // export default prisma;

// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { userContext } from './user-context';

// const adapter = new PrismaPg({
//     connectionString: process.env.DATABASE_URL!,
// });

// const prismaClientSingleton = () => {
//     return new PrismaClient({ adapter }).$extends({
//         query: {
//             $allModels: {
//                 async update({ model, args, query }) {
//                     // 1. Exit early if this is the auditLog model to prevent recursion
//                     if (model === 'AuditLog') return query(args);

//                     const oldData = await (prisma as any)[model].findUnique({
//                         where: args.where,
//                     });

//                     const result = await query(args);

//                     await (prisma as any).auditLog.create({
//                         data: {
//                             entityName: model,
//                             entityId: String(args.where.id || "unknown"),
//                             action: "UPDATE",
//                             oldData: oldData as any,
//                             newData: result as any,
//                             changedBy: userContext.getStore() || "SYSTEM",
//                         },
//                     });
//                     return result;
//                 },

//                 async create({ model, args, query }) {
//                     // 1. Exit early if this is the auditLog model
//                     if (model === 'AuditLog') return query(args);

//                     const result = await query(args);

//                     await (prisma as any).auditLog.create({
//                         data: {
//                             entityName: model,
//                             entityId: String((result as any).id || "unknown"),
//                             action: "CREATE",
//                             oldData: null,
//                             newData: result as any,
//                             changedBy: userContext.getStore() || "SYSTEM",
//                         },
//                     });
//                     return result;
//                 },

//                 async delete({ model, args, query }) {
//                     // 1. Exit early if this is the auditLog model
//                     if (model === 'AuditLog') return query(args);

//                     const oldData = await (prisma as any)[model].findUnique({
//                         where: args.where,
//                     });

//                     const result = await query(args);

//                     await (prisma as any).auditLog.create({
//                         data: {
//                             entityName: model,
//                             entityId: String(args.where.id || "unknown"),
//                             action: "DELETE",
//                             oldData: oldData as any,
//                             newData: null,
//                             changedBy: userContext.getStore() || "SYSTEM",
//                         },
//                     });
//                     return result;
//                 }
//             }
//         }
//     });
// };

// declare global {
//     var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
// }

// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// export default prisma;

// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;


import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { userContext } from './user-context';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

// 1. Create the ORIGINAL client that has NO extensions
const baseClient = new PrismaClient({ adapter });

const prismaClientSingleton = () => {
    // 2. Extend the baseClient
    return baseClient.$extends({
        query: {
            $allModels: {
                async update({ model, args, query }) {
                    // Ignore these models to prevent loops and junk data
                    if (['AuditLog',
                        'Session',
                        'Account',
                        'RecentlyViewed',
                        'Wishlist',
                        'Cart'].includes(model)) {
                        return query(args);
                    }

                    const oldData = await (baseClient as any)[model].findUnique({
                        where: args.where,
                    });

                    const result = await query(args);

                    // IMPORTANT: Use baseClient here, NOT the extended one
                    await baseClient.auditLog.create({
                        data: {
                            entityName: model,
                            entityId: String(args.where.id || "unknown"),
                            action: "UPDATE",
                            oldData: JSON.parse(JSON.stringify(oldData)),
                            newData: JSON.parse(JSON.stringify(result)),
                            changedBy: userContext.getStore() || "SYSTEM",
                        },
                    });
                    return result;
                },

                async create({ model, args, query }) {
                    if (['AuditLog', 'Session', 'Account'].includes(model)) {
                        return query(args);
                    }

                    const result = await query(args);

                    // IMPORTANT: Use baseClient here to bypass the extension
                    await baseClient.auditLog.create({
                        data: {
                            entityName: model,
                            entityId: String((result as any).id || "unknown"),
                            action: "CREATE",
                            oldData: null,
                            newData: JSON.parse(JSON.stringify(result)),
                            changedBy: userContext.getStore() || "SYSTEM",
                        },
                    });
                    return result;
                },

                async delete({ model, args, query }) {
                    if (['AuditLog', 'Session', 'Account'].includes(model)) {
                        return query(args);
                    }

                    const oldData = await (baseClient as any)[model].findUnique({
                        where: args.where,
                    });

                    const result = await query(args);

                    await baseClient.auditLog.create({
                        data: {
                            entityName: model,
                            entityId: String(args.where.id || "unknown"),
                            action: "DELETE",
                            oldData: JSON.parse(JSON.stringify(oldData)),
                            newData: null,
                            changedBy: userContext.getStore() || "SYSTEM",
                        },
                    });
                    return result;
                }
            }
        }
    });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;