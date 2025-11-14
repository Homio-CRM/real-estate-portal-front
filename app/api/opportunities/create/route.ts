import { NextResponse } from "next/server";

type DealType = "rent" | "sale" | "launch";

type OpportunityRequestBody = {
    contactId?: string;
    dealType?: DealType;
    name?: string;
    propertyId?: string;
    propertyPublicId?: string;
    propertyUrl?: string;
    message?: string;
    price?: number | string | null;
    email?: string;
    phone?: string;
    leadOrigin?: string;
};

const SUPABASE_OPERATIONS_URL = process.env.SUPABASE_OPERATIONS_URL;
const SUPABASE_OPERATIONS_ANON_KEY = process.env.SUPABASE_OPERATIONS_ANON_KEY;
const LOCATION_ID = process.env.LOCATION_ID;

const PIPELINE_CONFIG: Record<DealType, { pipelineId: string; pipelineStageId: string }> = {
    rent: {
        pipelineId: "AmFvcdAUWjzhD7IpCEMR",
        pipelineStageId: "78325e9e-cb7c-4319-8239-f15e6f511987",
    },
    sale: {
        pipelineId: "FWAZahAhZzs0TAzkJJcj",
        pipelineStageId: "270bf63c-48e0-4693-984e-faec392689c8",
    },
    launch: {
        pipelineId: "FWAZahAhZzs0TAzkJJcj",
        pipelineStageId: "270bf63c-48e0-4693-984e-faec392689c8",
    },
};

const OWNER_PIPELINE_CONFIG = {
    pipelineId: "lQ5ZI4zJ4Mb4SdAEfp5F",
    pipelineStageId: "37a02e8a-ebe8-492d-9c3f-8d6c58777e61",
};

const normalizePrice = (price?: number | string | null) => {
    if (price === null || price === undefined) {
        return undefined;
    }

    if (typeof price === "number") {
        return Number.isFinite(price) ? price : undefined;
    }

    const digits = price.replace(/[^\d.,]/g, "").replace(",", ".");
    const numeric = Number(digits);
    return Number.isFinite(numeric) ? numeric : undefined;
};

export async function POST(request: Request) {
    if (!SUPABASE_OPERATIONS_URL || !SUPABASE_OPERATIONS_ANON_KEY) {
        return NextResponse.json(
            { error: "Supabase Operations credentials are not configured." },
            { status: 500 },
        );
    }

    if (!LOCATION_ID) {
        return NextResponse.json(
            { error: "LOCATION_ID is not configured." },
            { status: 500 },
        );
    }

    let body: OpportunityRequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body.contactId) {
        return NextResponse.json(
            { error: "O campo 'contactId' é obrigatório." },
            { status: 400 },
        );
    }

    const dealType = body.dealType ?? "sale";
    const leadOrigin =
        typeof body.leadOrigin === "string" ? body.leadOrigin : undefined;
    const normalizedLeadOrigin = leadOrigin?.trim().toLowerCase();
    const isOwnerLead =
        normalizedLeadOrigin === "owner" ||
        normalizedLeadOrigin === "owner-hero" ||
        normalizedLeadOrigin === "owner-footer";
    const defaultPipelineConfig =
        PIPELINE_CONFIG[dealType] ?? PIPELINE_CONFIG.sale;
    const pipelineConfig = isOwnerLead ? OWNER_PIPELINE_CONFIG : defaultPipelineConfig;

    const price = normalizePrice(body.price);
    const messageValue = body.message?.trim() ?? "";
    const propertyPublicIdValue = body.propertyPublicId ?? body.propertyId ?? "";
    const propertyUrlValue = body.propertyUrl ?? "";

    const payload: Record<string, unknown> = {
        locationId: LOCATION_ID,
        contactId: body.contactId,
        pipelineId: pipelineConfig.pipelineId,
        pipelineStageId: pipelineConfig.pipelineStageId,
        name: body.name ?? "Lead do portal imobiliário",
        status: "open",
        source: "Website",
    };

    if (price !== undefined) {
        payload.monetaryValue = price;
    }

    payload.customFields = [
        {
            id: "SMrglJIuGSOkK3ehfE76",
            value: propertyPublicIdValue,
        },
        {
            id: "51TBxRHgf02EM9XspKex",
            value: messageValue,
        },
        {
            id: "VIP8bbSG7z4w8Y1DJyED",
            value: propertyUrlValue,
        },
    ];

    try {
        const url = `${SUPABASE_OPERATIONS_URL.replace(/\/+$/, "")}/functions/v1/create-opportunity`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_OPERATIONS_ANON_KEY}`,
                apikey: SUPABASE_OPERATIONS_ANON_KEY,
            },
            body: JSON.stringify(payload),
        });

        const text = await response.text();
        let data: unknown;

        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = text;
        }

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: "Falha ao criar a oportunidade.",
                    details: data,
                    sentPayload: payload,
                    upstreamStatus: response.status,
                    upstreamStatusText: response.statusText,
                },
                { status: response.status },
            );
        }

        const parsed = data as Record<string, unknown> | null;
        const extractedId =
            (parsed?.opportunity as Record<string, unknown> | undefined)?.id ??
            parsed?.id ??
            (parsed?.data as Record<string, unknown> | undefined)?.id ??
            (Array.isArray(parsed?.data) &&
                parsed?.data?.[0] &&
                typeof parsed.data[0] === "object"
                ? (parsed.data[0] as Record<string, unknown>).id
                : undefined);

        return NextResponse.json(
            {
                opportunityId: extractedId ? String(extractedId) : null,
                opportunity: parsed,
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            {
                error: "Erro ao se comunicar com a API de oportunidades.",
                details: error instanceof Error ? error.message : "Unknown error",
                sentPayload: payload,
            },
            { status: 500 },
        );
    }
}

