import axiosAgent from "../axiosAgent";
import { ListingFeatures } from "../../types/listings";

export async function getListingFeatures(listing_id: string): Promise<ListingFeatures | null> {
  const { data } = await axiosAgent.get(`/rest/v1/listing_features`, {
    params: {
      listing_id: `eq.${listing_id}`,
      select: "*"
    },
  });
  return data && data.length > 0 ? data[0] : null;
} 