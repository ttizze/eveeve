import { z } from "zod";

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
	"ReadUncommitted",
	"ReadCommitted",
	"RepeatableRead",
	"Serializable",
]);

export const UserScalarFieldEnumSchema = z.enum([
	"id",
	"email",
	"userName",
	"displayName",
	"password",
	"icon",
	"profile",
	"plan",
	"totalPoints",
	"isAI",
	"provider",
	"geminiApiKey",
	"openAIApiKey",
	"claudeApiKey",
	"createdAt",
	"updatedAt",
]);

export const UserAITranslationInfoScalarFieldEnumSchema = z.enum([
	"id",
	"userId",
	"pageId",
	"targetLanguage",
	"aiModel",
	"aiTranslationStatus",
	"aiTranslationProgress",
	"createdAt",
]);

export const UserReadHistoryScalarFieldEnumSchema = z.enum([
	"id",
	"userId",
	"pageId",
	"readAt",
	"lastReadDataNumber",
]);

export const PageTranslationInfoScalarFieldEnumSchema = z.enum([
	"id",
	"pageId",
	"targetLanguage",
	"translationTitle",
]);

export const PageScalarFieldEnumSchema = z.enum([
	"id",
	"slug",
	"title",
	"content",
	"sourceLanguage",
	"isPublished",
	"isArchived",
	"createdAt",
	"updatedAt",
	"userId",
]);

export const LikePageScalarFieldEnumSchema = z.enum([
	"id",
	"userId",
	"pageId",
	"createdAt",
]);

export const GenreScalarFieldEnumSchema = z.enum(["id", "name"]);

export const GenrePageScalarFieldEnumSchema = z.enum(["genreId", "pageId"]);

export const TagScalarFieldEnumSchema = z.enum(["id", "name"]);

export const TagPageScalarFieldEnumSchema = z.enum(["tagId", "pageId"]);

export const SourceTextScalarFieldEnumSchema = z.enum([
	"id",
	"text",
	"number",
	"pageId",
	"createdAt",
]);

export const TranslateTextScalarFieldEnumSchema = z.enum([
	"id",
	"targetLanguage",
	"text",
	"sourceTextId",
	"userId",
	"point",
	"isArchived",
	"createdAt",
]);

export const VoteScalarFieldEnumSchema = z.enum([
	"id",
	"userId",
	"translateTextId",
	"isUpvote",
	"createdAt",
	"updatedAt",
]);

export const ApiUsageScalarFieldEnumSchema = z.enum([
	"id",
	"userId",
	"dateTime",
	"amountUsed",
]);

export const CustomAIModelScalarFieldEnumSchema = z.enum([
	"id",
	"userId",
	"name",
	"apiKey",
	"isActive",
	"createdAt",
	"updatedAt",
]);

export const SortOrderSchema = z.enum(["asc", "desc"]);

export const QueryModeSchema = z.enum(["default", "insensitive"]);

export const NullsOrderSchema = z.enum(["first", "last"]);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
	id: z.number(),
	email: z.string(),
	userName: z.string(),
	displayName: z.string(),
	password: z.string().nullable(),
	icon: z.string(),
	profile: z.string(),
	plan: z.string(),
	totalPoints: z.number(),
	isAI: z.boolean(),
	provider: z.string(),
	geminiApiKey: z.string().nullable(),
	openAIApiKey: z.string().nullable(),
	claudeApiKey: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

/////////////////////////////////////////
// USER PARTIAL SCHEMA
/////////////////////////////////////////

export const UserPartialSchema = UserSchema.partial();

export type UserPartial = z.infer<typeof UserPartialSchema>;

// USER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserOptionalDefaultsSchema = UserSchema.merge(
	z.object({
		id: z.number().optional(),
		profile: z.string().optional(),
		plan: z.string().optional(),
		totalPoints: z.number().optional(),
		isAI: z.boolean().optional(),
		provider: z.string().optional(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	}),
);

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>;

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
	pages: PageWithRelations[];
	userReadHistory: UserReadHistoryWithRelations[];
	apiUsages: ApiUsageWithRelations[];
	translations: TranslateTextWithRelations[];
	votes: VoteWithRelations[];
	userAITranslationInfo: UserAITranslationInfoWithRelations[];
	customAIModels: CustomAIModelWithRelations[];
	likePages: LikePageWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations;

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> =
	UserSchema.merge(
		z.object({
			pages: z.lazy(() => PageWithRelationsSchema).array(),
			userReadHistory: z.lazy(() => UserReadHistoryWithRelationsSchema).array(),
			apiUsages: z.lazy(() => ApiUsageWithRelationsSchema).array(),
			translations: z.lazy(() => TranslateTextWithRelationsSchema).array(),
			votes: z.lazy(() => VoteWithRelationsSchema).array(),
			userAITranslationInfo: z
				.lazy(() => UserAITranslationInfoWithRelationsSchema)
				.array(),
			customAIModels: z.lazy(() => CustomAIModelWithRelationsSchema).array(),
			likePages: z.lazy(() => LikePageWithRelationsSchema).array(),
		}),
	);

// USER OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserOptionalDefaultsRelations = {
	pages: PageOptionalDefaultsWithRelations[];
	userReadHistory: UserReadHistoryOptionalDefaultsWithRelations[];
	apiUsages: ApiUsageOptionalDefaultsWithRelations[];
	translations: TranslateTextOptionalDefaultsWithRelations[];
	votes: VoteOptionalDefaultsWithRelations[];
	userAITranslationInfo: UserAITranslationInfoOptionalDefaultsWithRelations[];
	customAIModels: CustomAIModelOptionalDefaultsWithRelations[];
	likePages: LikePageOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<
	typeof UserOptionalDefaultsSchema
> &
	UserOptionalDefaultsRelations;

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> =
	UserOptionalDefaultsSchema.merge(
		z.object({
			pages: z.lazy(() => PageOptionalDefaultsWithRelationsSchema).array(),
			userReadHistory: z
				.lazy(() => UserReadHistoryOptionalDefaultsWithRelationsSchema)
				.array(),
			apiUsages: z
				.lazy(() => ApiUsageOptionalDefaultsWithRelationsSchema)
				.array(),
			translations: z
				.lazy(() => TranslateTextOptionalDefaultsWithRelationsSchema)
				.array(),
			votes: z.lazy(() => VoteOptionalDefaultsWithRelationsSchema).array(),
			userAITranslationInfo: z
				.lazy(() => UserAITranslationInfoOptionalDefaultsWithRelationsSchema)
				.array(),
			customAIModels: z
				.lazy(() => CustomAIModelOptionalDefaultsWithRelationsSchema)
				.array(),
			likePages: z
				.lazy(() => LikePageOptionalDefaultsWithRelationsSchema)
				.array(),
		}),
	);

// USER PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type UserPartialRelations = {
	pages?: PagePartialWithRelations[];
	userReadHistory?: UserReadHistoryPartialWithRelations[];
	apiUsages?: ApiUsagePartialWithRelations[];
	translations?: TranslateTextPartialWithRelations[];
	votes?: VotePartialWithRelations[];
	userAITranslationInfo?: UserAITranslationInfoPartialWithRelations[];
	customAIModels?: CustomAIModelPartialWithRelations[];
	likePages?: LikePagePartialWithRelations[];
};

export type UserPartialWithRelations = z.infer<typeof UserPartialSchema> &
	UserPartialRelations;

export const UserPartialWithRelationsSchema: z.ZodType<UserPartialWithRelations> =
	UserPartialSchema.merge(
		z.object({
			pages: z.lazy(() => PagePartialWithRelationsSchema).array(),
			userReadHistory: z
				.lazy(() => UserReadHistoryPartialWithRelationsSchema)
				.array(),
			apiUsages: z.lazy(() => ApiUsagePartialWithRelationsSchema).array(),
			translations: z
				.lazy(() => TranslateTextPartialWithRelationsSchema)
				.array(),
			votes: z.lazy(() => VotePartialWithRelationsSchema).array(),
			userAITranslationInfo: z
				.lazy(() => UserAITranslationInfoPartialWithRelationsSchema)
				.array(),
			customAIModels: z
				.lazy(() => CustomAIModelPartialWithRelationsSchema)
				.array(),
			likePages: z.lazy(() => LikePagePartialWithRelationsSchema).array(),
		}),
	).partial();

export type UserOptionalDefaultsWithPartialRelations = z.infer<
	typeof UserOptionalDefaultsSchema
> &
	UserPartialRelations;

export const UserOptionalDefaultsWithPartialRelationsSchema: z.ZodType<UserOptionalDefaultsWithPartialRelations> =
	UserOptionalDefaultsSchema.merge(
		z
			.object({
				pages: z.lazy(() => PagePartialWithRelationsSchema).array(),
				userReadHistory: z
					.lazy(() => UserReadHistoryPartialWithRelationsSchema)
					.array(),
				apiUsages: z.lazy(() => ApiUsagePartialWithRelationsSchema).array(),
				translations: z
					.lazy(() => TranslateTextPartialWithRelationsSchema)
					.array(),
				votes: z.lazy(() => VotePartialWithRelationsSchema).array(),
				userAITranslationInfo: z
					.lazy(() => UserAITranslationInfoPartialWithRelationsSchema)
					.array(),
				customAIModels: z
					.lazy(() => CustomAIModelPartialWithRelationsSchema)
					.array(),
				likePages: z.lazy(() => LikePagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

export type UserWithPartialRelations = z.infer<typeof UserSchema> &
	UserPartialRelations;

export const UserWithPartialRelationsSchema: z.ZodType<UserWithPartialRelations> =
	UserSchema.merge(
		z
			.object({
				pages: z.lazy(() => PagePartialWithRelationsSchema).array(),
				userReadHistory: z
					.lazy(() => UserReadHistoryPartialWithRelationsSchema)
					.array(),
				apiUsages: z.lazy(() => ApiUsagePartialWithRelationsSchema).array(),
				translations: z
					.lazy(() => TranslateTextPartialWithRelationsSchema)
					.array(),
				votes: z.lazy(() => VotePartialWithRelationsSchema).array(),
				userAITranslationInfo: z
					.lazy(() => UserAITranslationInfoPartialWithRelationsSchema)
					.array(),
				customAIModels: z
					.lazy(() => CustomAIModelPartialWithRelationsSchema)
					.array(),
				likePages: z.lazy(() => LikePagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

/////////////////////////////////////////
// USER AI TRANSLATION INFO SCHEMA
/////////////////////////////////////////

export const UserAITranslationInfoSchema = z.object({
	id: z.number(),
	userId: z.number(),
	pageId: z.number(),
	targetLanguage: z.string(),
	aiModel: z.string(),
	aiTranslationStatus: z.string(),
	aiTranslationProgress: z.number(),
	createdAt: z.coerce.date(),
});

export type UserAITranslationInfo = z.infer<typeof UserAITranslationInfoSchema>;

/////////////////////////////////////////
// USER AI TRANSLATION INFO PARTIAL SCHEMA
/////////////////////////////////////////

export const UserAITranslationInfoPartialSchema =
	UserAITranslationInfoSchema.partial();

export type UserAITranslationInfoPartial = z.infer<
	typeof UserAITranslationInfoPartialSchema
>;

// USER AI TRANSLATION INFO OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserAITranslationInfoOptionalDefaultsSchema =
	UserAITranslationInfoSchema.merge(
		z.object({
			id: z.number().optional(),
			aiTranslationStatus: z.string().optional(),
			aiTranslationProgress: z.number().optional(),
			createdAt: z.coerce.date().optional(),
		}),
	);

export type UserAITranslationInfoOptionalDefaults = z.infer<
	typeof UserAITranslationInfoOptionalDefaultsSchema
>;

// USER AI TRANSLATION INFO RELATION SCHEMA
//------------------------------------------------------

export type UserAITranslationInfoRelations = {
	user: UserWithRelations;
	page: PageWithRelations;
};

export type UserAITranslationInfoWithRelations = z.infer<
	typeof UserAITranslationInfoSchema
> &
	UserAITranslationInfoRelations;

export const UserAITranslationInfoWithRelationsSchema: z.ZodType<UserAITranslationInfoWithRelations> =
	UserAITranslationInfoSchema.merge(
		z.object({
			user: z.lazy(() => UserWithRelationsSchema),
			page: z.lazy(() => PageWithRelationsSchema),
		}),
	);

// USER AI TRANSLATION INFO OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserAITranslationInfoOptionalDefaultsRelations = {
	user: UserOptionalDefaultsWithRelations;
	page: PageOptionalDefaultsWithRelations;
};

export type UserAITranslationInfoOptionalDefaultsWithRelations = z.infer<
	typeof UserAITranslationInfoOptionalDefaultsSchema
> &
	UserAITranslationInfoOptionalDefaultsRelations;

export const UserAITranslationInfoOptionalDefaultsWithRelationsSchema: z.ZodType<UserAITranslationInfoOptionalDefaultsWithRelations> =
	UserAITranslationInfoOptionalDefaultsSchema.merge(
		z.object({
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
			page: z.lazy(() => PageOptionalDefaultsWithRelationsSchema),
		}),
	);

// USER AI TRANSLATION INFO PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type UserAITranslationInfoPartialRelations = {
	user?: UserPartialWithRelations;
	page?: PagePartialWithRelations;
};

export type UserAITranslationInfoPartialWithRelations = z.infer<
	typeof UserAITranslationInfoPartialSchema
> &
	UserAITranslationInfoPartialRelations;

export const UserAITranslationInfoPartialWithRelationsSchema: z.ZodType<UserAITranslationInfoPartialWithRelations> =
	UserAITranslationInfoPartialSchema.merge(
		z.object({
			user: z.lazy(() => UserPartialWithRelationsSchema),
			page: z.lazy(() => PagePartialWithRelationsSchema),
		}),
	).partial();

export type UserAITranslationInfoOptionalDefaultsWithPartialRelations = z.infer<
	typeof UserAITranslationInfoOptionalDefaultsSchema
> &
	UserAITranslationInfoPartialRelations;

export const UserAITranslationInfoOptionalDefaultsWithPartialRelationsSchema: z.ZodType<UserAITranslationInfoOptionalDefaultsWithPartialRelations> =
	UserAITranslationInfoOptionalDefaultsSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

export type UserAITranslationInfoWithPartialRelations = z.infer<
	typeof UserAITranslationInfoSchema
> &
	UserAITranslationInfoPartialRelations;

export const UserAITranslationInfoWithPartialRelationsSchema: z.ZodType<UserAITranslationInfoWithPartialRelations> =
	UserAITranslationInfoSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// USER READ HISTORY SCHEMA
/////////////////////////////////////////

export const UserReadHistorySchema = z.object({
	id: z.number(),
	userId: z.number(),
	pageId: z.number(),
	readAt: z.coerce.date(),
	lastReadDataNumber: z.number(),
});

export type UserReadHistory = z.infer<typeof UserReadHistorySchema>;

/////////////////////////////////////////
// USER READ HISTORY PARTIAL SCHEMA
/////////////////////////////////////////

export const UserReadHistoryPartialSchema = UserReadHistorySchema.partial();

export type UserReadHistoryPartial = z.infer<
	typeof UserReadHistoryPartialSchema
>;

// USER READ HISTORY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserReadHistoryOptionalDefaultsSchema =
	UserReadHistorySchema.merge(
		z.object({
			id: z.number().optional(),
			readAt: z.coerce.date().optional(),
			lastReadDataNumber: z.number().optional(),
		}),
	);

export type UserReadHistoryOptionalDefaults = z.infer<
	typeof UserReadHistoryOptionalDefaultsSchema
>;

// USER READ HISTORY RELATION SCHEMA
//------------------------------------------------------

export type UserReadHistoryRelations = {
	user: UserWithRelations;
	page: PageWithRelations;
};

export type UserReadHistoryWithRelations = z.infer<
	typeof UserReadHistorySchema
> &
	UserReadHistoryRelations;

export const UserReadHistoryWithRelationsSchema: z.ZodType<UserReadHistoryWithRelations> =
	UserReadHistorySchema.merge(
		z.object({
			user: z.lazy(() => UserWithRelationsSchema),
			page: z.lazy(() => PageWithRelationsSchema),
		}),
	);

// USER READ HISTORY OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserReadHistoryOptionalDefaultsRelations = {
	user: UserOptionalDefaultsWithRelations;
	page: PageOptionalDefaultsWithRelations;
};

export type UserReadHistoryOptionalDefaultsWithRelations = z.infer<
	typeof UserReadHistoryOptionalDefaultsSchema
> &
	UserReadHistoryOptionalDefaultsRelations;

export const UserReadHistoryOptionalDefaultsWithRelationsSchema: z.ZodType<UserReadHistoryOptionalDefaultsWithRelations> =
	UserReadHistoryOptionalDefaultsSchema.merge(
		z.object({
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
			page: z.lazy(() => PageOptionalDefaultsWithRelationsSchema),
		}),
	);

// USER READ HISTORY PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type UserReadHistoryPartialRelations = {
	user?: UserPartialWithRelations;
	page?: PagePartialWithRelations;
};

export type UserReadHistoryPartialWithRelations = z.infer<
	typeof UserReadHistoryPartialSchema
> &
	UserReadHistoryPartialRelations;

export const UserReadHistoryPartialWithRelationsSchema: z.ZodType<UserReadHistoryPartialWithRelations> =
	UserReadHistoryPartialSchema.merge(
		z.object({
			user: z.lazy(() => UserPartialWithRelationsSchema),
			page: z.lazy(() => PagePartialWithRelationsSchema),
		}),
	).partial();

export type UserReadHistoryOptionalDefaultsWithPartialRelations = z.infer<
	typeof UserReadHistoryOptionalDefaultsSchema
> &
	UserReadHistoryPartialRelations;

export const UserReadHistoryOptionalDefaultsWithPartialRelationsSchema: z.ZodType<UserReadHistoryOptionalDefaultsWithPartialRelations> =
	UserReadHistoryOptionalDefaultsSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

export type UserReadHistoryWithPartialRelations = z.infer<
	typeof UserReadHistorySchema
> &
	UserReadHistoryPartialRelations;

export const UserReadHistoryWithPartialRelationsSchema: z.ZodType<UserReadHistoryWithPartialRelations> =
	UserReadHistorySchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// PAGE TRANSLATION INFO SCHEMA
/////////////////////////////////////////

export const PageTranslationInfoSchema = z.object({
	id: z.number(),
	pageId: z.number(),
	targetLanguage: z.string(),
	translationTitle: z.string(),
});

export type PageTranslationInfo = z.infer<typeof PageTranslationInfoSchema>;

/////////////////////////////////////////
// PAGE TRANSLATION INFO PARTIAL SCHEMA
/////////////////////////////////////////

export const PageTranslationInfoPartialSchema =
	PageTranslationInfoSchema.partial();

export type PageTranslationInfoPartial = z.infer<
	typeof PageTranslationInfoPartialSchema
>;

// PAGE TRANSLATION INFO OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PageTranslationInfoOptionalDefaultsSchema =
	PageTranslationInfoSchema.merge(
		z.object({
			id: z.number().optional(),
		}),
	);

export type PageTranslationInfoOptionalDefaults = z.infer<
	typeof PageTranslationInfoOptionalDefaultsSchema
>;

// PAGE TRANSLATION INFO RELATION SCHEMA
//------------------------------------------------------

export type PageTranslationInfoRelations = {
	page: PageWithRelations;
};

export type PageTranslationInfoWithRelations = z.infer<
	typeof PageTranslationInfoSchema
> &
	PageTranslationInfoRelations;

export const PageTranslationInfoWithRelationsSchema: z.ZodType<PageTranslationInfoWithRelations> =
	PageTranslationInfoSchema.merge(
		z.object({
			page: z.lazy(() => PageWithRelationsSchema),
		}),
	);

// PAGE TRANSLATION INFO OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type PageTranslationInfoOptionalDefaultsRelations = {
	page: PageOptionalDefaultsWithRelations;
};

export type PageTranslationInfoOptionalDefaultsWithRelations = z.infer<
	typeof PageTranslationInfoOptionalDefaultsSchema
> &
	PageTranslationInfoOptionalDefaultsRelations;

export const PageTranslationInfoOptionalDefaultsWithRelationsSchema: z.ZodType<PageTranslationInfoOptionalDefaultsWithRelations> =
	PageTranslationInfoOptionalDefaultsSchema.merge(
		z.object({
			page: z.lazy(() => PageOptionalDefaultsWithRelationsSchema),
		}),
	);

// PAGE TRANSLATION INFO PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type PageTranslationInfoPartialRelations = {
	page?: PagePartialWithRelations;
};

export type PageTranslationInfoPartialWithRelations = z.infer<
	typeof PageTranslationInfoPartialSchema
> &
	PageTranslationInfoPartialRelations;

export const PageTranslationInfoPartialWithRelationsSchema: z.ZodType<PageTranslationInfoPartialWithRelations> =
	PageTranslationInfoPartialSchema.merge(
		z.object({
			page: z.lazy(() => PagePartialWithRelationsSchema),
		}),
	).partial();

export type PageTranslationInfoOptionalDefaultsWithPartialRelations = z.infer<
	typeof PageTranslationInfoOptionalDefaultsSchema
> &
	PageTranslationInfoPartialRelations;

export const PageTranslationInfoOptionalDefaultsWithPartialRelationsSchema: z.ZodType<PageTranslationInfoOptionalDefaultsWithPartialRelations> =
	PageTranslationInfoOptionalDefaultsSchema.merge(
		z
			.object({
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

export type PageTranslationInfoWithPartialRelations = z.infer<
	typeof PageTranslationInfoSchema
> &
	PageTranslationInfoPartialRelations;

export const PageTranslationInfoWithPartialRelationsSchema: z.ZodType<PageTranslationInfoWithPartialRelations> =
	PageTranslationInfoSchema.merge(
		z
			.object({
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// PAGE SCHEMA
/////////////////////////////////////////

export const PageSchema = z.object({
	id: z.number(),
	slug: z.string(),
	title: z.string(),
	content: z.string(),
	sourceLanguage: z.string(),
	isPublished: z.boolean(),
	isArchived: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	userId: z.number(),
});

export type Page = z.infer<typeof PageSchema>;

/////////////////////////////////////////
// PAGE PARTIAL SCHEMA
/////////////////////////////////////////

export const PagePartialSchema = PageSchema.partial();

export type PagePartial = z.infer<typeof PagePartialSchema>;

// PAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const PageOptionalDefaultsSchema = PageSchema.merge(
	z.object({
		id: z.number().optional(),
		sourceLanguage: z.string().optional(),
		isPublished: z.boolean().optional(),
		isArchived: z.boolean().optional(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	}),
);

export type PageOptionalDefaults = z.infer<typeof PageOptionalDefaultsSchema>;

// PAGE RELATION SCHEMA
//------------------------------------------------------

export type PageRelations = {
	user: UserWithRelations;
	userAITranslationInfo: UserAITranslationInfoWithRelations[];
	sourceTexts: SourceTextWithRelations[];
	pageTranslationInfo: PageTranslationInfoWithRelations[];
	userReadHistory: UserReadHistoryWithRelations[];
	genrePages: GenrePageWithRelations[];
	tagPages: TagPageWithRelations[];
	likePages: LikePageWithRelations[];
};

export type PageWithRelations = z.infer<typeof PageSchema> & PageRelations;

export const PageWithRelationsSchema: z.ZodType<PageWithRelations> =
	PageSchema.merge(
		z.object({
			user: z.lazy(() => UserWithRelationsSchema),
			userAITranslationInfo: z
				.lazy(() => UserAITranslationInfoWithRelationsSchema)
				.array(),
			sourceTexts: z.lazy(() => SourceTextWithRelationsSchema).array(),
			pageTranslationInfo: z
				.lazy(() => PageTranslationInfoWithRelationsSchema)
				.array(),
			userReadHistory: z.lazy(() => UserReadHistoryWithRelationsSchema).array(),
			genrePages: z.lazy(() => GenrePageWithRelationsSchema).array(),
			tagPages: z.lazy(() => TagPageWithRelationsSchema).array(),
			likePages: z.lazy(() => LikePageWithRelationsSchema).array(),
		}),
	);

// PAGE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type PageOptionalDefaultsRelations = {
	user: UserOptionalDefaultsWithRelations;
	userAITranslationInfo: UserAITranslationInfoOptionalDefaultsWithRelations[];
	sourceTexts: SourceTextOptionalDefaultsWithRelations[];
	pageTranslationInfo: PageTranslationInfoOptionalDefaultsWithRelations[];
	userReadHistory: UserReadHistoryOptionalDefaultsWithRelations[];
	genrePages: GenrePageOptionalDefaultsWithRelations[];
	tagPages: TagPageOptionalDefaultsWithRelations[];
	likePages: LikePageOptionalDefaultsWithRelations[];
};

export type PageOptionalDefaultsWithRelations = z.infer<
	typeof PageOptionalDefaultsSchema
> &
	PageOptionalDefaultsRelations;

export const PageOptionalDefaultsWithRelationsSchema: z.ZodType<PageOptionalDefaultsWithRelations> =
	PageOptionalDefaultsSchema.merge(
		z.object({
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
			userAITranslationInfo: z
				.lazy(() => UserAITranslationInfoOptionalDefaultsWithRelationsSchema)
				.array(),
			sourceTexts: z
				.lazy(() => SourceTextOptionalDefaultsWithRelationsSchema)
				.array(),
			pageTranslationInfo: z
				.lazy(() => PageTranslationInfoOptionalDefaultsWithRelationsSchema)
				.array(),
			userReadHistory: z
				.lazy(() => UserReadHistoryOptionalDefaultsWithRelationsSchema)
				.array(),
			genrePages: z
				.lazy(() => GenrePageOptionalDefaultsWithRelationsSchema)
				.array(),
			tagPages: z
				.lazy(() => TagPageOptionalDefaultsWithRelationsSchema)
				.array(),
			likePages: z
				.lazy(() => LikePageOptionalDefaultsWithRelationsSchema)
				.array(),
		}),
	);

// PAGE PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type PagePartialRelations = {
	user?: UserPartialWithRelations;
	userAITranslationInfo?: UserAITranslationInfoPartialWithRelations[];
	sourceTexts?: SourceTextPartialWithRelations[];
	pageTranslationInfo?: PageTranslationInfoPartialWithRelations[];
	userReadHistory?: UserReadHistoryPartialWithRelations[];
	genrePages?: GenrePagePartialWithRelations[];
	tagPages?: TagPagePartialWithRelations[];
	likePages?: LikePagePartialWithRelations[];
};

export type PagePartialWithRelations = z.infer<typeof PagePartialSchema> &
	PagePartialRelations;

export const PagePartialWithRelationsSchema: z.ZodType<PagePartialWithRelations> =
	PagePartialSchema.merge(
		z.object({
			user: z.lazy(() => UserPartialWithRelationsSchema),
			userAITranslationInfo: z
				.lazy(() => UserAITranslationInfoPartialWithRelationsSchema)
				.array(),
			sourceTexts: z.lazy(() => SourceTextPartialWithRelationsSchema).array(),
			pageTranslationInfo: z
				.lazy(() => PageTranslationInfoPartialWithRelationsSchema)
				.array(),
			userReadHistory: z
				.lazy(() => UserReadHistoryPartialWithRelationsSchema)
				.array(),
			genrePages: z.lazy(() => GenrePagePartialWithRelationsSchema).array(),
			tagPages: z.lazy(() => TagPagePartialWithRelationsSchema).array(),
			likePages: z.lazy(() => LikePagePartialWithRelationsSchema).array(),
		}),
	).partial();

export type PageOptionalDefaultsWithPartialRelations = z.infer<
	typeof PageOptionalDefaultsSchema
> &
	PagePartialRelations;

export const PageOptionalDefaultsWithPartialRelationsSchema: z.ZodType<PageOptionalDefaultsWithPartialRelations> =
	PageOptionalDefaultsSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				userAITranslationInfo: z
					.lazy(() => UserAITranslationInfoPartialWithRelationsSchema)
					.array(),
				sourceTexts: z.lazy(() => SourceTextPartialWithRelationsSchema).array(),
				pageTranslationInfo: z
					.lazy(() => PageTranslationInfoPartialWithRelationsSchema)
					.array(),
				userReadHistory: z
					.lazy(() => UserReadHistoryPartialWithRelationsSchema)
					.array(),
				genrePages: z.lazy(() => GenrePagePartialWithRelationsSchema).array(),
				tagPages: z.lazy(() => TagPagePartialWithRelationsSchema).array(),
				likePages: z.lazy(() => LikePagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

export type PageWithPartialRelations = z.infer<typeof PageSchema> &
	PagePartialRelations;

export const PageWithPartialRelationsSchema: z.ZodType<PageWithPartialRelations> =
	PageSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				userAITranslationInfo: z
					.lazy(() => UserAITranslationInfoPartialWithRelationsSchema)
					.array(),
				sourceTexts: z.lazy(() => SourceTextPartialWithRelationsSchema).array(),
				pageTranslationInfo: z
					.lazy(() => PageTranslationInfoPartialWithRelationsSchema)
					.array(),
				userReadHistory: z
					.lazy(() => UserReadHistoryPartialWithRelationsSchema)
					.array(),
				genrePages: z.lazy(() => GenrePagePartialWithRelationsSchema).array(),
				tagPages: z.lazy(() => TagPagePartialWithRelationsSchema).array(),
				likePages: z.lazy(() => LikePagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

/////////////////////////////////////////
// LIKE PAGE SCHEMA
/////////////////////////////////////////

export const LikePageSchema = z.object({
	id: z.number(),
	userId: z.number(),
	pageId: z.number(),
	createdAt: z.coerce.date(),
});

export type LikePage = z.infer<typeof LikePageSchema>;

/////////////////////////////////////////
// LIKE PAGE PARTIAL SCHEMA
/////////////////////////////////////////

export const LikePagePartialSchema = LikePageSchema.partial();

export type LikePagePartial = z.infer<typeof LikePagePartialSchema>;

// LIKE PAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const LikePageOptionalDefaultsSchema = LikePageSchema.merge(
	z.object({
		id: z.number().optional(),
		createdAt: z.coerce.date().optional(),
	}),
);

export type LikePageOptionalDefaults = z.infer<
	typeof LikePageOptionalDefaultsSchema
>;

// LIKE PAGE RELATION SCHEMA
//------------------------------------------------------

export type LikePageRelations = {
	user: UserWithRelations;
	page: PageWithRelations;
};

export type LikePageWithRelations = z.infer<typeof LikePageSchema> &
	LikePageRelations;

export const LikePageWithRelationsSchema: z.ZodType<LikePageWithRelations> =
	LikePageSchema.merge(
		z.object({
			user: z.lazy(() => UserWithRelationsSchema),
			page: z.lazy(() => PageWithRelationsSchema),
		}),
	);

// LIKE PAGE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type LikePageOptionalDefaultsRelations = {
	user: UserOptionalDefaultsWithRelations;
	page: PageOptionalDefaultsWithRelations;
};

export type LikePageOptionalDefaultsWithRelations = z.infer<
	typeof LikePageOptionalDefaultsSchema
> &
	LikePageOptionalDefaultsRelations;

export const LikePageOptionalDefaultsWithRelationsSchema: z.ZodType<LikePageOptionalDefaultsWithRelations> =
	LikePageOptionalDefaultsSchema.merge(
		z.object({
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
			page: z.lazy(() => PageOptionalDefaultsWithRelationsSchema),
		}),
	);

// LIKE PAGE PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type LikePagePartialRelations = {
	user?: UserPartialWithRelations;
	page?: PagePartialWithRelations;
};

export type LikePagePartialWithRelations = z.infer<
	typeof LikePagePartialSchema
> &
	LikePagePartialRelations;

export const LikePagePartialWithRelationsSchema: z.ZodType<LikePagePartialWithRelations> =
	LikePagePartialSchema.merge(
		z.object({
			user: z.lazy(() => UserPartialWithRelationsSchema),
			page: z.lazy(() => PagePartialWithRelationsSchema),
		}),
	).partial();

export type LikePageOptionalDefaultsWithPartialRelations = z.infer<
	typeof LikePageOptionalDefaultsSchema
> &
	LikePagePartialRelations;

export const LikePageOptionalDefaultsWithPartialRelationsSchema: z.ZodType<LikePageOptionalDefaultsWithPartialRelations> =
	LikePageOptionalDefaultsSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

export type LikePageWithPartialRelations = z.infer<typeof LikePageSchema> &
	LikePagePartialRelations;

export const LikePageWithPartialRelationsSchema: z.ZodType<LikePageWithPartialRelations> =
	LikePageSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// GENRE SCHEMA
/////////////////////////////////////////

export const GenreSchema = z.object({
	id: z.number(),
	name: z.string(),
});

export type Genre = z.infer<typeof GenreSchema>;

/////////////////////////////////////////
// GENRE PARTIAL SCHEMA
/////////////////////////////////////////

export const GenrePartialSchema = GenreSchema.partial();

export type GenrePartial = z.infer<typeof GenrePartialSchema>;

// GENRE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const GenreOptionalDefaultsSchema = GenreSchema.merge(
	z.object({
		id: z.number().optional(),
	}),
);

export type GenreOptionalDefaults = z.infer<typeof GenreOptionalDefaultsSchema>;

// GENRE RELATION SCHEMA
//------------------------------------------------------

export type GenreRelations = {
	pages: GenrePageWithRelations[];
};

export type GenreWithRelations = z.infer<typeof GenreSchema> & GenreRelations;

export const GenreWithRelationsSchema: z.ZodType<GenreWithRelations> =
	GenreSchema.merge(
		z.object({
			pages: z.lazy(() => GenrePageWithRelationsSchema).array(),
		}),
	);

// GENRE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type GenreOptionalDefaultsRelations = {
	pages: GenrePageOptionalDefaultsWithRelations[];
};

export type GenreOptionalDefaultsWithRelations = z.infer<
	typeof GenreOptionalDefaultsSchema
> &
	GenreOptionalDefaultsRelations;

export const GenreOptionalDefaultsWithRelationsSchema: z.ZodType<GenreOptionalDefaultsWithRelations> =
	GenreOptionalDefaultsSchema.merge(
		z.object({
			pages: z.lazy(() => GenrePageOptionalDefaultsWithRelationsSchema).array(),
		}),
	);

// GENRE PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type GenrePartialRelations = {
	pages?: GenrePagePartialWithRelations[];
};

export type GenrePartialWithRelations = z.infer<typeof GenrePartialSchema> &
	GenrePartialRelations;

export const GenrePartialWithRelationsSchema: z.ZodType<GenrePartialWithRelations> =
	GenrePartialSchema.merge(
		z.object({
			pages: z.lazy(() => GenrePagePartialWithRelationsSchema).array(),
		}),
	).partial();

export type GenreOptionalDefaultsWithPartialRelations = z.infer<
	typeof GenreOptionalDefaultsSchema
> &
	GenrePartialRelations;

export const GenreOptionalDefaultsWithPartialRelationsSchema: z.ZodType<GenreOptionalDefaultsWithPartialRelations> =
	GenreOptionalDefaultsSchema.merge(
		z
			.object({
				pages: z.lazy(() => GenrePagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

export type GenreWithPartialRelations = z.infer<typeof GenreSchema> &
	GenrePartialRelations;

export const GenreWithPartialRelationsSchema: z.ZodType<GenreWithPartialRelations> =
	GenreSchema.merge(
		z
			.object({
				pages: z.lazy(() => GenrePagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

/////////////////////////////////////////
// GENRE PAGE SCHEMA
/////////////////////////////////////////

export const GenrePageSchema = z.object({
	genreId: z.number(),
	pageId: z.number(),
});

export type GenrePage = z.infer<typeof GenrePageSchema>;

/////////////////////////////////////////
// GENRE PAGE PARTIAL SCHEMA
/////////////////////////////////////////

export const GenrePagePartialSchema = GenrePageSchema.partial();

export type GenrePagePartial = z.infer<typeof GenrePagePartialSchema>;

// GENRE PAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const GenrePageOptionalDefaultsSchema = GenrePageSchema.merge(
	z.object({}),
);

export type GenrePageOptionalDefaults = z.infer<
	typeof GenrePageOptionalDefaultsSchema
>;

// GENRE PAGE RELATION SCHEMA
//------------------------------------------------------

export type GenrePageRelations = {
	genre: GenreWithRelations;
	page: PageWithRelations;
};

export type GenrePageWithRelations = z.infer<typeof GenrePageSchema> &
	GenrePageRelations;

export const GenrePageWithRelationsSchema: z.ZodType<GenrePageWithRelations> =
	GenrePageSchema.merge(
		z.object({
			genre: z.lazy(() => GenreWithRelationsSchema),
			page: z.lazy(() => PageWithRelationsSchema),
		}),
	);

// GENRE PAGE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type GenrePageOptionalDefaultsRelations = {
	genre: GenreOptionalDefaultsWithRelations;
	page: PageOptionalDefaultsWithRelations;
};

export type GenrePageOptionalDefaultsWithRelations = z.infer<
	typeof GenrePageOptionalDefaultsSchema
> &
	GenrePageOptionalDefaultsRelations;

export const GenrePageOptionalDefaultsWithRelationsSchema: z.ZodType<GenrePageOptionalDefaultsWithRelations> =
	GenrePageOptionalDefaultsSchema.merge(
		z.object({
			genre: z.lazy(() => GenreOptionalDefaultsWithRelationsSchema),
			page: z.lazy(() => PageOptionalDefaultsWithRelationsSchema),
		}),
	);

// GENRE PAGE PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type GenrePagePartialRelations = {
	genre?: GenrePartialWithRelations;
	page?: PagePartialWithRelations;
};

export type GenrePagePartialWithRelations = z.infer<
	typeof GenrePagePartialSchema
> &
	GenrePagePartialRelations;

export const GenrePagePartialWithRelationsSchema: z.ZodType<GenrePagePartialWithRelations> =
	GenrePagePartialSchema.merge(
		z.object({
			genre: z.lazy(() => GenrePartialWithRelationsSchema),
			page: z.lazy(() => PagePartialWithRelationsSchema),
		}),
	).partial();

export type GenrePageOptionalDefaultsWithPartialRelations = z.infer<
	typeof GenrePageOptionalDefaultsSchema
> &
	GenrePagePartialRelations;

export const GenrePageOptionalDefaultsWithPartialRelationsSchema: z.ZodType<GenrePageOptionalDefaultsWithPartialRelations> =
	GenrePageOptionalDefaultsSchema.merge(
		z
			.object({
				genre: z.lazy(() => GenrePartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

export type GenrePageWithPartialRelations = z.infer<typeof GenrePageSchema> &
	GenrePagePartialRelations;

export const GenrePageWithPartialRelationsSchema: z.ZodType<GenrePageWithPartialRelations> =
	GenrePageSchema.merge(
		z
			.object({
				genre: z.lazy(() => GenrePartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// TAG SCHEMA
/////////////////////////////////////////

export const TagSchema = z.object({
	id: z.number(),
	name: z.string().regex(/^[a-zA-Z0-9-_]+$/, {
		message: "Tag can only contain letters, numbers, - and _",
	}),
});

export type Tag = z.infer<typeof TagSchema>;

/////////////////////////////////////////
// TAG PARTIAL SCHEMA
/////////////////////////////////////////

export const TagPartialSchema = TagSchema.partial();

export type TagPartial = z.infer<typeof TagPartialSchema>;

// TAG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TagOptionalDefaultsSchema = TagSchema.merge(
	z.object({
		id: z.number().optional(),
	}),
);

export type TagOptionalDefaults = z.infer<typeof TagOptionalDefaultsSchema>;

// TAG RELATION SCHEMA
//------------------------------------------------------

export type TagRelations = {
	pages: TagPageWithRelations[];
};

export type TagWithRelations = z.infer<typeof TagSchema> & TagRelations;

export const TagWithRelationsSchema: z.ZodType<TagWithRelations> =
	TagSchema.merge(
		z.object({
			pages: z.lazy(() => TagPageWithRelationsSchema).array(),
		}),
	);

// TAG OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TagOptionalDefaultsRelations = {
	pages: TagPageOptionalDefaultsWithRelations[];
};

export type TagOptionalDefaultsWithRelations = z.infer<
	typeof TagOptionalDefaultsSchema
> &
	TagOptionalDefaultsRelations;

export const TagOptionalDefaultsWithRelationsSchema: z.ZodType<TagOptionalDefaultsWithRelations> =
	TagOptionalDefaultsSchema.merge(
		z.object({
			pages: z.lazy(() => TagPageOptionalDefaultsWithRelationsSchema).array(),
		}),
	);

// TAG PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type TagPartialRelations = {
	pages?: TagPagePartialWithRelations[];
};

export type TagPartialWithRelations = z.infer<typeof TagPartialSchema> &
	TagPartialRelations;

export const TagPartialWithRelationsSchema: z.ZodType<TagPartialWithRelations> =
	TagPartialSchema.merge(
		z.object({
			pages: z.lazy(() => TagPagePartialWithRelationsSchema).array(),
		}),
	).partial();

export type TagOptionalDefaultsWithPartialRelations = z.infer<
	typeof TagOptionalDefaultsSchema
> &
	TagPartialRelations;

export const TagOptionalDefaultsWithPartialRelationsSchema: z.ZodType<TagOptionalDefaultsWithPartialRelations> =
	TagOptionalDefaultsSchema.merge(
		z
			.object({
				pages: z.lazy(() => TagPagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

export type TagWithPartialRelations = z.infer<typeof TagSchema> &
	TagPartialRelations;

export const TagWithPartialRelationsSchema: z.ZodType<TagWithPartialRelations> =
	TagSchema.merge(
		z
			.object({
				pages: z.lazy(() => TagPagePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

/////////////////////////////////////////
// TAG PAGE SCHEMA
/////////////////////////////////////////

export const TagPageSchema = z.object({
	tagId: z.number(),
	pageId: z.number(),
});

export type TagPage = z.infer<typeof TagPageSchema>;

/////////////////////////////////////////
// TAG PAGE PARTIAL SCHEMA
/////////////////////////////////////////

export const TagPagePartialSchema = TagPageSchema.partial();

export type TagPagePartial = z.infer<typeof TagPagePartialSchema>;

// TAG PAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TagPageOptionalDefaultsSchema = TagPageSchema.merge(z.object({}));

export type TagPageOptionalDefaults = z.infer<
	typeof TagPageOptionalDefaultsSchema
>;

// TAG PAGE RELATION SCHEMA
//------------------------------------------------------

export type TagPageRelations = {
	tag: TagWithRelations;
	page: PageWithRelations;
};

export type TagPageWithRelations = z.infer<typeof TagPageSchema> &
	TagPageRelations;

export const TagPageWithRelationsSchema: z.ZodType<TagPageWithRelations> =
	TagPageSchema.merge(
		z.object({
			tag: z.lazy(() => TagWithRelationsSchema),
			page: z.lazy(() => PageWithRelationsSchema),
		}),
	);

// TAG PAGE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TagPageOptionalDefaultsRelations = {
	tag: TagOptionalDefaultsWithRelations;
	page: PageOptionalDefaultsWithRelations;
};

export type TagPageOptionalDefaultsWithRelations = z.infer<
	typeof TagPageOptionalDefaultsSchema
> &
	TagPageOptionalDefaultsRelations;

export const TagPageOptionalDefaultsWithRelationsSchema: z.ZodType<TagPageOptionalDefaultsWithRelations> =
	TagPageOptionalDefaultsSchema.merge(
		z.object({
			tag: z.lazy(() => TagOptionalDefaultsWithRelationsSchema),
			page: z.lazy(() => PageOptionalDefaultsWithRelationsSchema),
		}),
	);

// TAG PAGE PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type TagPagePartialRelations = {
	tag?: TagPartialWithRelations;
	page?: PagePartialWithRelations;
};

export type TagPagePartialWithRelations = z.infer<typeof TagPagePartialSchema> &
	TagPagePartialRelations;

export const TagPagePartialWithRelationsSchema: z.ZodType<TagPagePartialWithRelations> =
	TagPagePartialSchema.merge(
		z.object({
			tag: z.lazy(() => TagPartialWithRelationsSchema),
			page: z.lazy(() => PagePartialWithRelationsSchema),
		}),
	).partial();

export type TagPageOptionalDefaultsWithPartialRelations = z.infer<
	typeof TagPageOptionalDefaultsSchema
> &
	TagPagePartialRelations;

export const TagPageOptionalDefaultsWithPartialRelationsSchema: z.ZodType<TagPageOptionalDefaultsWithPartialRelations> =
	TagPageOptionalDefaultsSchema.merge(
		z
			.object({
				tag: z.lazy(() => TagPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

export type TagPageWithPartialRelations = z.infer<typeof TagPageSchema> &
	TagPagePartialRelations;

export const TagPageWithPartialRelationsSchema: z.ZodType<TagPageWithPartialRelations> =
	TagPageSchema.merge(
		z
			.object({
				tag: z.lazy(() => TagPartialWithRelationsSchema),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// SOURCE TEXT SCHEMA
/////////////////////////////////////////

export const SourceTextSchema = z.object({
	id: z.number(),
	text: z.string(),
	number: z.number(),
	pageId: z.number(),
	createdAt: z.coerce.date(),
});

export type SourceText = z.infer<typeof SourceTextSchema>;

/////////////////////////////////////////
// SOURCE TEXT PARTIAL SCHEMA
/////////////////////////////////////////

export const SourceTextPartialSchema = SourceTextSchema.partial();

export type SourceTextPartial = z.infer<typeof SourceTextPartialSchema>;

// SOURCE TEXT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SourceTextOptionalDefaultsSchema = SourceTextSchema.merge(
	z.object({
		id: z.number().optional(),
		createdAt: z.coerce.date().optional(),
	}),
);

export type SourceTextOptionalDefaults = z.infer<
	typeof SourceTextOptionalDefaultsSchema
>;

// SOURCE TEXT RELATION SCHEMA
//------------------------------------------------------

export type SourceTextRelations = {
	translateTexts: TranslateTextWithRelations[];
	page: PageWithRelations;
};

export type SourceTextWithRelations = z.infer<typeof SourceTextSchema> &
	SourceTextRelations;

export const SourceTextWithRelationsSchema: z.ZodType<SourceTextWithRelations> =
	SourceTextSchema.merge(
		z.object({
			translateTexts: z.lazy(() => TranslateTextWithRelationsSchema).array(),
			page: z.lazy(() => PageWithRelationsSchema),
		}),
	);

// SOURCE TEXT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type SourceTextOptionalDefaultsRelations = {
	translateTexts: TranslateTextOptionalDefaultsWithRelations[];
	page: PageOptionalDefaultsWithRelations;
};

export type SourceTextOptionalDefaultsWithRelations = z.infer<
	typeof SourceTextOptionalDefaultsSchema
> &
	SourceTextOptionalDefaultsRelations;

export const SourceTextOptionalDefaultsWithRelationsSchema: z.ZodType<SourceTextOptionalDefaultsWithRelations> =
	SourceTextOptionalDefaultsSchema.merge(
		z.object({
			translateTexts: z
				.lazy(() => TranslateTextOptionalDefaultsWithRelationsSchema)
				.array(),
			page: z.lazy(() => PageOptionalDefaultsWithRelationsSchema),
		}),
	);

// SOURCE TEXT PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type SourceTextPartialRelations = {
	translateTexts?: TranslateTextPartialWithRelations[];
	page?: PagePartialWithRelations;
};

export type SourceTextPartialWithRelations = z.infer<
	typeof SourceTextPartialSchema
> &
	SourceTextPartialRelations;

export const SourceTextPartialWithRelationsSchema: z.ZodType<SourceTextPartialWithRelations> =
	SourceTextPartialSchema.merge(
		z.object({
			translateTexts: z
				.lazy(() => TranslateTextPartialWithRelationsSchema)
				.array(),
			page: z.lazy(() => PagePartialWithRelationsSchema),
		}),
	).partial();

export type SourceTextOptionalDefaultsWithPartialRelations = z.infer<
	typeof SourceTextOptionalDefaultsSchema
> &
	SourceTextPartialRelations;

export const SourceTextOptionalDefaultsWithPartialRelationsSchema: z.ZodType<SourceTextOptionalDefaultsWithPartialRelations> =
	SourceTextOptionalDefaultsSchema.merge(
		z
			.object({
				translateTexts: z
					.lazy(() => TranslateTextPartialWithRelationsSchema)
					.array(),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

export type SourceTextWithPartialRelations = z.infer<typeof SourceTextSchema> &
	SourceTextPartialRelations;

export const SourceTextWithPartialRelationsSchema: z.ZodType<SourceTextWithPartialRelations> =
	SourceTextSchema.merge(
		z
			.object({
				translateTexts: z
					.lazy(() => TranslateTextPartialWithRelationsSchema)
					.array(),
				page: z.lazy(() => PagePartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// TRANSLATE TEXT SCHEMA
/////////////////////////////////////////

export const TranslateTextSchema = z.object({
	id: z.number(),
	targetLanguage: z.string(),
	text: z.string(),
	sourceTextId: z.number(),
	userId: z.number(),
	point: z.number(),
	isArchived: z.boolean(),
	createdAt: z.coerce.date(),
});

export type TranslateText = z.infer<typeof TranslateTextSchema>;

/////////////////////////////////////////
// TRANSLATE TEXT PARTIAL SCHEMA
/////////////////////////////////////////

export const TranslateTextPartialSchema = TranslateTextSchema.partial();

export type TranslateTextPartial = z.infer<typeof TranslateTextPartialSchema>;

// TRANSLATE TEXT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TranslateTextOptionalDefaultsSchema = TranslateTextSchema.merge(
	z.object({
		id: z.number().optional(),
		point: z.number().optional(),
		isArchived: z.boolean().optional(),
		createdAt: z.coerce.date().optional(),
	}),
);

export type TranslateTextOptionalDefaults = z.infer<
	typeof TranslateTextOptionalDefaultsSchema
>;

// TRANSLATE TEXT RELATION SCHEMA
//------------------------------------------------------

export type TranslateTextRelations = {
	sourceText: SourceTextWithRelations;
	user: UserWithRelations;
	votes: VoteWithRelations[];
};

export type TranslateTextWithRelations = z.infer<typeof TranslateTextSchema> &
	TranslateTextRelations;

export const TranslateTextWithRelationsSchema: z.ZodType<TranslateTextWithRelations> =
	TranslateTextSchema.merge(
		z.object({
			sourceText: z.lazy(() => SourceTextWithRelationsSchema),
			user: z.lazy(() => UserWithRelationsSchema),
			votes: z.lazy(() => VoteWithRelationsSchema).array(),
		}),
	);

// TRANSLATE TEXT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TranslateTextOptionalDefaultsRelations = {
	sourceText: SourceTextOptionalDefaultsWithRelations;
	user: UserOptionalDefaultsWithRelations;
	votes: VoteOptionalDefaultsWithRelations[];
};

export type TranslateTextOptionalDefaultsWithRelations = z.infer<
	typeof TranslateTextOptionalDefaultsSchema
> &
	TranslateTextOptionalDefaultsRelations;

export const TranslateTextOptionalDefaultsWithRelationsSchema: z.ZodType<TranslateTextOptionalDefaultsWithRelations> =
	TranslateTextOptionalDefaultsSchema.merge(
		z.object({
			sourceText: z.lazy(() => SourceTextOptionalDefaultsWithRelationsSchema),
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
			votes: z.lazy(() => VoteOptionalDefaultsWithRelationsSchema).array(),
		}),
	);

// TRANSLATE TEXT PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type TranslateTextPartialRelations = {
	sourceText?: SourceTextPartialWithRelations;
	user?: UserPartialWithRelations;
	votes?: VotePartialWithRelations[];
};

export type TranslateTextPartialWithRelations = z.infer<
	typeof TranslateTextPartialSchema
> &
	TranslateTextPartialRelations;

export const TranslateTextPartialWithRelationsSchema: z.ZodType<TranslateTextPartialWithRelations> =
	TranslateTextPartialSchema.merge(
		z.object({
			sourceText: z.lazy(() => SourceTextPartialWithRelationsSchema),
			user: z.lazy(() => UserPartialWithRelationsSchema),
			votes: z.lazy(() => VotePartialWithRelationsSchema).array(),
		}),
	).partial();

export type TranslateTextOptionalDefaultsWithPartialRelations = z.infer<
	typeof TranslateTextOptionalDefaultsSchema
> &
	TranslateTextPartialRelations;

export const TranslateTextOptionalDefaultsWithPartialRelationsSchema: z.ZodType<TranslateTextOptionalDefaultsWithPartialRelations> =
	TranslateTextOptionalDefaultsSchema.merge(
		z
			.object({
				sourceText: z.lazy(() => SourceTextPartialWithRelationsSchema),
				user: z.lazy(() => UserPartialWithRelationsSchema),
				votes: z.lazy(() => VotePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

export type TranslateTextWithPartialRelations = z.infer<
	typeof TranslateTextSchema
> &
	TranslateTextPartialRelations;

export const TranslateTextWithPartialRelationsSchema: z.ZodType<TranslateTextWithPartialRelations> =
	TranslateTextSchema.merge(
		z
			.object({
				sourceText: z.lazy(() => SourceTextPartialWithRelationsSchema),
				user: z.lazy(() => UserPartialWithRelationsSchema),
				votes: z.lazy(() => VotePartialWithRelationsSchema).array(),
			})
			.partial(),
	);

/////////////////////////////////////////
// VOTE SCHEMA
/////////////////////////////////////////

export const VoteSchema = z.object({
	id: z.number(),
	userId: z.number(),
	translateTextId: z.number(),
	isUpvote: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type Vote = z.infer<typeof VoteSchema>;

/////////////////////////////////////////
// VOTE PARTIAL SCHEMA
/////////////////////////////////////////

export const VotePartialSchema = VoteSchema.partial();

export type VotePartial = z.infer<typeof VotePartialSchema>;

// VOTE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const VoteOptionalDefaultsSchema = VoteSchema.merge(
	z.object({
		id: z.number().optional(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	}),
);

export type VoteOptionalDefaults = z.infer<typeof VoteOptionalDefaultsSchema>;

// VOTE RELATION SCHEMA
//------------------------------------------------------

export type VoteRelations = {
	translateText: TranslateTextWithRelations;
	user: UserWithRelations;
};

export type VoteWithRelations = z.infer<typeof VoteSchema> & VoteRelations;

export const VoteWithRelationsSchema: z.ZodType<VoteWithRelations> =
	VoteSchema.merge(
		z.object({
			translateText: z.lazy(() => TranslateTextWithRelationsSchema),
			user: z.lazy(() => UserWithRelationsSchema),
		}),
	);

// VOTE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type VoteOptionalDefaultsRelations = {
	translateText: TranslateTextOptionalDefaultsWithRelations;
	user: UserOptionalDefaultsWithRelations;
};

export type VoteOptionalDefaultsWithRelations = z.infer<
	typeof VoteOptionalDefaultsSchema
> &
	VoteOptionalDefaultsRelations;

export const VoteOptionalDefaultsWithRelationsSchema: z.ZodType<VoteOptionalDefaultsWithRelations> =
	VoteOptionalDefaultsSchema.merge(
		z.object({
			translateText: z.lazy(
				() => TranslateTextOptionalDefaultsWithRelationsSchema,
			),
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
		}),
	);

// VOTE PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type VotePartialRelations = {
	translateText?: TranslateTextPartialWithRelations;
	user?: UserPartialWithRelations;
};

export type VotePartialWithRelations = z.infer<typeof VotePartialSchema> &
	VotePartialRelations;

export const VotePartialWithRelationsSchema: z.ZodType<VotePartialWithRelations> =
	VotePartialSchema.merge(
		z.object({
			translateText: z.lazy(() => TranslateTextPartialWithRelationsSchema),
			user: z.lazy(() => UserPartialWithRelationsSchema),
		}),
	).partial();

export type VoteOptionalDefaultsWithPartialRelations = z.infer<
	typeof VoteOptionalDefaultsSchema
> &
	VotePartialRelations;

export const VoteOptionalDefaultsWithPartialRelationsSchema: z.ZodType<VoteOptionalDefaultsWithPartialRelations> =
	VoteOptionalDefaultsSchema.merge(
		z
			.object({
				translateText: z.lazy(() => TranslateTextPartialWithRelationsSchema),
				user: z.lazy(() => UserPartialWithRelationsSchema),
			})
			.partial(),
	);

export type VoteWithPartialRelations = z.infer<typeof VoteSchema> &
	VotePartialRelations;

export const VoteWithPartialRelationsSchema: z.ZodType<VoteWithPartialRelations> =
	VoteSchema.merge(
		z
			.object({
				translateText: z.lazy(() => TranslateTextPartialWithRelationsSchema),
				user: z.lazy(() => UserPartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// API USAGE SCHEMA
/////////////////////////////////////////

export const ApiUsageSchema = z.object({
	id: z.number(),
	userId: z.number(),
	dateTime: z.coerce.date(),
	amountUsed: z.number(),
});

export type ApiUsage = z.infer<typeof ApiUsageSchema>;

/////////////////////////////////////////
// API USAGE PARTIAL SCHEMA
/////////////////////////////////////////

export const ApiUsagePartialSchema = ApiUsageSchema.partial();

export type ApiUsagePartial = z.infer<typeof ApiUsagePartialSchema>;

// API USAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ApiUsageOptionalDefaultsSchema = ApiUsageSchema.merge(
	z.object({
		id: z.number().optional(),
	}),
);

export type ApiUsageOptionalDefaults = z.infer<
	typeof ApiUsageOptionalDefaultsSchema
>;

// API USAGE RELATION SCHEMA
//------------------------------------------------------

export type ApiUsageRelations = {
	user: UserWithRelations;
};

export type ApiUsageWithRelations = z.infer<typeof ApiUsageSchema> &
	ApiUsageRelations;

export const ApiUsageWithRelationsSchema: z.ZodType<ApiUsageWithRelations> =
	ApiUsageSchema.merge(
		z.object({
			user: z.lazy(() => UserWithRelationsSchema),
		}),
	);

// API USAGE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type ApiUsageOptionalDefaultsRelations = {
	user: UserOptionalDefaultsWithRelations;
};

export type ApiUsageOptionalDefaultsWithRelations = z.infer<
	typeof ApiUsageOptionalDefaultsSchema
> &
	ApiUsageOptionalDefaultsRelations;

export const ApiUsageOptionalDefaultsWithRelationsSchema: z.ZodType<ApiUsageOptionalDefaultsWithRelations> =
	ApiUsageOptionalDefaultsSchema.merge(
		z.object({
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
		}),
	);

// API USAGE PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type ApiUsagePartialRelations = {
	user?: UserPartialWithRelations;
};

export type ApiUsagePartialWithRelations = z.infer<
	typeof ApiUsagePartialSchema
> &
	ApiUsagePartialRelations;

export const ApiUsagePartialWithRelationsSchema: z.ZodType<ApiUsagePartialWithRelations> =
	ApiUsagePartialSchema.merge(
		z.object({
			user: z.lazy(() => UserPartialWithRelationsSchema),
		}),
	).partial();

export type ApiUsageOptionalDefaultsWithPartialRelations = z.infer<
	typeof ApiUsageOptionalDefaultsSchema
> &
	ApiUsagePartialRelations;

export const ApiUsageOptionalDefaultsWithPartialRelationsSchema: z.ZodType<ApiUsageOptionalDefaultsWithPartialRelations> =
	ApiUsageOptionalDefaultsSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
			})
			.partial(),
	);

export type ApiUsageWithPartialRelations = z.infer<typeof ApiUsageSchema> &
	ApiUsagePartialRelations;

export const ApiUsageWithPartialRelationsSchema: z.ZodType<ApiUsageWithPartialRelations> =
	ApiUsageSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
			})
			.partial(),
	);

/////////////////////////////////////////
// CUSTOM AI MODEL SCHEMA
/////////////////////////////////////////

export const CustomAIModelSchema = z.object({
	id: z.string(),
	userId: z.number(),
	name: z.string(),
	apiKey: z.string(),
	isActive: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type CustomAIModel = z.infer<typeof CustomAIModelSchema>;

/////////////////////////////////////////
// CUSTOM AI MODEL PARTIAL SCHEMA
/////////////////////////////////////////

export const CustomAIModelPartialSchema = CustomAIModelSchema.partial();

export type CustomAIModelPartial = z.infer<typeof CustomAIModelPartialSchema>;

// CUSTOM AI MODEL OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CustomAIModelOptionalDefaultsSchema = CustomAIModelSchema.merge(
	z.object({
		id: z.string().optional(),
		isActive: z.boolean().optional(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	}),
);

export type CustomAIModelOptionalDefaults = z.infer<
	typeof CustomAIModelOptionalDefaultsSchema
>;

// CUSTOM AI MODEL RELATION SCHEMA
//------------------------------------------------------

export type CustomAIModelRelations = {
	user: UserWithRelations;
};

export type CustomAIModelWithRelations = z.infer<typeof CustomAIModelSchema> &
	CustomAIModelRelations;

export const CustomAIModelWithRelationsSchema: z.ZodType<CustomAIModelWithRelations> =
	CustomAIModelSchema.merge(
		z.object({
			user: z.lazy(() => UserWithRelationsSchema),
		}),
	);

// CUSTOM AI MODEL OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type CustomAIModelOptionalDefaultsRelations = {
	user: UserOptionalDefaultsWithRelations;
};

export type CustomAIModelOptionalDefaultsWithRelations = z.infer<
	typeof CustomAIModelOptionalDefaultsSchema
> &
	CustomAIModelOptionalDefaultsRelations;

export const CustomAIModelOptionalDefaultsWithRelationsSchema: z.ZodType<CustomAIModelOptionalDefaultsWithRelations> =
	CustomAIModelOptionalDefaultsSchema.merge(
		z.object({
			user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
		}),
	);

// CUSTOM AI MODEL PARTIAL RELATION SCHEMA
//------------------------------------------------------

export type CustomAIModelPartialRelations = {
	user?: UserPartialWithRelations;
};

export type CustomAIModelPartialWithRelations = z.infer<
	typeof CustomAIModelPartialSchema
> &
	CustomAIModelPartialRelations;

export const CustomAIModelPartialWithRelationsSchema: z.ZodType<CustomAIModelPartialWithRelations> =
	CustomAIModelPartialSchema.merge(
		z.object({
			user: z.lazy(() => UserPartialWithRelationsSchema),
		}),
	).partial();

export type CustomAIModelOptionalDefaultsWithPartialRelations = z.infer<
	typeof CustomAIModelOptionalDefaultsSchema
> &
	CustomAIModelPartialRelations;

export const CustomAIModelOptionalDefaultsWithPartialRelationsSchema: z.ZodType<CustomAIModelOptionalDefaultsWithPartialRelations> =
	CustomAIModelOptionalDefaultsSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
			})
			.partial(),
	);

export type CustomAIModelWithPartialRelations = z.infer<
	typeof CustomAIModelSchema
> &
	CustomAIModelPartialRelations;

export const CustomAIModelWithPartialRelationsSchema: z.ZodType<CustomAIModelWithPartialRelations> =
	CustomAIModelSchema.merge(
		z
			.object({
				user: z.lazy(() => UserPartialWithRelationsSchema),
			})
			.partial(),
	);
