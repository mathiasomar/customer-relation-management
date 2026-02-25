"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ContactsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function ContactsPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ContactsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push(`${pathname}?${createQueryString("page", page.toString())}`);
    }
  };

  const handlePageSizeChange = (size: string) => {
    const newSize = parseInt(size);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      router.push(
        `${pathname}?${createQueryString("limit", newSize.toString())}&page=1`,
      );
    }
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(e.currentTarget.value);
      if (page >= 1 && page <= totalPages) {
        handlePageChange(page);
      }
    }
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Items per page selector */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Rows per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="h-8 w-17.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Page info */}
      <div className="text-sm text-muted-foreground order-first sm:order-0">
        Showing <span className="font-medium">{startItem}</span> -{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {totalPages <= 7 ? (
            // Show all pages if 7 or less
            [...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))
          ) : (
            // Show limited pages with ellipsis
            <>
              {/* First page */}
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(1)}
              >
                1
              </Button>

              {/* Left ellipsis */}
              {currentPage > 3 && (
                <span className="text-muted-foreground px-1">...</span>
              )}

              {/* Current page neighborhood */}
              {[...Array(totalPages)]
                .map((_, i) => i + 1)
                .filter(
                  (page) =>
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) <= 2,
                )
                .map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}

              {/* Right ellipsis */}
              {currentPage < totalPages - 2 && (
                <span className="text-muted-foreground px-1">...</span>
              )}

              {/* Last page */}
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>

        {/* Go to page input */}
        <div className="hidden md:flex items-center gap-2 ml-2">
          <span className="text-sm text-muted-foreground">Go to</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            onKeyDown={handleGoToPage}
            className="h-8 w-16"
          />
        </div>
      </div>
    </div>
  );
}
