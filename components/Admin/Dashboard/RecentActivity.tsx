import { getRecentActivity } from "@/app/(admin)/admin/actions/dashboard";
import Image from "next/image";
// import { formatDistanceToNow } from 'date-fns';


export default async function RecentActivity() {
    const result = await getRecentActivity();

    if (!result.success) {
        return <div>Error loading activity</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {result.activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                    result.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                {activity.image && (
                                    <Image
                                        src={activity.image}
                                        alt={activity.productName}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {activity.productName}
                                </p>
                                {/* <p className="text-xs text-gray-500">
                                    Viewed {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p> */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
