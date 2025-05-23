import { FC, useEffect, useState } from "react";
import BlogCard from "../common/BlogCard";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Pencil, Trash2, Clipboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useSidebar } from "@/components/ui/sidebar";
import { showConfirmDialog } from "@/store/slices/confirmDialogSlice";
import useAuthStore from "@/store/authStore";
import { useBlogStore } from "@/store/blogStore";
import Pagination from "@/components/user/common/Pagination";
import Loader from "../common/Loader";
import { useBlogEditorStore } from "@/store/useBlogEditorStore";
import { toast } from "sonner";
const TAB_OPTIONS = ["Posts", "Archieve", "Saved"] as const;

const ProfileFeed: FC = () => {
  const [activeTab, setActiveTab] = useState<"Posts" | "Archieve" | "Saved">(
    "Posts"
  );
  const { getBlogsByAuthor, deleteBlog, authorId, profileFeeds, isLoading } = useBlogStore()
  const { setEditingBlog } = useBlogEditorStore()
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useAuthStore();
  const dispatch = useDispatch<AppDispatch>();
  const { state } = useSidebar()
  const navigate = useNavigate()

  useEffect(() => {
    switch (activeTab) {
      case "Posts":
        if (authorId) {
          getBlogsByAuthor( authorId, currentPage)
        }
        break;
      case "Archieve":
        console.log('archieve')
        break;
      case "Saved":
        console.log('Saved');
        break;
    }

  }, [getBlogsByAuthor, activeTab, authorId, currentPage]);


  const handleDelete = (blogId: string) => {
    deleteBlog(blogId, user?._id as string)
  };


  const onPageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditNavigator = async (id: string) => {
    const val = await setEditingBlog(id)
    if (val) {
      navigate(`/blog/edit`)
    }
  }



  return (
    <div className="my-4 lg:m-0 h-full  flex-1 max-w-[1000px] relative lg:border-x">
      <div className="flex gap-4 justify-around border-b text-gray-600 sticky top-[73px] z-20 bg-white dark:bg-black">
        {TAB_OPTIONS.map((tab) => (
          <div className="relative">
            <button
              key={tab}
              className={`px-5 py-2 rounded-lg text-md dark:hover:bg-neutral-500/10 hover:bg-gray-200/30 ${activeTab === tab
                ? "font-semibold dark:text-white "
                : "font-medium"
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 w-12 -translate-x-1/2 border-b-2 dark:border-white border-black"></div>
            )}
          </div>
        ))}
      </div>
      {
        isLoading ?
          <div className="flex items-center justify-center h-full">
            <Loader className="max-w-[200px]" />
          </div>
          :
          <>
            <div className="flex justify-center  lg:overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className={`grid ${state === 'expanded' ? "xl:grid-cols-2 " : "xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2"} grid-cols-1 gap-4 h-fit justify-center  mt-5 px-4 pb-4 w-full`}>
                {activeTab === 'Posts' && profileFeeds?.blogs.length > 0 ? (
                  profileFeeds?.blogs.map((blog, index) => (
                    <div
                      key={index}
                      className="p-2 border-2 rounded-lg max-w-[400px] flex flex-col justify-between relative">

                      <Link to={`/blog/${blog._id}`}>
                        <BlogCard blog={blog} />
                      </Link>

                      <div className="flex gap-2 justify-around mt-5 max-h-12 text-muted-foreground border-t py-2">
                        {user?._id === blog?.authorId && <div className="flex items-center gap-2 justify-center  w-fit rounded border border-muted">
                          <div
                            className="flex items-center justify-center p-2 w-fit rounded hover:bg-muted cursor-pointer"
                            onClick={() =>
                              dispatch(
                                showConfirmDialog({
                                  title: "Are you sure you want to delete?",
                                  description: "You will not be able to recover it.",
                                  confirmText: "Delete",
                                  cancelText: "Cancel",
                                  onConfirm: () => handleDelete(blog._id),
                                })
                              )}
                          >
                            <Trash2 size={17} strokeWidth={1} />
                          </div>
                          <div className="h-[25px] bg-muted-foreground/30 w-[1.5px]"></div>

                          <div
                            onClick={() => handleEditNavigator(blog?._id)}
                            className="flex items-center justify-center gap-2 p-2 w-fit rounded hover:bg-muted cursor-pointer text-sm"
                          >
                            <Pencil size={17} strokeWidth={1} />
                          </div>
                        </div>}

                        <div
                          className="flex items-center justify-center p-2 w-fit rounded hover:bg-muted cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(`http://inker-dev.vercel.app/blog/${blog?._id}`);
                            toast.success("Blog link copied!");
                          }}
                          title="Copy blog link"
                        >
                          <Clipboard size={17} strokeWidth={1} />
                        </div>

                        <div className="flex items-center justify-center gap-2 p-2 w-fit rounded hover:bg-muted cursor-pointer text-sm">
                          {blog.comments}
                          <MessageCircle size={19} strokeWidth={1} />
                        </div>
                        <div className="flex items-center gap-2 justify-center  w-fit rounded border border-muted">
                          <div className="flex gap-2 justify-center items-center text-sm">
                            <button className="flex items-center justify-center p-2 w-fit rounded hover:bg-muted cursor-pointer">
                              <ArrowBigUp size={17} strokeWidth={1} />
                            </button>
                            {blog?.likes}
                            <div className="h-[25px] bg-muted-foreground/30 w-[1.5px]"></div>
                          </div>
                          <button className="flex items-center justify-center p-2 w-fit rounded hover:bg-muted cursor-pointer">
                            <ArrowBigDown size={17} strokeWidth={1} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center text-2xl font-medium  col-span-3 mt-14">No posts available !</p>
                )}
              </div>
            </div>

            <Pagination onPageChange={onPageChange} currentPage={currentPage} totalPages={profileFeeds?.totalPages} />
          </>
      }

    </div>
  );
};

export default ProfileFeed;
