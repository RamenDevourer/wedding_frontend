import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBlogsQuery,
  useUpdateBlogMutation
} from '../../../../redux/blogSlice';
import { 
  FiStar, FiEdit2, FiEye, FiTrash2, FiSearch, FiFilter, 
  FiChevronLeft, FiChevronRight, FiX, FiCheck, FiAlertCircle, FiImage
} from 'react-icons/fi';

export default function Featured() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage, setBlogsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'title', 'views'
  const [animate, setAnimate] = useState(false);
  const [confirmUnfeature, setConfirmUnfeature] = useState(null);

  // Get blogs with pagination parameters
  const { data: blogsData, isLoading, refetch } = useGetBlogsQuery({
    s: (currentPage - 1) * blogsPerPage,
    t: blogsPerPage,
    search: searchTerm || undefined,
    sort: sortBy
  }, {
    refetchOnMountOrArgChange: true
  });
  
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  // Calculate total pages based on blog count
  const totalItems = blogsData?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / blogsPerPage));
  
  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, []);
  
  // If current page is greater than total pages, reset to first page
  useEffect(() => {
    if (currentPage > totalPages && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleFeatureToggle = async (blog) => {
    if (blog.featured) {
      // If blog is already featured, show confirmation dialog before unfeaturing
      setConfirmUnfeature(blog);
    } else {
      // If blog is not featured, feature it immediately
      try {
        await updateBlog({ 
          id: blog.id, 
          blogData: { featured: true } 
        }).unwrap();
        refetch();
      } catch (error) {
        alert('Failed to update featured status: ' + (error.data?.message || 'Unknown error'));
      }
    }
  };
  
  const confirmUnfeatureAction = async () => {
    if (!confirmUnfeature) return;
    
    try {
      await updateBlog({ 
        id: confirmUnfeature.id, 
        blogData: { featured: false } 
      }).unwrap();
      setConfirmUnfeature(null);
      refetch();
    } catch (error) {
      alert('Failed to update featured status: ' + (error.data?.message || 'Unknown error'));
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Get blogs from API
  const getBlogsList = () => {
    if (blogsData?.data && Array.isArray(blogsData.data)) return blogsData.data;
    return []; // Return empty array if no blogs are available
  };
  
  const blogsList = getBlogsList();
  const featuredBlogs = blogsList.filter(blog => blog.featured);
  const unfeaturedBlogs = blogsList.filter(blog => !blog.featured);
  const displayBlogs = [...featuredBlogs, ...unfeaturedBlogs];

  return(
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg">
      under construction
    </div>
  )
  // return (
  //   <div className="max-w-7xl mx-auto">
  //     <div className="featured-container">
  //       {/* Header */}
  //       <div className={`mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
  //         <h1 className="text-3xl font-bold text-gray-800 mb-2">Featured Blog Management</h1>
  //         <p className="text-gray-600">Set and manage your featured blog posts to highlight important content.</p>
  //       </div>
        
  //       {/* Currently Featured Blog */}
  //       {featuredBlogs.length > 0 && (
  //         <div className={`bg-white rounded-lg shadow-lg p-6 mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
  //           <div className="flex items-center mb-6">
  //             <div className="bg-amber-100 p-2 rounded-full mr-3">
  //               <FiStar className="h-6 w-6 text-amber-600" />
  //             </div>
  //             <h3 className="text-lg font-medium text-gray-800">Currently Featured</h3>
  //           </div>
            
  //           <div className="space-y-6">
  //             {featuredBlogs.map((blog, index) => (
  //               <div key={blog.id} className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
  //                 <div className="md:w-1/4 h-48 md:h-auto bg-gray-200 overflow-hidden">
  //                   {blog.coverImage ? (
  //                     <img 
  //                       src={blog.coverImage} 
  //                       alt={blog.title}
  //                       className="w-full h-full object-cover transition-transform hover:scale-105"
  //                     />
  //                   ) : (
  //                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500">
  //                       <FiImage className="h-12 w-12" />
  //                     </div>
  //                   )}
  //                 </div>
  //                 <div className="p-6 md:w-3/4">
  //                   <div className="flex items-center gap-2 mb-3">
  //                     <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
  //                       <FiStar className="h-3 w-3 mr-1" />
  //                       Featured
  //                     </span>
  //                     <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
  //                       {blog.status}
  //                     </span>
  //                     {blog.viewCount > 0 && (
  //                       <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
  //                         <FiEye className="h-3 w-3 mr-1" />
  //                         {blog.viewCount} views
  //                       </span>
  //                     )}
  //                   </div>
  //                   <h3 className="text-xl font-bold text-gray-800 mb-3">{blog.title}</h3>
  //                   <p className="text-gray-600 mb-4 line-clamp-2">
  //                     {blog.excerpt || 'No excerpt available for this post. Add an excerpt to make your featured post more engaging.'}
  //                   </p>
  //                   <div className="flex items-center justify-between mt-auto">
  //                     <div className="flex items-center text-sm text-gray-500">
  //                       <span className="mr-4">Published: {formatDate(blog.createdAt)}</span>
  //                       <span>Updated: {formatDate(blog.updatedAt)}</span>
  //                     </div>
  //                     <div className="flex gap-2">
  //                       <button
  //                         onClick={() => window.open(`/blogs/${blog.urlTitle}`, '_blank')}
  //                         className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
  //                         title="View post"
  //                       >
  //                         <FiEye className="h-5 w-5" />
  //                       </button>
  //                       <button
  //                         onClick={() => navigate(`/update-blog-post/${blog.urlTitle || blog.id}`)}
  //                         className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
  //                         title="Edit post"
  //                       >
  //                         <FiEdit2 className="h-5 w-5" />
  //                       </button>
  //                       <button
  //                         onClick={() => handleFeatureToggle(blog)}
  //                         className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-colors"
  //                         title="Remove featured status"
  //                         disabled={isUpdating}
  //                       >
  //                         <FiStar className="h-5 w-5" />
  //                       </button>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       )}
        
  //       {/* All Blog Posts */}
  //       <div className={`bg-white rounded-lg shadow-lg transform transition-all duration-500 delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
  //         <div className="border-b px-6 py-4 flex items-center justify-between">
  //           <div className="flex items-center">
  //             <FiStar className="h-5 w-5 text-amber-500 mr-3" />
  //             <h3 className="text-lg font-medium text-gray-800">All Blog Posts</h3>
  //           </div>
            
  //           <div className="flex items-center space-x-3">
  //             <div className="relative">
  //               <form onSubmit={handleSearch} className="flex">
  //                 <div className="relative">
  //                   <input
  //                     type="text"
  //                     className="pl-9 pr-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
  //                     placeholder="Search blogs..."
  //                     value={searchTerm}
  //                     onChange={(e) => setSearchTerm(e.target.value)}
  //                   />
  //                   <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
  //                   {searchTerm && (
  //                     <button 
  //                       type="button" 
  //                       onClick={handleClearSearch}
  //                       className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
  //                     >
  //                       <FiX />
  //                     </button>
  //                   )}
  //                 </div>
  //                 <button 
  //                   type="submit" 
  //                   className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
  //                 >
  //                   Search
  //                 </button>
  //               </form>
  //             </div>
              
  //             <div className="relative">
  //               <button
  //                 className="px-3 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
  //                 onClick={() => document.getElementById('sortDropdown').classList.toggle('hidden')}
  //               >
  //                 <FiFilter className="mr-2" />
  //                 Sort
  //               </button>
  //               <div id="sortDropdown" className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border z-10 hidden">
  //                 <div className="py-1 w-48">
  //                   <button 
  //                     onClick={() => { setSortBy('latest'); document.getElementById('sortDropdown').classList.add('hidden'); }}
  //                     className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'latest' ? 'bg-indigo-50 text-indigo-800' : ''}`}
  //                   >
  //                     Latest
  //                   </button>
  //                   <button 
  //                     onClick={() => { setSortBy('title'); document.getElementById('sortDropdown').classList.add('hidden'); }}
  //                     className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'title' ? 'bg-indigo-50 text-indigo-800' : ''}`}
  //                   >
  //                     Title (A-Z)
  //                   </button>
  //                   <button 
  //                     onClick={() => { setSortBy('views'); document.getElementById('sortDropdown').classList.add('hidden'); }}
  //                     className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'views' ? 'bg-indigo-50 text-indigo-800' : ''}`}
  //                   >
  //                     Most Views
  //                   </button>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
          
  //         {isLoading ? (
  //           <div className="text-center p-12">
  //             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
  //             <p className="text-gray-500">Loading blogs...</p>
  //           </div>
  //         ) : (
  //           <div className="divide-y">
  //             {displayBlogs.length > 0 ? (
  //               displayBlogs.map((blog, index) => (
  //                 <div 
  //                   key={blog.id} 
  //                   className={`p-6 flex items-center justify-between transform transition-all duration-500 hover:bg-gray-50 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0'}`}
  //                   style={{ transitionDelay: `${index * 50 + 200}ms` }}
  //                 >
  //                   <div className="flex items-center space-x-4">
  //                     <div className="flex-shrink-0 h-14 w-14 bg-gray-200 rounded-lg overflow-hidden">
  //                       {blog.coverImage ? (
  //                         <img 
  //                           src={blog.coverImage} 
  //                           alt="" 
  //                           className="h-full w-full object-cover"
  //                         />
  //                       ) : (
  //                         <div className="h-full w-full flex items-center justify-center">
  //                           <FiImage className="h-6 w-6 text-gray-400" />
  //                         </div>
  //                       )}
  //                     </div>
                      
  //                     <div>
  //                       <h4 className="font-medium text-gray-800">{blog.title}</h4>
  //                       <div className="flex items-center mt-1 space-x-2">
  //                         {blog.featured && (
  //                           <span className="inline-flex items-center text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
  //                             <FiStar className="mr-1 h-3 w-3" />
  //                             Featured
  //                           </span>
  //                         )}
  //                         <span className="text-xs text-gray-500">
  //                           {blog.status === 'PUBLISHED' ? 'Published' : 'Draft'}
  //                         </span>
  //                         <span className="text-xs text-gray-500">
  //                           {formatDate(blog.createdAt)}
  //                         </span>
  //                         <span className="text-xs text-gray-500">
  //                           {blog.viewCount} views
  //                         </span>
  //                       </div>
  //                     </div>
  //                   </div>
                    
  //                   <div className="flex space-x-2">
  //                     <button
  //                       onClick={() => handleFeatureToggle(blog)}
  //                       className={`p-2 rounded-full transition-colors ${blog.featured 
  //                         ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
  //                         : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
  //                       title={blog.featured ? "Remove from featured" : "Set as featured"}
  //                       disabled={isUpdating}
  //                     >
  //                       <FiStar className="h-5 w-5" />
  //                     </button>
  //                     <button
  //                       onClick={() => navigate(`/update-blog-post/${blog.urlTitle || blog.id}`)}
  //                       className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
  //                       title="Edit post"
  //                     >
  //                       <FiEdit2 className="h-5 w-5" />
  //                     </button>
  //                     <button
  //                       onClick={() => window.open(`/blogs/${blog.urlTitle}`, '_blank')}
  //                       className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
  //                       title="View post"
  //                     >
  //                       <FiEye className="h-5 w-5" />
  //                     </button>
  //                   </div>
  //                 </div>
  //               ))
  //             ) : (
  //               <div className="text-center p-12 text-gray-500">
  //                 <FiStar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
  //                 <p>No blogs found</p>
  //               </div>
  //             )}
              
  //             {/* Pagination Controls */}
  //             {displayBlogs.length > 0 && (
  //               <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
  //                 <div className="flex items-center text-sm text-gray-500">
  //                   <span>
  //                     Showing {Math.min((currentPage - 1) * blogsPerPage + 1, totalItems)} to {Math.min(currentPage * blogsPerPage, totalItems)} of {totalItems} blogs
  //                   </span>
  //                   <div className="ml-4 flex items-center">
  //                     <label htmlFor="blogsPerPage" className="mr-2">Per page</label>
  //                     <select 
  //                       id="blogsPerPage" 
  //                       className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-300"
  //                       value={blogsPerPage}
  //                       onChange={(e) => {
  //                         setBlogsPerPage(Number(e.target.value));
  //                         setCurrentPage(1);
  //                       }}
  //                     >
  //                       {[5, 10, 25, 50].map(num => (
  //                         <option key={num} value={num}>{num}</option>
  //                       ))}
  //                     </select>
  //                   </div>
  //                 </div>
  //                 <div className="flex items-center space-x-2">
  //                   <button 
  //                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
  //                     disabled={currentPage === 1}
  //                     className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
  //                     aria-label="Previous page"
  //                   >
  //                     <FiChevronLeft />
  //                   </button>
                    
  //                   {/* Page numbers */}
  //                   <div className="flex space-x-1">
  //                     {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
  //                       // Logic to show pages around current page
  //                       let pageNum;
  //                       if (totalPages <= 5) {
  //                         pageNum = idx + 1;
  //                       } else if (currentPage <= 3) {
  //                         pageNum = idx + 1;
  //                       } else if (currentPage >= totalPages - 2) {
  //                         pageNum = totalPages - 4 + idx;
  //                       } else {
  //                         pageNum = currentPage - 2 + idx;
  //                       }
                        
  //                       if (totalPages > 5) {
  //                         // Show first page
  //                         if (idx === 0 && pageNum > 1) {
  //                           return (
  //                             <div key="start" className="flex space-x-1">
  //                               <button
  //                                 key="1"
  //                                 onClick={() => setCurrentPage(1)}
  //                                 className={`w-8 h-8 flex items-center justify-center rounded-lg ${1 === currentPage ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
  //                               >
  //                                 1
  //                               </button>
  //                               {pageNum > 2 && (
  //                                 <span className="w-8 h-8 flex items-center justify-center text-gray-500">
  //                                   ...
  //                                 </span>
  //                               )}
  //                             </div>
  //                           );
  //                         }
                          
  //                         // Show last page
  //                         if (idx === 4 && pageNum < totalPages) {
  //                           return (
  //                             <div key="end" className="flex space-x-1">
  //                               {pageNum < totalPages - 1 && (
  //                                 <span className="w-8 h-8 flex items-center justify-center text-gray-500">
  //                                   ...
  //                                 </span>
  //                               )}
  //                               <button
  //                                 key={totalPages}
  //                                 onClick={() => setCurrentPage(totalPages)}
  //                                 className={`w-8 h-8 flex items-center justify-center rounded-lg ${totalPages === currentPage ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
  //                               >
  //                                 {totalPages}
  //                               </button>
  //                             </div>
  //                           );
  //                         }
  //                       }
                        
  //                       return (
  //                         <button
  //                           key={pageNum}
  //                           onClick={() => setCurrentPage(pageNum)}
  //                           className={`w-8 h-8 flex items-center justify-center rounded-lg ${pageNum === currentPage ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
  //                         >
  //                           {pageNum}
  //                         </button>
  //                       );
  //                     })}
  //                   </div>
                    
  //                   <button 
  //                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
  //                     disabled={currentPage === totalPages}
  //                     className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
  //                     aria-label="Next page"
  //                   >
  //                     <FiChevronRight />
  //                   </button>
  //                 </div>
  //               </div>
  //             )}
  //           </div>
  //         )}
  //       </div>
  //     </div>
      
  //     {/* Unfeature Confirmation Dialog */}
  //     {confirmUnfeature && (
  //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //         <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
  //           <div className="mb-4 text-center">
  //             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
  //               <FiAlertCircle className="h-6 w-6 text-amber-600" />
  //             </div>
  //             <h3 className="text-lg font-medium text-gray-900">Remove Featured Status</h3>
  //             <p className="text-sm text-gray-500 mt-2">
  //               Are you sure you want to remove this blog post from featured? This will no longer highlight it on the website.
  //             </p>
  //           </div>
  //           <div className="flex justify-end space-x-3 mt-6">
  //             <button 
  //               type="button"
  //               className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
  //               onClick={() => setConfirmUnfeature(null)}
  //             >
  //               Cancel
  //             </button>
  //             <button 
  //               type="button"
  //               className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all duration-300 flex items-center"
  //               onClick={confirmUnfeatureAction}
  //               disabled={isUpdating}
  //             >
  //               {isUpdating ? (
  //                 <>
  //                   <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
  //                   Updating...
  //                 </>
  //               ) : (
  //                 <>
  //                   <FiStar className="mr-2" />
  //                   Remove Featured
  //                 </>
  //               )}
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     )}
      
  //     <style jsx>{`
  //       @keyframes fadeIn {
  //         from { opacity: 0; }
  //         to { opacity: 1; }
  //       }
  //       .animate-fadeIn {
  //         animation: fadeIn 0.3s ease-out forwards;
  //       }
  //     `}</style>
  //   </div>
  //   */
  // );
}
