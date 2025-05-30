import React, { useState, useEffect } from 'react'
import { useGetBlogCountQuery, useGetTotalViewCountQuery, useGetAllTagsQuery } from '../../../../redux/blogSlice';

export default function Dashboard() {
  const { data: blogCount, isLoading: isLoadingBlogCount } = useGetBlogCountQuery();
  const { data: viewCount, isLoading: isLoadingViewCount } = useGetTotalViewCountQuery();
  const { data: tags, isLoading: isLoadingTags } = useGetAllTagsQuery();
  
  const [recentStats, setRecentStats] = useState({
    weeklyViews: 0,
    monthlyViews: 0
  });

  useEffect(() => {
    // In a real app, you might fetch this data from an API endpoint
    // For now, we'll use mock data
    setRecentStats({
      weeklyViews: Math.floor(Math.random() * 1000),
      monthlyViews: Math.floor(Math.random() * 5000)
    });
  }, []);

  // Calculate most popular tags
  const getPopularTags = () => {
    if (!tags) return [];
    return [...tags]
      .sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0))
      .slice(0, 5);
  };

  if (isLoadingBlogCount || isLoadingViewCount || isLoadingTags) {
    return <div className="p-4">Loading dashboard data...</div>;
  }

  const popularTags = getPopularTags();

  return (
    <div className="dashboard-container p-4">
      <h2 className="text-xl font-semibold mb-6">Blog Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Blog Posts Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase mb-2">Total Blog Posts</h3>
          <p className="text-3xl font-bold">{blogCount?.count || 0}</p>
        </div>
        
        {/* Total Views Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase mb-2">Total Views</h3>
          <p className="text-3xl font-bold">{viewCount?.totalViews || 0}</p>
        </div>
        
        {/* Total Tags Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase mb-2">Total Tags</h3>
          <p className="text-3xl font-bold">{tags?.length || 0}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Recent Statistics</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-gray-500 text-sm">Weekly Views</h4>
              <p className="text-2xl font-medium">{recentStats.weeklyViews}</p>
            </div>
            <div>
              <h4 className="text-gray-500 text-sm">Monthly Views</h4>
              <p className="text-2xl font-medium">{recentStats.monthlyViews}</p>
            </div>
          </div>
        </div>
        
        {/* Popular Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Popular Tags</h3>
          {popularTags.length > 0 ? (
            <div className="space-y-2">
              {popularTags.map(tag => (
                <div key={tag.id} className="flex justify-between items-center">
                  <span className="text-gray-700">{tag.name}</span>
                  <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">
                    {tag.blogCount || 0} posts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tags available</p>
          )}
        </div>
      </div>
    </div>
  );
}
