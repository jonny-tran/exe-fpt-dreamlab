"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, MapPin, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getActivities,
  getActivityCategories,
  searchActivities,
} from "@/lib/actions/activity-actions";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  category: string | null;
  cost_level: string | null;
  tags: string[] | null;
}

interface ActivityLibraryProps {
  onSelectActivity: (
    activityId: string,
    startTime: string,
    endTime: string,
    location?: string
  ) => void;
  tripId: string;
}

export function ActivityLibrary({
  onSelectActivity,
  tripId,
}: ActivityLibraryProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activitiesResult, categoriesResult] = await Promise.all([
        getActivities(),
        getActivityCategories(),
      ]);

      if (activitiesResult.success) {
        setActivities(activitiesResult.data || []);
      }
      if (categoriesResult.success) {
        setCategories(categoriesResult.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải thư viện hoạt động");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const result = await searchActivities(query);
        if (result.success) {
          setActivities(result.data || []);
        }
      } catch (error) {
        toast.error("Không thể tìm kiếm hoạt động");
      }
    } else {
      loadData();
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (selectedCategory === "all") return true;
    return activity.category === selectedCategory;
  });

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    // Tự động tính end time dựa trên duration
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour from now
    const end = new Date(
      start.getTime() + activity.duration_minutes * 60 * 1000
    );

    setStartTime(start.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:MM format
    setEndTime(end.toISOString().slice(0, 16));
  };

  const handleAddToItinerary = () => {
    if (!selectedActivity || !startTime || !endTime) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    onSelectActivity(
      selectedActivity.id,
      startTime,
      endTime,
      location || undefined
    );
    setSelectedActivity(null);
    setStartTime("");
    setEndTime("");
    setLocation("");
  };

  const getCostLevelColor = (costLevel: string | null) => {
    switch (costLevel) {
      case "free":
        return "bg-green-100 text-green-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCostLevelText = (costLevel: string | null) => {
    switch (costLevel) {
      case "free":
        return "Miễn phí";
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Đang tải thư viện hoạt động...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search và Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm hoạt động..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Danh sách hoạt động */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hoạt động có sẵn</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Không tìm thấy hoạt động nào
              </p>
            ) : (
              filteredActivities.map((activity) => (
                <Card
                  key={activity.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedActivity?.id === activity.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => handleSelectActivity(activity)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {activity.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.duration_minutes} phút</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getCostLevelColor(activity.cost_level)}`}
                        >
                          {getCostLevelText(activity.cost_level)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {activity.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Form thêm vào lịch trình */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thêm vào lịch trình</h3>

          {selectedActivity ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedActivity.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{selectedActivity.duration_minutes} phút</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getCostLevelColor(selectedActivity.cost_level)}`}
                  >
                    {getCostLevelText(selectedActivity.cost_level)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="startTime">Thời gian bắt đầu</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (e.target.value) {
                        const start = new Date(e.target.value);
                        const end = new Date(
                          start.getTime() +
                            selectedActivity.duration_minutes * 60 * 1000
                        );
                        setEndTime(end.toISOString().slice(0, 16));
                      }
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">Thời gian kết thúc</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Địa điểm (tùy chọn)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Nhập địa điểm..."
                  />
                </div>

                <Button onClick={handleAddToItinerary} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm vào lịch trình
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Chọn một hoạt động từ danh sách bên trái để thêm vào lịch
                  trình
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
