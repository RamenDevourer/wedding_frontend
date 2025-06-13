import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetAllTagsQuery, 
  useAddTagMutation, 
  useUpdateTagMutation, 
  useDeleteTagMutation 
} from '../../../../redux/blogSlice';
import { 
  FiPlus, FiTag, FiEdit2, FiTrash2, FiSearch, FiFilter,
  FiChevronLeft, FiChevronRight, FiX, FiCheck, FiAlertCircle
} from 'react-icons/fi';
// Import sample data for visualization (you can remove this import when connected to real API)
// import { sampleTags } from './sampleBlogData';

export default function Tags() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tagsPerPage, setTagsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'name', 'usage'
  const [animate, setAnimate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Get all tags with pagination parameters
  const { data: tagsData, isLoading, refetch } = useGetAllTagsQuery({
    s: (currentPage - 1) * tagsPerPage,
    t: tagsPerPage,
    search: searchTerm || undefined,
    sort: sortBy
  }, {
    refetchOnMountOrArgChange: true
  });
  
  const [addTag, { isLoading: isCreating }] = useAddTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  const [newTag, setNewTag] = useState({ name: '' });
  const [editingTag, setEditingTag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Calculate total pages based on tag count
  const totalItems = tagsData?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / tagsPerPage));
  
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
    // Search is already handled by the query parameters
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;
    
    try {
      await addTag({ tagName: newTag.name }).unwrap();
      setNewTag({ name: '' });
      refetch();
      alert('Tag created successfully');
    } catch (error) {
      alert('Failed to create tag: ' + (error.data?.message || 'Unknown error'));
    }
  };
  
  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!editingTag?.name.trim()) return;

    try {
      await updateTag({ 
        id: editingTag.id, 
        body: { tagName: editingTag.name } 
      }).unwrap();
      setEditingTag(null);
      setIsModalOpen(false);
      refetch();
      alert('Tag updated successfully');
    } catch (error) {
      alert('Failed to update tag: ' + (error.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteTag = async (id) => {
    // Set the tag ID to confirm deletion (shows the modal)
    setConfirmDelete(id);
  };
  
  const confirmDeleteTag = async () => {
    try {
      await deleteTag({ id: confirmDelete }).unwrap();
      refetch();
      setConfirmDelete(null); // Close the dialog
    } catch (error) {
      alert('Failed to delete tag: ' + (error.data?.message || 'Unknown error'));
    }
  };
  
  const openEditModal = (tag) => {
    // Convert tagName to name for the form fields
    setEditingTag({ 
      ...tag,
      name: tag.tagName // Add a 'name' property for the form to use
    });
    setIsModalOpen(true);
  };
  
  // Get tags from API
  const getTagsList = () => {
    if (tagsData?.data && Array.isArray(tagsData.data)) return tagsData.data;
    return []; // Return empty array if no tags are available
  };
  
  const tagsList = getTagsList();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="tags-container">
        {/* Header */}
        <div className={`mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tag Management</h1>
          <p className="text-gray-600">Sheets Link.</p>
          <a 
            href="https://docs.google.com/spreadsheets/d/1FnZb9ohAL06jxDXuI-75W-AZY2xLmueMFkeaQZVGWXg/edit?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Use this link to manage tags.
          </a>
        </div>
        {/* Create Tag Form */}
        <div className={`bg-white rounded-lg shadow-lg p-6 mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <div className="flex items-center mb-4">
            <div className="bg-pink-100 p-2 rounded-full mr-3">
              <FiPlus className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Create New Tag</h3>
          </div>
          <form onSubmit={handleCreateTag} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input 
                type="text" 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-all duration-300"
                value={newTag.name}
                onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                placeholder="Enter tag name (e.g., Wedding Planning, Venues)"
                required
              />
            </div>
            <div>
              <button 
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus className="h-5 w-5 mr-2" />
                    Create Tag
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Tags List */}
        <div className={`bg-white rounded-lg shadow-lg transform transition-all duration-500 delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <FiTag className="h-5 w-5 text-indigo-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-800">All Tags</h3>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <form onSubmit={handleSearch} className="flex">
                  <div className="relative">
                    <input
                      type="text"
                      className="pl-9 pr-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
                      placeholder="Search tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    {searchTerm && (
                      <button 
                        type="button" 
                        onClick={handleClearSearch}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
              
              <div className="relative">
                <button
                  className="px-3 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('sortDropdown').classList.toggle('hidden')}
                >
                  <FiFilter className="mr-2" />
                  Sort
                </button>
                <div id="sortDropdown" className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border z-10 hidden">
                  <div className="py-1 w-48">
                    <button 
                      onClick={() => { setSortBy('latest'); document.getElementById('sortDropdown').classList.add('hidden'); }}
                      className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'latest' ? 'bg-indigo-50 text-indigo-800' : ''}`}
                    >
                      Latest
                    </button>
                    <button 
                      onClick={() => { setSortBy('name'); document.getElementById('sortDropdown').classList.add('hidden'); }}
                      className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'name' ? 'bg-indigo-50 text-indigo-800' : ''}`}
                    >
                      Name (A-Z)
                    </button>
                    <button 
                      onClick={() => { setSortBy('usage'); document.getElementById('sortDropdown').classList.add('hidden'); }}
                      className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'usage' ? 'bg-indigo-50 text-indigo-800' : ''}`}
                    >
                      Most Used
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading tags...</p>
            </div>
          ) : (
            <div className="divide-y">
              {tagsList?.length > 0 ? (
                tagsList.map((tag, index) => (
                  <div 
                    key={tag.id} 
                    className={`p-6 flex justify-between items-center transform transition-all duration-500 hover:bg-gray-50 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0'}`}
                    style={{ transitionDelay: `${index * 50 + 200}ms` }}
                  >
                    <div>
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-md mr-3 flex items-center justify-center text-white"
                          style={{ 
                            background: `linear-gradient(135deg, hsl(${(index * 60) % 360}, 80%, 65%), hsl(${(index * 60 + 40) % 360}, 80%, 45%))`,
                            boxShadow: `0 3px 10px -3px hsla(${(index * 60) % 360}, 80%, 65%, 0.5)` 
                          }}
                        >
                          <FiTag className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium text-lg text-gray-800">{tag.tagName}</h4>
                      </div>
                      <div className="text-sm text-gray-500 mt-2 ml-11">
                        <span className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                          {tag.blogCount || 0} {tag.blogCount === 1 ? 'post' : 'posts'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openEditModal(tag)}
                        className="text-indigo-600 hover:text-indigo-900 transition-all duration-300 p-2 rounded-full hover:bg-indigo-50"
                        title="Edit tag"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-red-600 hover:text-red-900 transition-all duration-300 p-2 rounded-full hover:bg-red-50"
                        title="Delete tag"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p>No tags found</p>
                </div>
              )}
              
              {/* Pagination Controls */}
              {tagsList?.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>
                      Showing {Math.min((currentPage - 1) * tagsPerPage + 1, totalItems)} to {Math.min(currentPage * tagsPerPage, totalItems)} of {totalItems} tags
                    </span>
                    <div className="ml-4 flex items-center">
                      <label htmlFor="tagsPerPage" className="mr-2">Per page</label>
                      <select 
                        id="tagsPerPage" 
                        className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-300"
                        value={tagsPerPage}
                        onChange={(e) => {
                          setTagsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        {[5, 10, 25, 50].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                      aria-label="Previous page"
                    >
                      <FiChevronLeft />
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        // Logic to show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }
                        
                        if (totalPages > 5) {
                          // Show first page
                          if (idx === 0 && pageNum > 1) {
                            return (
                              <div key="start" className="flex space-x-1">
                                <button
                                  key="1"
                                  onClick={() => setCurrentPage(1)}
                                  className={`w-8 h-8 flex items-center justify-center rounded-lg ${1 === currentPage ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                  1
                                </button>
                                {pageNum > 2 && (
                                  <span className="w-8 h-8 flex items-center justify-center text-gray-500">
                                    ...
                                  </span>
                                )}
                              </div>
                            );
                          }
                          
                          // Show last page
                          if (idx === 4 && pageNum < totalPages) {
                            return (
                              <div key="end" className="flex space-x-1">
                                {pageNum < totalPages - 1 && (
                                  <span className="w-8 h-8 flex items-center justify-center text-gray-500">
                                    ...
                                  </span>
                                )}
                                <button
                                  key={totalPages}
                                  onClick={() => setCurrentPage(totalPages)}
                                  className={`w-8 h-8 flex items-center justify-center rounded-lg ${totalPages === currentPage ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                  {totalPages}
                                </button>
                              </div>
                            );
                          }
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg ${pageNum === currentPage ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                      aria-label="Next page"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Tag Modal */}
      {isModalOpen && editingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Edit Tag</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                  placeholder="Enter tag name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-300"
                >
                  Update Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
      
      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-scaleIn">
            <div className="mb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this tag? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center"
                onClick={confirmDeleteTag}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
