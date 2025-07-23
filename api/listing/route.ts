import axiosAgent from "../axiosAgent";
import { Listing } from "../../types/listings";

export async function getListings(): Promise<Listing[]> {
  const agencyId = process.env.LOCATION_ID;
  const { data } = await axiosAgent.get(`/rest/v1/listing`, {
    params: {
      agency_id: `eq.${agencyId}`,
      select: "*"
    },
  });
  return data;
} 