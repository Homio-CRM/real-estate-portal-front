import axiosAgent from "../axiosAgent";
import { ListingLocation } from "../../types/listings";

export async function getListingLocation(listing_id: string): Promise<ListingLocation | null> {
  const { data } = await axiosAgent.get(`/rest/v1/listing_location`, {
    params: {
      listing_id: `eq.${listing_id}`,
      select: "*"
    },
  });
  return data && data.length > 0 ? data[0] : null;
} 