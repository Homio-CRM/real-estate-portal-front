import axiosAgent from "../axiosAgent";
import { ListingDetails } from "../../types/listings";

export async function getListingDetails(listing_id: string): Promise<ListingDetails | null> {
  const { data } = await axiosAgent.get(`/rest/v1/listing_details`, {
    params: {
      listing_id: `eq.${listing_id}`,
      select: "*"
    },
  });
  return data && data.length > 0 ? data[0] : null;
} 