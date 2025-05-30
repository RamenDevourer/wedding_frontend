import React, { useState } from 'react';
import { 
  useGetAllTagsQuery, 
  useAddTagMutation, 
  useUpdateTagMutation, 
  useDeleteTagMutation 
} from '../../../../redux/blogSlice';

export default function Tags() {
  const { data: tags, isLoading, refetch } = useGetAllTagsQuery();
  const [addTag] = useAddTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  const [newTag, setNewTag] = useState({ name: '', description: '' });
  const [editingTag, setEditingTag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;
    
    try {
      await addTag({ name: newTag.name, description: newTag.description }).unwrap();
      setNewTag({ name: '', description: '' });
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
        body: { name: editingTag.name, description: editingTag.description } 
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

  return (
    <div className="tags-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Tags</h2>
      </div>

      {/* Create Tag Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Create New Tag</h3>
        <form onSubmit={handleCreateTag} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name
            </label>
            <input 
              type="text" 
              className="w-full border rounded px-3 py-2"
              value={newTag.name}
              onChange={(e) => setNewTag({...newTag, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea 
              className="w-full border rounded px-3 py-2"
              value={newTag.description}
              onChange={(e) => setNewTag({...newTag, description: e.target.value})}
              rows="2"
            />
          </div>
          <div>
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Tag
            </button>
          </div>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium p-6 border-b">All Tags</h3>
        {isLoading ? (
          <div className="text-center p-6">Loading tags...</div>
        ) : (
          <div className="divide-y">
            {tags?.length > 0 ? (
              tags.map(tag => (
                <div key={tag.id} className="p-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-lg">{tag.name}</h4>
                    {tag.description && (
                      <p className="text-gray-500 mt-1">{tag.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      {tag.blogCount || 0} posts
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(tag)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-gray-500">
                No tags found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Tag Modal */}
      {isModalOpen && editingTag && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Edit Tag</h3>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea 
                  className="w-full border rounded px-3 py-2"
                  value={editingTag.description || ''}
                  onChange={(e) => setEditingTag({...editingTag, description: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
