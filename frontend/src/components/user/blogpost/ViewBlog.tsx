import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";
import { useBlogStore } from "@/store/blogStore";
import { Blog } from "@/types";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import { useBlogEditorStore } from "@/store/useBlogEditorStore";
import Loader from "../common/Loader";
import { formatBlogTimestamp } from "@/utils/formateDate";

export default function ViewBlog() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { getBlogById, isLoading } = useBlogStore();
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const { user } = useAuthStore();
  const { setEditingBlog } = useBlogEditorStore();

  useEffect(() => {
    if (blogId) {
      const fetchBlogDetails = async (blogId: string) => {
        const res = await getBlogById(blogId);
        if (res) {
          setCurrentBlog(res);
        } else {
          toast.error("Blog not found");
        }
      };

      fetchBlogDetails(blogId);
    } else {
      toast.error("Blog ID is not provided");
    }
  }, [blogId, getBlogById]);

  const handleEditNavigator = async (id: string) => {
    const val = await setEditingBlog(id);
    if (val) {
      navigate("/blog/edit");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="max-w-[200px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-screen">
      {currentBlog ? (
        <>
          {/* Mobile View: No Card */}
          <div className="block sm:hidden ">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Back to Blogs"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                {user?._id === currentBlog?.authorId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditNavigator(currentBlog?._id)}
                    className="text-muted-foreground hover:text-primary"
                    aria-label="Edit Blog"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground">{currentBlog.title}</h1>
              <p className="text-sm text-muted-foreground">
                By {currentBlog.authorName} |{" "}
                {currentBlog.createdAt
                  ? formatBlogTimestamp(currentBlog.createdAt)
                  : "Date Unknown"}
              </p>
            </div>
            <div className="mt-4 prose prose-invert max-w-none text-foreground">
              <MDEditor.Markdown
                source={currentBlog.content}
                className="bg-transparent text-foreground"
                style={{ background: "transparent", color: "inherit" }}
              />
            </div>
          </div>

          {/* Desktop View: With Card */}
          <div className="hidden sm:block w-full max-w-3xl mx-auto rounded-xl bg-background">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Back to Blogs"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {currentBlog.title}
                </CardTitle>
              </div>
              {user?._id === currentBlog.authorId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditNavigator(currentBlog._id)}
                  className="text-muted-foreground hover:text-primary"
                  aria-label="Edit Blog"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-invert max-w-none text-foreground">
                <MDEditor.Markdown
                  source={currentBlog.content}
                  className="bg-transparent text-foreground"
                  style={{ background: "transparent", color: "inherit" }}
                />
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                By {currentBlog.authorName} |{" "}
                {currentBlog.createdAt
                  ? formatBlogTimestamp(currentBlog.createdAt)
                  : "Date Unknown"}
              </p>
            </CardContent>
          </div>
        </>
      ) : (
        <div className="text-center text-2xl text-foreground">Blog not found!</div>
      )}
    </div>
  );
}
