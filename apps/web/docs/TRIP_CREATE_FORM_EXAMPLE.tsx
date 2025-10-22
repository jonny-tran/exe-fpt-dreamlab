import { createTrip } from "@/app/trip/create/actions";
import { tripBriefSchema } from "@/lib/schemas/trip-brief.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TripCreateFormProps {
  destinationId: string;
}

export function TripCreateForm({ destinationId }: TripCreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse và validate dữ liệu form
      const rawData = {
        title: formData.get("title") as string,
        dates: {
          from: new Date(formData.get("startDate") as string),
          to: new Date(formData.get("endDate") as string),
        },
        participants: Number(formData.get("participants")),
        budget: formData.get("budget")
          ? Number(formData.get("budget"))
          : undefined,
        goals: (formData.get("goals") as string) || undefined,
      };

      // Validate với Zod schema
      const values = tripBriefSchema.parse(rawData);

      // Gọi Server Action
      const result = await createTrip({
        values,
        destinationId,
      });

      if (result.success) {
        // Redirect đến trang trip detail
        router.push(`/trip/${result.data.newTripId}`);
      } else {
        setError(result.error);
      }
    } catch (validationError: any) {
      // Handle Zod validation errors
      if (validationError.errors) {
        const errorMessages = validationError.errors.map(
          (err: any) => err.message
        );
        setError(errorMessages.join(", "));
      } else {
        setError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Tên chuyến đi
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Ví dụ: Du lịch Đà Nẵng 3 ngày 2 đêm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Ngày bắt đầu
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            Ngày kết thúc
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="participants"
          className="block text-sm font-medium text-gray-700"
        >
          Số người tham gia
        </label>
        <input
          type="number"
          id="participants"
          name="participants"
          min="2"
          max="100"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="2"
        />
      </div>

      <div>
        <label
          htmlFor="budget"
          className="block text-sm font-medium text-gray-700"
        >
          Ngân sách (VND) - Tùy chọn
        </label>
        <input
          type="number"
          id="budget"
          name="budget"
          min="0"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="5000000"
        />
      </div>

      <div>
        <label
          htmlFor="goals"
          className="block text-sm font-medium text-gray-700"
        >
          Mục tiêu chuyến đi - Tùy chọn
        </label>
        <textarea
          id="goals"
          name="goals"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Ví dụ: Tham quan các địa điểm nổi tiếng, thưởng thức ẩm thực địa phương..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Đang tạo chuyến đi..." : "Tạo chuyến đi"}
      </button>
    </form>
  );
}
