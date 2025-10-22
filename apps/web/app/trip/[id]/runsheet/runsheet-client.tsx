"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Plus, Minus, Play, Pause } from "lucide-react";
import { format, isAfter, isBefore, addMinutes, subMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  getRunsheetBlocks,
  addTimeToBlock,
  subtractTimeFromBlock,
} from "./actions";

interface ItineraryBlock {
  id: string;
  trip_id: string;
  activity_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  block_order: number;
  created_at: string;
  updated_at: string;
}

interface BlockStatus {
  id: string;
  status: "past" | "current" | "next" | "future";
}

export default function RunsheetClient({ tripId }: { tripId: string }) {
  const [blocks, setBlocks] = useState<ItineraryBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [blockStatuses, setBlockStatuses] = useState<BlockStatus[]>([]);

  // Load runsheet blocks
  useEffect(() => {
    loadBlocks();
  }, [tripId]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Update block statuses when blocks or current time changes
  useEffect(() => {
    updateBlockStatuses();
  }, [blocks, currentTime]);

  const loadBlocks = async () => {
    try {
      const result = await getRunsheetBlocks(tripId);
      if (result.success) {
        setBlocks(result.data || []);
      } else {
        toast.error(result.error || "Không thể tải lịch trình");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tải lịch trình");
    } finally {
      setLoading(false);
    }
  };

  const updateBlockStatuses = () => {
    const statuses: BlockStatus[] = blocks.map((block) => {
      const startTime = new Date(block.start_time);
      const endTime = new Date(block.end_time);

      if (isBefore(currentTime, startTime)) {
        return { id: block.id, status: "future" };
      } else if (isAfter(currentTime, endTime)) {
        return { id: block.id, status: "past" };
      } else {
        return { id: block.id, status: "current" };
      }
    });

    // Mark the next block after current
    const currentIndex = statuses.findIndex((s) => s.status === "current");
    if (currentIndex >= 0 && currentIndex < statuses.length - 1) {
      statuses[currentIndex + 1].status = "next";
    }

    setBlockStatuses(statuses);
  };

  const handleAddTime = async (blockId: string) => {
    const result = await addTimeToBlock(tripId, blockId);
    if (result.success) {
      toast.success("Đã thêm 15 phút");
      loadBlocks();
    } else {
      toast.error(result.error || "Không thể điều chỉnh thời gian");
    }
  };

  const handleSubtractTime = async (blockId: string) => {
    const result = await subtractTimeFromBlock(tripId, blockId);
    if (result.success) {
      toast.success("Đã trừ 15 phút");
      loadBlocks();
    } else {
      toast.error(result.error || "Không thể điều chỉnh thời gian");
    }
  };

  const getBlockStatus = (blockId: string) => {
    return blockStatuses.find((s) => s.id === blockId)?.status || "future";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "past":
        return "bg-gray-100 text-gray-600";
      case "current":
        return "bg-green-100 text-green-800 border-green-300";
      case "next":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "future":
        return "bg-white text-gray-900";
      default:
        return "bg-white text-gray-900";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "past":
        return "Đã qua";
      case "current":
        return "Đang diễn ra";
      case "next":
        return "Tiếp theo";
      case "future":
        return "Sắp tới";
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải bảng điều khiển...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current time display */}
      <div className="text-center py-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Clock className="w-5 h-5" />
          <span>
            Thời gian hiện tại:{" "}
            {format(currentTime, "HH:mm - dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {blocks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Chưa có hoạt động nào trong lịch trình
              </p>
            </CardContent>
          </Card>
        ) : (
          blocks.map((block) => {
            const status = getBlockStatus(block.id);
            const startTime = new Date(block.start_time);
            const endTime = new Date(block.end_time);
            const duration = Math.round(
              (endTime.getTime() - startTime.getTime()) / (1000 * 60)
            );

            return (
              <Card
                key={block.id}
                className={`transition-all duration-300 ${getStatusColor(status)} ${
                  status === "current" ? "ring-2 ring-green-500 shadow-lg" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{block.title}</CardTitle>
                        <Badge
                          variant={
                            status === "current" ? "default" : "secondary"
                          }
                          className={status === "current" ? "bg-green-600" : ""}
                        >
                          {getStatusText(status)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(startTime, "HH:mm", { locale: vi })} -{" "}
                            {format(endTime, "HH:mm", { locale: vi })}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {duration} phút
                          </Badge>
                        </div>
                        {block.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{block.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time adjustment buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubtractTime(block.id)}
                        className="h-8 w-8 p-0"
                        disabled={status === "past"}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTime(block.id)}
                        className="h-8 w-8 p-0"
                        disabled={status === "past"}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {block.notes && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {block.notes}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Chú thích:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <span>Đã qua</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>Đang diễn ra</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Tiếp theo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border rounded"></div>
              <span>Sắp tới</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sử dụng nút + và - để điều chỉnh thời gian khi cần thiết
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
