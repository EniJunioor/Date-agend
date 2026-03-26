import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  time,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ────────────────────────────────────────────────────────────────────

export const coupleThemeEnum = pgEnum("couple_theme", [
  "rosa",
  "azul",
  "verde",
  "roxo",
  "laranja",
]);

export const eventCategoryEnum = pgEnum("event_category", [
  "aniversario",
  "viagem",
  "encontro",
  "conquista",
  "especial",
  "rotina",
  "outro",
]);

export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "anual",
  "mensal",
  "semanal",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "evento_amanha",
  "evento_hoje",
  "aniversario",
  "conquista",
  "capsula",
  "mensagem",
]);

export const localeEnum = pgEnum("locale", ["pt-BR", "en", "es"]);

// ── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("email_verified"),
    password: varchar("password", { length: 255 }), // null for OAuth
    image: text("image"),
    nickname: varchar("nickname", { length: 50 }),
    locale: localeEnum("locale").default("pt-BR"),
    coupleId: uuid("couple_id").references(() => couples.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

// ── Couples ──────────────────────────────────────────────────────────────────

export const couples = pgTable("couples", {
  id: uuid("id").primaryKey().defaultRandom(),
  startDate: date("start_date").notNull(),
  theme: coupleThemeEnum("theme").default("rosa"),
  coverPhotoUrl: text("cover_photo_url"),
  bio: text("bio"),
  phrase: varchar("phrase", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Invite Codes ─────────────────────────────────────────────────────────────

export const inviteCodes = pgTable(
  "invite_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 6 }).notNull(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    used: boolean("used").default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("invite_codes_code_idx").on(t.code)]
);

// ── Events ───────────────────────────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    eventDate: date("event_date").notNull(),
    eventTime: time("event_time"),
    category: eventCategoryEnum("category").notNull(),
    moodEmoji: varchar("mood_emoji", { length: 32 }),
    isFavorite: boolean("is_favorite").default(false),
    tags: text("tags").array(),
    location: text("location"),
    color: varchar("color", { length: 7 }),
    isRecurring: boolean("is_recurring").default(false),
    recurrenceType: recurrenceTypeEnum("recurrence_type"),
    coverPhotoId: uuid("cover_photo_id"), // circular ref — set after photos created
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("events_couple_id_idx").on(t.coupleId),
    index("events_event_date_idx").on(t.eventDate),
  ]
);

// ── Photos ───────────────────────────────────────────────────────────────────

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    uploadedById: uuid("uploaded_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    publicId: varchar("public_id", { length: 255 }).notNull(), // Cloudinary
    width: integer("width"),
    height: integer("height"),
    caption: text("caption"),
    isFavorite: boolean("is_favorite").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("photos_event_id_idx").on(t.eventId)]
);

// ── Reactions ────────────────────────────────────────────────────────────────

export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").references(() => events.id, {
      onDelete: "cascade",
    }),
    photoId: uuid("photo_id").references(() => photos.id, {
      onDelete: "cascade",
    }),
    emoji: varchar("emoji", { length: 32 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

// ── Daily Messages ───────────────────────────────────────────────────────────

export const dailyMessages = pgTable("daily_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Time Capsules ────────────────────────────────────────────────────────────

export const timeCapsules = pgTable("time_capsules", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  photoUrls: text("photo_urls").array(),
  openAt: timestamp("open_at").notNull(),
  openedAt: timestamp("opened_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Achievements ─────────────────────────────────────────────────────────────

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  criteria: text("criteria").notNull(), // JSON string describing unlock condition
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coupleAchievements = pgTable(
  "couple_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("couple_achievements_unique_idx").on(
      t.coupleId,
      t.achievementId
    ),
  ]
);

// ── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body"),
    read: boolean("read").default(false),
    emailSent: boolean("email_sent").default(false),
    pushSent: boolean("push_sent").default(false),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("notifications_user_id_idx").on(t.userId)]
);

export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: boolean("email_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  remindDaysBefore: integer("remind_days_before").default(1),
  quietHoursStart: time("quiet_hours_start"),
  quietHoursEnd: time("quiet_hours_end"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ── Auth.js tables ───────────────────────────────────────────────────────────

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires").notNull(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)]
);

export const accounts = pgTable("accounts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires").notNull(),
});

// ── Cron Logs ────────────────────────────────────────────────────────────────

export const cronLogs = pgTable("cron_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobName: varchar("job_name", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // success | error
  message: text("message"),
  processedCount: integer("processed_count").default(0),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  durationMs: integer("duration_ms"),
});

// ── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  couple: one(couples, { fields: [users.coupleId], references: [couples.id] }),
  sessions: many(sessions),
  accounts: many(accounts),
  createdEvents: many(events),
  uploadedPhotos: many(photos),
  reactions: many(reactions),
  notifications: many(notifications),
  notificationSettings: one(notificationSettings),
  pushSubscriptions: many(pushSubscriptions),
}));

export const couplesRelations = relations(couples, ({ many }) => ({
  users: many(users),
  events: many(events),
  photos: many(photos),
  inviteCodes: many(inviteCodes),
  dailyMessages: many(dailyMessages),
  timeCapsules: many(timeCapsules),
  coupleAchievements: many(coupleAchievements),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  couple: one(couples, { fields: [events.coupleId], references: [couples.id] }),
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id],
  }),
  photos: many(photos),
  reactions: many(reactions),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  event: one(events, { fields: [photos.eventId], references: [events.id] }),
  couple: one(couples, { fields: [photos.coupleId], references: [couples.id] }),
  uploadedBy: one(users, {
    fields: [photos.uploadedById],
    references: [users.id],
  }),
  reactions: many(reactions),
}));

export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
  couple: one(couples, {
    fields: [inviteCodes.coupleId],
    references: [couples.id],
  }),
  createdBy: one(users, {
    fields: [inviteCodes.createdById],
    references: [users.id],
  }),
}));

export const dailyMessagesRelations = relations(dailyMessages, ({ one }) => ({
  couple: one(couples, {
    fields: [dailyMessages.coupleId],
    references: [couples.id],
  }),
  fromUser: one(users, {
    fields: [dailyMessages.fromUserId],
    references: [users.id],
  }),
}));

export const timeCapsulesRelations = relations(timeCapsules, ({ one }) => ({
  couple: one(couples, {
    fields: [timeCapsules.coupleId],
    references: [couples.id],
  }),
  createdBy: one(users, {
    fields: [timeCapsules.createdById],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  coupleAchievements: many(coupleAchievements),
}));

export const coupleAchievementsRelations = relations(
  coupleAchievements,
  ({ one }) => ({
    couple: one(couples, {
      fields: [coupleAchievements.coupleId],
      references: [couples.id],
    }),
    achievement: one(achievements, {
      fields: [coupleAchievements.achievementId],
      references: [achievements.id],
    }),
  })
);

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [reactions.eventId],
    references: [events.id],
  }),
  photo: one(photos, {
    fields: [reactions.photoId],
    references: [photos.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [notifications.eventId],
    references: [events.id],
  }),
}));

export const notificationSettingsRelations = relations(
  notificationSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationSettings.userId],
      references: [users.id],
    }),
  })
);

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
