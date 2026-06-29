import { useState, useEffect } from "react";

interface DownloadItem {
  id: string;
  title: string;
  description: string;
  category: "form" | "guide" | "material" | "template";
  fileType: "pdf" | "doc" | "xls" | "zip";
  fileSize: string;
  downloadUrl: string;
  downloadCount: number;
  updatedAt: string;
}

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"form" | "guide" | "material" | "template" | null>(null);
  const [loading, setLoading] = useState(true);

  const mockDownloads: DownloadItem[] = [
    {
      id: "1",
      title: "Biểu mẫu hồ sơ EPS-TOPIK",
      description: "Mẫu đơn đăng ký thi EPS-TOPIK và các biểu mẫu cần thiết",
      category: "form",
      fileType: "pdf",
      fileSize: "2.5 MB",
      downloadUrl: "#",
      downloadCount: 1234,
      updatedAt: "2026-06-15",
    },
    {
      id: "2",
      title: "Hướng dẫn điền hồ sơ XKLĐ",
      description: "Hướng dẫn chi tiết cách điền các loại biểu mẫu hồ sơ",
      category: "guide",
      fileType: "pdf",
      fileSize: "1.8 MB",
      downloadUrl: "#",
      downloadCount: 892,
      updatedAt: "2026-06-10",
    },
    {
      id: "3",
      title: "Danh sách từ vựng EPS quan trọng",
      description: "1000 từ vựng EPS-TOPIK thường xuất hiện nhất",
      category: "material",
      fileType: "xls",
      fileSize: "500 KB",
      downloadUrl: "#",
      downloadCount: 2341,
      updatedAt: "2026-06-20",
    },
    {
      id: "4",
      title: "Mẫu CV tiếng Hàn",
      description: "Mẫu CV tiếng Hàn chuẩn format cho hồ sơ XKLĐ",
      category: "template",
      fileType: "doc",
      fileSize: "150 KB",
      downloadUrl: "#",
      downloadCount: 567,
      updatedAt: "2026-06-05",
    },
    {
      id: "5",
      title: "Hướng dẫn chuẩn bị đi thi EPS",
      description: "Những điều cần biết và chuẩn bị trước ngày thi",
      category: "guide",
      fileType: "pdf",
      fileSize: "1.2 MB",
      downloadUrl: "#",
      downloadCount: 1876,
      updatedAt: "2026-06-18",
    },
    {
      id: "6",
      title: "Biểu mẫu cam kết sức khỏe",
      description: "Mẫu cam kết sức khỏe theo quy định Bộ LĐTBXH",
      category: "form",
      fileType: "pdf",
      fileSize: "300 KB",
      downloadUrl: "#",
      downloadCount: 432,
      updatedAt: "2026-06-12",
    },
  ];

  useEffect(() => {
    setDownloads(mockDownloads);
    setLoading(false);
  }, []);

  const filterByCategory = (category: "form" | "guide" | "material" | "template") => {
    setSelectedCategory(category);
  };

  const clearFilter = () => {
    setSelectedCategory(null);
  };

  const getFilteredDownloads = () => {
    if (!selectedCategory) return downloads;
    return downloads.filter(d => d.category === selectedCategory);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "form": return "Biểu mẫu";
      case "guide": return "Hướng dẫn";
      case "material": return "Tài liệu";
      case "template": return "Mẫu";
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "form": return "ri-file-list-3-line";
      case "guide": return "ri-book-open-line";
      case "material": return "ri-folder-line";
      case "template": return "ri-file-copy-line";
      default: return "ri-file-line";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "form": return "#f97316";
      case "guide": return "#60a5fa";
      case "material": return "#4ade80";
      case "template": return "#a78bfa";
      default: return "#94a3b8";
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf": return "ri-file-pdf-line";
      case "doc": return "ri-file-word-line";
      case "xls": return "ri-file-excel-line";
      case "zip": return "ri-file-zip-line";
      default: return "ri-file-line";
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "pdf": return "#ef4444";
      case "doc": return "#3b82f6";
      case "xls": return "#10b981";
      case "zip": return "#f59e0b";
      default: return "#94a3b8";
    }
  };

  return {
    downloads,
    selectedCategory,
    loading,
    filterByCategory,
    clearFilter,
    getFilteredDownloads,
    getCategoryLabel,
    getCategoryIcon,
    getCategoryColor,
    getFileTypeIcon,
    getFileTypeColor,
  };
}
