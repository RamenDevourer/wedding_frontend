import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiArrowLeft, FiSave, FiEye, FiEdit, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import BlogPreview from '../blog-section/BlogPreview';
import { useAddBlogMutation, useUpdateBlogMutation } from '../../../redux/blogSlice';
import InlineTagCreator from './dashboard-components/InlineTagCreator';

const NewBlogPost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [createBlog] = useAddBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();

  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Add debug logging for tags
  useEffect(() => {
    console.log("Tags updated:", tags);
  }, [tags]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentDate] = useState(new Date());
  const [blogId, setBlogId] = useState(null);

  // Setup react-hook-form with default values
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: '',
    },
  });
  const title = watch('title');
  // Enhanced toolbar options for Quill editor
  const modules = {
    toolbar: {
      container: '#toolbar',
      handlers: {
        // Add any custom handlers here if needed
      }
    },
    clipboard: {
      matchVisual: false // Improve paste behavior
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    },
    syntax: false // Set to true if you want to enable syntax highlighting
  };

  // Save draft or publish blog post
  const saveDraft = async (formData) => {
    setSaving(true);
    const updatePayload = new FormData();
    updatePayload.append('title', formData.title);
    updatePayload.append('content', content);
    updatePayload.append('tags', JSON.stringify(tags));
    updatePayload.append('status', 'DRAFT');

    if (coverImage) {
      updatePayload.append('coverImage', coverImage);
    }

    try {
      if (blogId) {
        // Update existing blog
        await updateBlog({ id: blogId, blogData: updatePayload }).unwrap();
      } else {
        // Create new blog
        const response = await createBlog(updatePayload).unwrap();
        if (response.success) {
          // setBlogId(response.data.id);
        }
      }
      alert('Blog post saved as draft!');
      navigate('/blog_dashboard');
    } catch (error) {
      console.error('Error saving blog post:', error);
      const errMsg = error?.data?.message || error?.error || 'Unknown error';
      alert(`Error saving blog post: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish blog post
  const publishBlog = async () => {
    setSaving(true);
    const updatePayload = new FormData();
    updatePayload.append('title', watch('title'));
    updatePayload.append('content', content);
    updatePayload.append('tags', JSON.stringify(tags));
    updatePayload.append('status', 'PUBLISHED');

    if (coverImage) {
      updatePayload.append('coverImage', coverImage);
    }

    try {
      if (blogId) {
        // Update existing blog
        await updateBlog({ id: blogId, blogData: updatePayload }).unwrap();
      } else {
        // Create new blog
        const response = await createBlog(updatePayload).unwrap();
        if (response.success) {
          // setBlogId(response.data.id);
        }
      }
      alert('Blog post published successfully!');
      navigate('/blog_dashboard');
    } catch (error) {
      console.error('Error publishing blog post:', error);
      const errMsg = error?.data?.message || error?.error || 'Unknown error';
      alert(`Error publishing blog post: ${errMsg}`);
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

  return (
    <form onSubmit={handleSubmit(saveDraft)}>      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header navbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <button
              type="button"
              className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors rounded-md hover:bg-pink-50"
              onClick={() => navigate('/blog_dashboard')}
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="flex-grow mx-6">
            <input
              type="text"
              placeholder="Enter blog title here..."
              className="w-full px-5 py-3 text-xl font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all bg-white shadow-sm"
              {...register('title', { required: true })}
              disabled={isPreviewMode}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all focus:outline-none flex items-center
                ${isPreviewMode 
                  ? 'text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
              onClick={togglePreviewMode}
            >
              {isPreviewMode ? (
                <>
                  <FiEdit className="mr-2 h-4 w-4" />
                  Edit Post
                </>
              ) : (
                <>
                  <FiEye className="mr-2 h-4 w-4" />
                  Preview
                </>
              )}
            </button>
            <button
              className="px-4 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 flex items-center"
              type="submit"
              disabled={saving || isPreviewMode}
            >
              <FiSave className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={publishBlog}
              disabled={saving || isPreviewMode || !title || !content}
              className="px-4 py-2.5 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 flex items-center shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Publish
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Left sidebar - only visible in edit mode */}
          {!isPreviewMode && (            <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Blog Properties</h3>
                
                {/* Tags section */}
                <div className="mb-6">                  <label htmlFor="tags" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">Tags</span>
                    <span className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full">New tags can be created</span>
                  </label>
                  
                  {/* New Inline Tag Creator Component */}
                  <InlineTagCreator 
                    selectedTags={tags}
                    onChange={setTags}
                    maxTags={10}
                  />
                </div>

                {/* Cover image upload section with improved UI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>

                  {!coverImagePreview ? (
                    <div className="mt-1 border-2 border-gray-300 border-dashed rounded-md px-4 py-6 bg-gray-50 hover:bg-gray-100 hover:border-pink-300 transition-colors cursor-pointer">
                      <div className="space-y-2 text-center">
                        <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <label htmlFor="coverImage" className="relative cursor-pointer">
                            <span className="font-medium text-pink-600 hover:text-pink-700">Click to upload</span>
                            <span className="text-gray-500"> or drag and drop</span>
                            <input
                              id="coverImage"
                              name="coverImage"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleCoverImageChange}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <div className="relative group">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 focus:outline-none transition-all duration-300 transform scale-90 group-hover:scale-100"
                            title="Remove cover image"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 bg-white border-t border-gray-200">
                        <p className="text-sm text-gray-500 truncate" title={coverImage?.name}>
                          {coverImage?.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {coverImage?.size && (
                            Math.round(coverImage.size / 1024) + " KB"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className={`flex-grow flex flex-col overflow-hidden ${isPreviewMode ? 'bg-gray-50' : ''}`}>
            {!isPreviewMode ? (
              <>                {/* Quill Toolbar - Styled and organized */}
                <div id="toolbar" className="px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {/* Text Formatting Group */}
                    <span className="ql-formats border-r border-gray-200 pr-2">
                      <select className="ql-header" defaultValue="">
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="">Normal</option>
                      </select>
                      <select className="ql-font">
                        <option selected>Default</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                      </select>
                      <select className="ql-size">
                        <option value="small">Small</option>
                        <option selected>Normal</option>
                        <option value="large">Large</option>
                        <option value="huge">Huge</option>
                      </select>
                    </span>
                    
                    {/* Style Group */}
                    <span className="ql-formats border-r border-gray-200 pr-2">
                      <button className="ql-bold" title="Bold" />
                      <button className="ql-italic" title="Italic" />
                      <button className="ql-underline" title="Underline" />
                      <button className="ql-strike" title="Strikethrough" />
                    </span>
                    
                    {/* Alignment & Lists */}
                    <span className="ql-formats border-r border-gray-200 pr-2">
                      <select className="ql-align" />
                      <button className="ql-list" value="ordered" title="Numbered List" />
                      <button className="ql-list" value="bullet" title="Bullet List" />
                      <button className="ql-indent" value="-1" title="Decrease Indent" />
                      <button className="ql-indent" value="+1" title="Increase Indent" />
                    </span>
                    
                    {/* Special Formatting */}
                    <span className="ql-formats border-r border-gray-200 pr-2">
                      <button className="ql-blockquote" title="Quote" />
                      <button className="ql-code-block" title="Code Block" />
                      <button className="ql-link" title="Insert Link" />
                      <button className="ql-image" title="Insert Image" />
                    </span>
                    
                    {/* Colors */}
                    <span className="ql-formats">
                      <select className="ql-color" title="Text Color" />
                      <select className="ql-background" title="Background Color" />
                    </span>
                    
                    {/* Advanced */}
                    <span className="ql-formats">
                      <button className="ql-script" value="sub" title="Subscript" />
                      <button className="ql-script" value="super" title="Superscript" />
                      <button className="ql-direction" value="rtl" title="Text Direction" />
                    </span>
                  </div>
                </div>

                {/* Quill Editor - Better UI with max-width for readability */}
                <div className="px-6 py-4 overflow-y-auto flex justify-center bg-gray-50">
                  <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg border border-gray-200">
                    <ReactQuill
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      theme="snow"
                      placeholder="Write your blog content here..."
                      className="h-full min-h-[60vh]" // Minimum height for better user experience
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Preview Mode */
              <BlogPreview
                title={title}
                content={content}
                coverImagePreview={coverImagePreview}
                hashtags={tags}
                createdAt={currentDate.toISOString()}
                viewCount={0}
                isPreview={true}
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default NewBlogPost;
