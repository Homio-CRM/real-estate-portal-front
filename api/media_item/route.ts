import axiosAgent from "../axiosAgent";
import { MediaItem } from "../../types/listings";

export async function getMediaItems(listing_id: string): Promise<MediaItem[]> {
  const { data } = await axiosAgent.get(`/rest/v1/media_item`, {
    params: {
      listing_id: `eq.${listing_id}`,
      select: "*"
    },
  });
  return data;
} 