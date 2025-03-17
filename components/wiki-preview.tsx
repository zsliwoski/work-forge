import { useTeam } from "@/contexts/team-provider";
import { fetcher } from "@/lib/db";
import useSWR from "swr";

export function WikiPreview({ pageId }: { pageId: string }) {
    const { teamId } = useTeam();
    // Fetch wiki data based on the teamId
    const { data, error, isLoading } = useSWR(`/api/wiki/${teamId}/${pageId}`, fetcher, { revalidateOnFocus: false });
    if (error) return <div>Failed to load</div>;
    if (isLoading) return <div>Loading...</div>;
    const wikiData = data;

    return (
        <div>
            {/* Add your rendering logic here */}
        </div>
    );
};

export default WikiPreview;