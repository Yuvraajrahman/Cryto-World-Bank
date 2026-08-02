import type { NotificationCategory, Prisma } from "@prisma/client";
import { requirePrisma } from "./prisma";

export type CreateNotificationInput = {
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const prisma = requirePrisma();
  return prisma.notification.create({
    data: {
      userId: input.userId,
      category: input.category,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });
}

export async function countUnread(userId: string): Promise<number> {
  const prisma = requirePrisma();
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function listNotifications(opts: {
  userId: string;
  category?: NotificationCategory;
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
}) {
  const prisma = requirePrisma();
  const limit = Math.min(Math.max(opts.limit ?? 40, 1), 100);
  const where: Prisma.NotificationWhereInput = {
    userId: opts.userId,
    ...(opts.category ? { category: opts.category } : {}),
    ...(opts.unreadOnly ? { readAt: null } : {}),
  };

  const rows = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(opts.cursor
      ? {
          cursor: { id: opts.cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: items.map((n) => ({
      id: n.id,
      category: n.category,
      title: n.title,
      body: n.body,
      href: n.href,
      read: Boolean(n.readAt),
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
    unreadCount: await countUnread(opts.userId),
  };
}

export async function markNotificationRead(userId: string, id: string, read: boolean) {
  const prisma = requirePrisma();
  const existing = await prisma.notification.findFirst({ where: { id, userId } });
  if (!existing) return null;
  return prisma.notification.update({
    where: { id },
    data: { readAt: read ? new Date() : null },
  });
}

export async function markAllNotificationsRead(userId: string) {
  const prisma = requirePrisma();
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}
