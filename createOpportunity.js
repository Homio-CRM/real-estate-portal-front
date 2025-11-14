import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const LOCATION_TOKEN_FUNCTION = Deno.env.get("LOCATION_TOKEN_FUNCTION") || "ghl-location-auth";
const GHL_VERSION = Deno.env.get("GHL_VERSION") || "2021-07-28";
const ALLOW_HEADERS = "Content-Type, Authorization, locationId, location_id, x-request-id";
function cors(extra = {}) {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": ALLOW_HEADERS,
        ...extra
    };
}
function stripBearer(s) {
    return String(s || "").replace(/^Bearer\s+/i, "");
}
function pruneUndefined(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;
    }
    return out;
}
async function getLocationAccessToken(locationId) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados");
    }
    const fnUrl = `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/${LOCATION_TOKEN_FUNCTION}`;
    const resp = await fetch(fnUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
            locationId
        })
    });
    const text = await resp.text();
    if (!resp.ok) {
        throw new Error(`Falha ao obter location token: ${resp.status} ${resp.statusText} - ${text}`);
    }
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch { }
    const token = data?.access_token ?? data?.accessToken ?? data?.token ?? data?.data?.access_token ?? data?.data?.accessToken;
    if (!token) {
        throw new Error(`Função ${LOCATION_TOKEN_FUNCTION} não retornou access_token. Payload: ${text}`);
    }
    return stripBearer(String(token));
}
function buildOpportunityPayload(body) {
    const base = typeof body?.payload === "object" && body.payload || typeof body?.opportunity === "object" && body.opportunity || body || {};
    return pruneUndefined({
        ...base
    });
}
serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: cors()
        });
    }
    if (req.method !== "POST") {
        return new Response(JSON.stringify({
            error: "Method not allowed"
        }), {
            status: 405,
            headers: cors({
                "Content-Type": "application/json"
            })
        });
    }
    try {
        const ct = req.headers.get("content-type") || "";
        const raw = await req.text();
        if (!ct.includes("application/json")) {
            return new Response(JSON.stringify({
                error: "Unsupported Content-Type",
                hint: 'Use "Content-Type: application/json". Envie {"locationId":"..."} nos headers (locationId/location_id) ou no body, e os campos da oportunidade.'
            }), {
                status: 415,
                headers: cors({
                    "Content-Type": "application/json"
                })
            });
        }
        let body = {};
        try {
            body = raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("JSON parse error:", e, "raw body:", raw.slice(0, 200));
            return new Response(JSON.stringify({
                error: "Invalid JSON body",
                details: e instanceof Error ? e.message : "Unknown JSON parse error"
            }), {
                status: 400,
                headers: cors({
                    "Content-Type": "application/json"
                })
            });
        }
        const headerLocationId = req.headers.get("locationId") || req.headers.get("location_id") || req.headers.get("locationid") || "";
        const locationId = String(headerLocationId || body.locationId || body.location_id || "");
        if (!locationId) {
            return new Response(JSON.stringify({
                error: "Missing locationId",
                hint: 'Envie o header "locationId: <ID>" (ou "location_id") ou inclua no body. É obrigatório para autenticar na subconta.'
            }), {
                status: 400,
                headers: cors({
                    "Content-Type": "application/json"
                })
            });
        }
        const outBody = buildOpportunityPayload(body);
        outBody.locationId = locationId;
        if (!outBody.pipelineId && !outBody.pipeline_id) {
            return new Response(JSON.stringify({
                error: "O body deve incluir pipelineId."
            }), {
                status: 422,
                headers: cors({
                    "Content-Type": "application/json"
                })
            });
        }
        if (!outBody.pipelineStageId && !outBody.pipeline_stage_id) {
            return new Response(JSON.stringify({
                error: "O body deve incluir pipelineStageId."
            }), {
                status: 422,
                headers: cors({
                    "Content-Type": "application/json"
                })
            });
        }
        const accessToken = await getLocationAccessToken(locationId);
        const resp = await fetch("https://services.leadconnectorhq.com/opportunities/", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: GHL_VERSION,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(outBody)
        });
        const txt = await resp.text();
        if (!resp.ok) {
            console.error(`GHL Create Opportunity Error: ${resp.status} - ${txt}`);
            return new Response(JSON.stringify({
                error: `Failed to create opportunity: ${resp.status} ${resp.statusText}`,
                details: txt,
                sentBodySample: Object.fromEntries(Object.entries(outBody).slice(0, 30))
            }), {
                status: resp.status,
                headers: cors({
                    "Content-Type": "application/json"
                })
            });
        }
        let data = {};
        try {
            data = txt ? JSON.parse(txt) : {};
        } catch {
            data = {
                ok: true
            };
        }
        return new Response(JSON.stringify(data), {
            status: 201,
            headers: cors({
                "Content-Type": "application/json"
            })
        });
    } catch (err) {
        console.error("Edge Function Error:", err);
        return new Response(JSON.stringify({
            error: "Internal server error",
            details: err instanceof Error ? err.message : "Unknown error"
        }), {
            status: 500,
            headers: cors({
                "Content-Type": "application/json"
            })
        });
    }
});
