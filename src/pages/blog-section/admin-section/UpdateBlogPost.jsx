import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BlogPreview from '../blog-section/BlogPreview';
import { useUpdateBlogMutation, useGetBlogByUrlTitleQuery } from '../../../redux/blogSlice';
import InlineTagCreator from './dashboard-components/InlineTagCreator';
import { FiArrowLeft, FiSave, FiEye, FiEdit, FiUploadCloud, FiTrash2 } from 'react-icons/fi';

export default function UpdateBlogPost() {
  const navigate = useNavigate();
  const { urlTitle } = useParams(); // Get the blog URL title from the URL params
  const [updateBlog] = useUpdateBlogMutation();
  const { data: blog, isLoading, isError } = useGetBlogByUrlTitleQuery(urlTitle); // Fetch blog data
  
  // State variables for form fields
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [tags, setTags] = useState([]);
  const [createdAt, setCreatedAt] = useState('');
  const [viewCount, setViewCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Setup react-hook-form with default values
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      id: '',
    },
  });

  const title = watch('title');

  // Pre-fill the form when blog data is loaded
  useEffect(() => {
    if (blog) {
      // Assume blog.data contains the necessary fields
      setValue('title', blog.data.title || '');
      setValue('id', blog.data.id || '');
      setContent(blog.data.content || ''); // Set content
      setTags(blog.data.tags ? blog.data.tags.map(tag => tag.tagName) : []); // Set tags
      setCoverImagePreview(blog.data.coverImage || '');
      setCreatedAt(blog.data.createdAt || '');
      setViewCount(blog.data.viewCount || 0);
    }
  }, [blog, setValue]);

  // Custom toolbar options for Quill editor
  const modules = {
    toolbar: {
      container: '#toolbar',
    },
    clipboard: { matchVisual: false },
    history: { delay: 1000, maxStack: 50, userOnly: true },
  };

  // Save or update the blog post
  const saveDraft = async (formData) => {
    setSaving(true);

    const updatePayload = new FormData();
    updatePayload.append('title', formData.title);
    updatePayload.append('content', content);
    updatePayload.append('tags', JSON.stringify(tags));
    
    if (coverImage) {
      updatePayload.append('coverImage', coverImage);
    }

    try {
      await updateBlog({ id: blog.data.id, blogData: updatePayload }).unwrap();
      alert('Blog post updated successfully!');
      navigate('/blog_dashboard'); // Navigate back to the dashboard
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert('Error updating blog post.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cover image upload
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove cover image
  const removeCoverImage = () => {
    setCoverImage('');
    setCoverImagePreview('');
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Display loading or error states
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading blog post.</div>;

  return (
    <form onSubmit={handleSubmit(saveDraft)}>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header navbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
          {/* Back button */}
          <button type="button" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600" onClick={() => navigate('/blog_dashboard')}>
            <FiArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </button>
          
          {/* Title input */}
          <input
            {...register('title', { required: true })}
            disabled={isPreviewMode}
            className="flex-grow mx-6 px-5 py-3 text-xl border rounded-lg focus:ring-2 focus:ring-pink-500"
            placeholder="Enter blog title here..."
          />
          
          {/* Preview & Save buttons */}
          <div className="flex items-center space-x-3">
            <button type="button" onClick={togglePreviewMode} className={`px-4 py-2 rounded-md ${isPreviewMode?'bg-pink-50 text-pink-700':'bg-white text-gray-700'}`}>
              {isPreviewMode? <><FiEdit className="mr-1"/> Edit Post</>: <><FiEye className="mr-1"/> Preview</>}
            </button>
            <button type="submit" disabled={saving||isPreviewMode} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md">
              <FiSave className="mr-1"/>{saving?'Saving...':'Save Draft'}
            </button>
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar */}
          {!isPreviewMode && (
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
               <div className="p-6">
                 <h3 className="text-lg font-medium">Blog Properties</h3>

                {/* Tags section */}
                <div className="mb-6">
                  <label className="block mb-2">Tags</label>
                  <InlineTagCreator selectedTags={tags} onChange={setTags} maxTags={10} />
                 </div>

                {/* Cover image upload */}
                <div>
                   <label className="block mb-2">Cover Image</label>

                  {!coverImagePreview ? (
                     <div className="border-2 border-dashed rounded-md p-6 text-center">
                      <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                       <p className="mt-2 text-sm">Click to upload or drag and drop</p>
                       <input type="file" accept="image/*" className="sr-only" onChange={handleCoverImageChange} />
                     </div>
                   ) : (
                     <div className="relative">
                      <img src={coverImagePreview} className="w-full h-48 object-cover rounded-md" />
                       <button type="button" onClick={removeCoverImage} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                         <FiTrash2 />
                       </button>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           )}

           {/* Main editor */}
           <div className={`flex-grow flex flex-col overflow-hidden ${isPreviewMode?'bg-gray-50':''}`}>
             {!isPreviewMode?
             (<>
              {/* Quill Toolbar */}
               <div id="toolbar" className="px-6 py-3 bg-white border-b sticky top-0">
                {/* copy NewBlogPost toolbar groups here */}
               </div>

              {/* Quill Editor */}
               <div className="flex-grow p-6 bg-gray-50 overflow-y-auto">
                 <ReactQuill value={content} onChange={setContent} modules={modules} theme="snow" className="h-full min-h-[60vh]" />
               </div>
             </>) : (
               <BlogPreview title={title} content={content} coverImagePreview={coverImagePreview} hashtags={tags} createdAt={createdAt} viewCount={viewCount} />
             )}
           </div>
         </div>
       </div>
     </form>
  );
};
