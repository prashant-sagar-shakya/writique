import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  FC,
} from "react";
import { Blog } from "@/lib/blog-data";

interface BlogContextType {
  blogs: Blog[];
  addBlog: (blog: Blog) => void;
  deleteBlog: (id: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
  initialBlogs?: Blog[];
}

export const BlogProvider: FC<BlogProviderProps> = ({
  children,
  initialBlogs = [],
}) => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const addBlog = (newBlog: Blog) => {
    setBlogs((prevBlogs) => [newBlog, ...prevBlogs]);
  };

  const deleteBlog = (id: string) => {
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
  };

  return (
    <BlogContext.Provider value={{ blogs, addBlog, deleteBlog }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogs = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlogs must be used within a BlogProvider");
  }
  return context;
};
