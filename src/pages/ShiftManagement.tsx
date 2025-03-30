import React, { useState, useEffect } from "react";
import { HeaderPage } from '../components/HeaderPage/HeaderPage';

interface Shift {
  id: number;
  date: string;
  totalRevenue: number;
  invoices: Invoice[];
}

interface Invoice {
  id: number;
  time: string;
  amount: number;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch danh sách kết ca từ API
  const fetchShifts = async () => {
    try {
      const response = await fetch(
        "https://quanlyquananapi-production.up.railway.app/api/danhsachketca"
      );
      const data = await response.json();

      if (data.result === 1 && data.danhsachketca.length > 0) {
        const formattedShifts: Shift[] = data.danhsachketca.map((item: any) => ({
          id: item.kc_id,
          date: new Date(item.kc_ngaygio).toLocaleDateString("vi-VN"),
          totalRevenue: item.kc_tongtien,
          invoices: [],
        }));

        setShifts(formattedShifts);
      }
    } catch (error) {
      alert("Lỗi khi tải dữ liệu từ API!");
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Gọi API để tạo kết ca mới
  const createShift = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(
        "https://quanlyquananapi-production.up.railway.app/api/taoketca/1",
        { method: "POST" }
      );
      const data = await response.json();

      if (data.kc_id) {
        alert("Tạo kết ca thành công!");
        fetchShifts(); // Cập nhật danh sách sau khi tạo kết ca
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo kết ca!");
    }
    setIsCreating(false);
  };

  return (
    <>
      <HeaderPage />
      <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold mb-4">Quản Lý Kết Ca</h1>

        {/* Nút tạo kết ca */}
        <button
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={createShift}
          disabled={isCreating}
        >
          {isCreating ? "Đang tạo..." : "Tạo Kết Ca"}
        </button>

        {/* Danh sách kết ca */}
        <div className="w-full max-w-4xl bg-white shadow-md p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Danh sách kết ca</h2>
          {shifts.length === 0 ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex justify-between items-center p-3 border-b"
              >
                <div>
                  <p className="font-semibold">
                    Ca {shift.id} - {shift.date}
                  </p>
                  <p className="text-gray-600">
                    Doanh thu: {shift.totalRevenue.toLocaleString()} VND
                  </p>
                </div>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setSelectedShift(shift)}
                >
                  Xem chi tiết
                </button>
              </div>
            ))
          )}
        </div>

        {/* Chi tiết hóa đơn */}
        {selectedShift && (
          <div className="w-full max-w-4xl bg-white shadow-md p-4 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-3">
              Hóa đơn trong ca {selectedShift.id} - {selectedShift.date}
            </h2>
            {selectedShift.invoices.length > 0 ? (
              selectedShift.invoices.map((invoice) => (
                <div key={invoice.id} className="p-3 border-b">
                  <p className="font-semibold">Hóa đơn {invoice.id}</p>
                  <p className="text-gray-600">Thời gian: {invoice.time}</p>
                  <p className="text-gray-600">
                    Tổng tiền: {invoice.amount.toLocaleString()} VND
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Không có hóa đơn nào</p>
            )}
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => setSelectedShift(null)}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </>

  );
};

export default ShiftManagement;
