import { useState, useEffect } from 'react';
import { 
  useGetAllTagsQuery, 
  useAddTagMutation, 
  useUpdateTagMutation, 
  useDeleteTagMutation 
} from '../../../../redux/blogSlice';
// Import sample data for visualization (you can remove this import when connected to real API)
import { sampleTags } from './sampleBlogData';

export default function Tags() {
  const { data: tags, isLoading, refetch } = useGetAllTagsQuery();
  const [addTag] = useAddTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  const [newTag, setNewTag] = useState({ name: '' });
  const [editingTag, setEditingTag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, []);

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;
    
    try {
      await addTag({ name: newTag.name }).unwrap();
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
        body: { name: editingTag.name } 
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
    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      await deleteTag({ id }).unwrap();
      refetch();
      alert('Tag deleted successfully');
    } catch (error) {
      alert('Failed to delete tag: ' + (error.data?.message || 'Unknown error'));
    }
  };

  const openEditModal = (tag) => {
    setEditingTag({ ...tag });
    setIsModalOpen(true);
  };

  // Get tags from API or use sample data if no API data available
  const getTagsList = () => {
    if (tags && tags.length > 0) return tags;
    return sampleTags;
  };
  
  const tagsList = getTagsList();

  return (
    <div className="tags-container">
      {/* Create Tag Form */}
      <div className={`bg-white rounded-lg shadow-lg p-6 mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        <div className="flex items-center mb-4">
          <div className="bg-pink-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Tag
            </button>
          </div>
        </form>
      </div>

      {/* Tags List */}
      <div className={`bg-white rounded-lg shadow-lg transform transition-all duration-500 delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        <div className="border-b px-6 py-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800">All Tags</h3>
        </div>
        
        {isLoading ? (
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tags...</p>
          </div>
        ) : (
          <div className="divide-y">
            {tagsList?.length > 0 ? (
              tagsList.map((tag, index) => (                <div 
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-lg text-gray-800">{tag.name}</h4>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-600 hover:text-red-900 transition-all duration-300 p-2 rounded-full hover:bg-red-50"
                      title="Delete tag"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
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
          </div>
        )}
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
            </div>            <form onSubmit={handleUpdateTag} className="space-y-4">
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
    </div>
  );
}
